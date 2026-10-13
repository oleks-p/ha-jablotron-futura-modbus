#!/usr/bin/env python3
"""Read-only (by default) Modbus TCP probe for Jablotron Futura L/M.

Establishes empirically which registers exist on a given firmware, which
peripherals are connected, and where the safe block boundaries are. Emits
``registers_observed.json`` for use as a test fixture.

Uses raw sockets so it has no dependencies -- it can run before pymodbus is
installed, and on the HA host itself.

    python3 tools/probe_futura.py --host 192.0.2.10
    python3 tools/probe_futura.py --host 192.0.2.10 --verify-writes

Writes are OFF unless --verify-writes is passed. Every write test snapshots the
target register first and restores it afterwards.
"""
from __future__ import annotations

import argparse
import contextlib
import json
import socket
import struct
import sys
import time

FC_READ_HOLDING = 3
FC_READ_INPUT = 4
FC_WRITE_SINGLE = 6
FC_WRITE_MULTI = 16

EXCEPTIONS = {
    1: "ILLEGAL_FUNCTION",
    2: "ILLEGAL_DATA_ADDRESS",
    3: "ILLEGAL_DATA_VALUE",
    4: "SLAVE_DEVICE_FAILURE",
    5: "ACKNOWLEDGE",
    6: "SLAVE_DEVICE_BUSY",
    8: "MEMORY_PARITY_ERROR",
    10: "GATEWAY_PATH_UNAVAILABLE",
    11: "GATEWAY_TARGET_NO_RESPONSE",
}


class ProbeError(Exception):
    """A transport-level failure that should abort the probe."""


class Client:
    """Minimal Modbus TCP client on a single reused socket."""

    def __init__(self, host: str, port: int = 502, unit: int = 1, timeout: float = 5.0):
        self.host, self.port, self.unit, self.timeout = host, port, unit, timeout
        self._sock: socket.socket | None = None
        self._tid = 0

    def connect(self) -> None:
        self.close()
        self._sock = socket.create_connection((self.host, self.port), timeout=self.timeout)

    def close(self) -> None:
        if self._sock is not None:
            with contextlib.suppress(OSError):
                self._sock.close()
            self._sock = None

    def _recv_exactly(self, n: int) -> bytes:
        assert self._sock is not None
        buf = b""
        while len(buf) < n:
            chunk = self._sock.recv(n - len(buf))
            if not chunk:
                raise ProbeError("connection closed by peer")
            buf += chunk
        return buf

    def _txn(self, pdu: bytes, timeout: float) -> tuple[str, object]:
        if self._sock is None:
            self.connect()
        assert self._sock is not None
        self._tid = (self._tid + 1) & 0xFFFF
        frame = struct.pack(">HHHB", self._tid, 0, len(pdu) + 1, self.unit) + pdu
        try:
            self._sock.sendall(frame)
            self._sock.settimeout(timeout)
            header = self._recv_exactly(8)
            _tid, _pid, length, _unit, fc = struct.unpack(">HHHBB", header)
            body = self._recv_exactly(length - 2) if length > 2 else b""
        except TimeoutError:
            return ("TIMEOUT", None)
        except (OSError, ProbeError) as exc:
            self.close()
            return ("DROPPED", type(exc).__name__)
        if fc & 0x80:
            return ("EXCEPTION", EXCEPTIONS.get(body[0], f"exception_{body[0]}"))
        return ("OK", body)

    def read(self, kind: str, address: int, count: int, timeout: float = 3.0):
        """Read `count` registers. Returns (status, list[int] | detail)."""
        fc = FC_READ_INPUT if kind == "input" else FC_READ_HOLDING
        status, body = self._txn(struct.pack(">BHH", fc, address, count), timeout)
        if status != "OK":
            return (status, body)
        assert isinstance(body, bytes)
        nbytes = body[0]
        words = list(struct.unpack(">" + "H" * (nbytes // 2), body[1 : 1 + nbytes]))
        return ("OK", words)

    def write_single(self, address: int, value: int, timeout: float = 3.0):
        status, body = self._txn(
            struct.pack(">BHH", FC_WRITE_SINGLE, address, value & 0xFFFF), timeout
        )
        return (status, body if status != "OK" else value)

    def write_multi(self, address: int, values: list[int], timeout: float = 3.0):
        pdu = struct.pack(
            ">BHHB", FC_WRITE_MULTI, address, len(values), len(values) * 2
        ) + b"".join(struct.pack(">H", v & 0xFFFF) for v in values)
        status, body = self._txn(pdu, timeout)
        return (status, body if status != "OK" else values)


# --------------------------------------------------------------------------
# decoding helpers -- these mirror registers.py and are asserted by the tests
# --------------------------------------------------------------------------


def u32_lo_first(words: list[int], index: int = 0) -> int:
    """Futura u32: first register holds the LOW 16 bits."""
    return (words[index + 1] << 16) | words[index]


def mac_from_words(words: list[int]) -> str:
    """Futura MAC array: bytes are little-endian *within* each register."""
    octets: list[int] = []
    for word in words:
        octets.append(word & 0xFF)
        octets.append(word >> 8)
    return ":".join(f"{o:02x}" for o in octets)


def firmware_from_words(words: list[int]) -> str:
    """Futura firmware: low word packs major/minor as two bytes."""
    return f"FUA.P.{words[0] >> 8:02d}.{words[0] & 0xFF:02d}"


def bit_list(value: int, width: int = 32) -> list[int]:
    return [b for b in range(width) if value >> b & 1]


# --------------------------------------------------------------------------
# probe stages
# --------------------------------------------------------------------------

# Contiguous, gap-free candidate blocks derived from FU_DOC_TCP_CS40.pdf.
INPUT_BLOCKS = [
    (0, 22, "identity + status"),
    (30, 9, "temperatures, humidities, outdoor NTC"),
    (40, 13, "performance, fans, inputs, RTC battery"),
    (60, 16, "modbus stats + peripheral presence"),
    (80, 1, "vzv identify"),
    (100, 15, "wall UI controllers 1-3"),
    (115, 40, "wall CO2 sensors 1-8"),
]
HOLDING_BLOCKS = [
    (0, 18, "functions, setpoints, feature enables"),
    (20, 4, "VZV zone configuration"),
]
# Known-bad reads: these MUST fail, and the integration must never issue them.
NEGATIVE_BLOCKS = [
    ("holding", 0, 24, "holding 0..23 spans the 18-19 gap"),
    ("input", 14, 31, "input 14..44 spans the 22-29 and 39 gaps"),
    ("input", 160, 10, "ALFA slot is 10 wide but only 6 registers exist"),
]


def probe_reads(client: Client, out: dict) -> None:
    print("== documented input blocks ==")
    out["input_blocks"] = {}
    for address, count, label in INPUT_BLOCKS:
        status, result = client.read("input", address, count)
        key = f"{address}..{address + count - 1}"
        out["input_blocks"][key] = {"status": status, "label": label,
                                    "words": result if status == "OK" else None,
                                    "detail": None if status == "OK" else result}
        print(f"  input {key:12} {status:9} {label}")
        if status == "OK":
            print(f"      {result}")

    print("\n== documented holding blocks ==")
    out["holding_blocks"] = {}
    for address, count, label in HOLDING_BLOCKS:
        status, result = client.read("holding", address, count)
        key = f"{address}..{address + count - 1}"
        out["holding_blocks"][key] = {"status": status, "label": label,
                                      "words": result if status == "OK" else None,
                                      "detail": None if status == "OK" else result}
        print(f"  holding {key:10} {status:9} {label}")
        if status == "OK":
            print(f"      {result}")

    print("\n== negative controls (these MUST fail) ==")
    out["negative_blocks"] = {}
    for kind, address, count, why in NEGATIVE_BLOCKS:
        status, result = client.read(kind, address, count)
        ok = status != "OK"
        out["negative_blocks"][f"{kind}:{address}..{address + count - 1}"] = {
            "status": status, "expected_failure": True, "behaved": ok, "why": why}
        mark = "as expected" if ok else "!! UNEXPECTEDLY SUCCEEDED"
        print(f"  {kind} {address}..{address + count - 1}: {status} -- {mark} ({why})")
        if status == "DROPPED":
            client.connect()


def probe_identity(client: Client, out: dict) -> None:
    print("\n== identity ==")
    status, words = client.read("input", 0, 14)
    if status != "OK":
        print(f"  identity read failed: {status} {words}")
        return
    ident = {
        "device_id": words[0],
        "serial_number": u32_lo_first(words, 1),
        "mac": mac_from_words(words[3:6]),
        "hw_revision": u32_lo_first(words, 6),
        "firmware": firmware_from_words(words[8:10]),
        "firmware_marker": words[9],
        "build_number": u32_lo_first(words, 10),
        "regmap_version": u32_lo_first(words, 12),
        "raw": words,
    }
    out["identity"] = ident
    for key in ("device_id", "serial_number", "mac", "hw_revision", "firmware",
                "firmware_marker", "build_number", "regmap_version"):
        print(f"  {key:16} = {ident[key]}")
    major, minor = words[8] >> 8, words[8] & 0xFF
    if (major, minor) < (5, 0):
        print(f"  !! firmware {major}.{minor} is below the FUA.P.05.00 floor")


def probe_peripherals(client: Client, out: dict) -> None:
    print("\n== peripherals ==")
    status, words = client.read("input", 60, 16)
    if status != "OK":
        print(f"  presence read failed: {status} {words}")
        return
    base = 60
    ui_bits = words[66 - base]
    sens = u32_lo_first(words, 67 - base)
    valve_supply = u32_lo_first(words, 70 - base)
    valve_exhaust = u32_lo_first(words, 72 - base)
    button_bits = words[74 - base]
    alfa_bits = words[75 - base]

    def topology(mask: int, unit_base: int) -> list[dict]:
        return [
            {"bit": b, "zone": b % 8 + 1, "valve": b // 8 + 1, "rs485_unit_id": unit_base + b}
            for b in bit_list(mask)
        ]

    peripherals = {
        "stat_reads": u32_lo_first(words, 0),
        "stat_writes": u32_lo_first(words, 2),
        "stat_fails": u32_lo_first(words, 4),
        "wall_ui_slots": [b + 1 for b in bit_list(ui_bits, 16)],
        "wall_sensor_slots": [b + 1 for b in bit_list(sens)],
        "coolbreeze": bool(words[69 - base]),
        "alfa_slots": [b + 1 for b in bit_list(alfa_bits, 16)],
        "boost_button_slots": [b + 1 for b in bit_list(button_bits, 16)],
        "valve_supply": topology(valve_supply, 64),
        "valve_exhaust": topology(valve_exhaust, 96),
    }
    out["peripherals"] = peripherals
    print(f"  wall UI slots      : {peripherals['wall_ui_slots']}")
    print(f"  wall sensor slots  : {peripherals['wall_sensor_slots']}")
    print(f"  ALFA slots         : {peripherals['alfa_slots']}")
    print(f"  boost buttons      : {peripherals['boost_button_slots']}")
    print(f"  CoolBreeze         : {peripherals['coolbreeze']}")
    print(f"  supply valves ({len(peripherals['valve_supply']):2}) : "
          + ", ".join(f"z{v['zone']}/v{v['valve']}@{v['rs485_unit_id']}"
                      for v in peripherals["valve_supply"]))
    print(f"  exhaust valves ({len(peripherals['valve_exhaust']):2}): "
          + ", ".join(f"z{v['zone']}/v{v['valve']}@{v['rs485_unit_id']}"
                      for v in peripherals["valve_exhaust"]))

    # Per-slot peripheral payloads.
    out["wall_ui"], out["wall_sensors"], out["alfa"] = {}, {}, {}
    if peripherals["wall_ui_slots"]:
        st, w = client.read("input", 100, 15)
        if st == "OK":
            for slot in peripherals["wall_ui_slots"]:
                o = (slot - 1) * 5
                out["wall_ui"][slot] = {"mb_address": w[o], "options": w[o + 1],
                                        "co2": w[o + 2], "temp": w[o + 3] / 10,
                                        "humi": w[o + 4] / 10}
    if peripherals["wall_sensor_slots"]:
        st, w = client.read("input", 115, 40)
        if st == "OK":
            for slot in peripherals["wall_sensor_slots"]:
                o = (slot - 1) * 5
                out["wall_sensors"][slot] = {"mb_address": w[o], "options": w[o + 1],
                                            "co2": w[o + 2], "temp": w[o + 3] / 10,
                                            "humi": w[o + 4] / 10}
                print(f"  wall sensor slot {slot}: addr={w[o]} co2={w[o + 2]}ppm "
                      f"t={w[o + 3] / 10}C rh={w[o + 4] / 10}%")
    for slot in peripherals["alfa_slots"]:
        addr = 160 + (slot - 1) * 10
        st, w = client.read("input", addr, 6)
        if st == "OK":
            # Record the raw words too: the test fixture rebuilds a fake device
            # from these blocks, and decoded-only values cannot do that.
            out.setdefault("input_blocks", {})[f"{addr}..{addr + 5}"] = {
                "status": "OK", "label": f"ALFA slot {slot}", "words": w,
                "detail": None,
            }
            out["alfa"][slot] = {"mb_address": w[0], "options": w[1], "co2": w[2],
                                 "temp": w[3] / 10, "humi": w[4] / 10,
                                 "ntc_temp": w[5] / 10}
            print(f"  ALFA slot {slot}: addr={w[0]} co2={w[2]}ppm t={w[3] / 10}C "
                  f"rh={w[4] / 10}%")


def probe_optional_ranges(client: Client, out: dict) -> None:
    """Correction, external-sensor, external-button and service registers."""
    print("\n== optional / service ranges ==")
    ranges = [
        ("holding", 100, 15, "wall UI temp corrections"),
        ("holding", 115, 40, "wall sensor temp corrections"),
        ("holding", 160, 38, "ALFA temp corrections"),
        ("holding", 900, 1, "access_code"),
        ("holding", 920, 1, "user_password"),
        ("holding", 922, 1, "password_timeout"),
    ]
    for i in range(8):
        ranges.append(("holding", 300 + i * 10, 6, f"external sensor {i + 1}"))
    for i in range(8):
        ranges.append(("holding", 400 + i * 10, 4, f"external button {i + 1}"))

    out["optional_ranges"] = {}
    for kind, address, count, label in ranges:
        status, result = client.read(kind, address, count)
        out["optional_ranges"][f"{kind}:{address}..{address + count - 1}"] = {
            "status": status, "label": label,
            "words": result if status == "OK" else None,
            "detail": None if status == "OK" else result}
        detail = result if status == "OK" else f"({result})"
        print(f"  {kind} {address:4}+{count:<3} {status:9} {label:32} {detail}")
        if status == "DROPPED":
            client.connect()


def probe_composite_boundaries(client: Client, out: dict) -> None:
    """Discover composite boundaries by finding which read *counts* succeed.

    A read that ends in the middle of a uint32/array returns
    ILLEGAL_DATA_ADDRESS, so the set of accepted counts is exactly the set of
    composite boundaries. This is not monotonic -- count 17 fails while 18
    succeeds -- so it must be scanned linearly, never binary-searched.
    """
    print("\n== composite boundaries (accepted read counts) ==")
    out["accepted_counts"] = {}
    for kind, address, limit, expected in (("input", 0, 24, [1, 3, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22]),
                                           ("holding", 0, 20, None)):
        accepted = []
        for count in range(1, limit + 1):
            status, _ = client.read(kind, address, count, timeout=1.0)
            if status == "DROPPED":
                client.connect()
                continue
            if status == "OK":
                accepted.append(count)
        out["accepted_counts"][f"{kind}@{address}"] = accepted
        print(f"  {kind} @{address}: {accepted}")
        if expected is not None:
            match = "matches the documented composite layout" if accepted == expected \
                else f"!! DIFFERS from expected {expected}"
            print(f"      {match}")


def probe_corrections(client: Client, out: dict) -> None:
    """Temperature-correction registers, read individually.

    These are strided (100/105/110, 115/120/.../150, 160/165/.../195 and
    162/167/.../197) with undocumented gaps between them, so a contiguous
    block read fails even though every individual register exists.
    """
    print("\n== temperature corrections (individual reads) ==")
    groups = {
        "wall_ui_temp_corr": [100, 105, 110],
        "wall_sensor_temp_corr": list(range(115, 151, 5)),
        "alfa_temp_corr": list(range(160, 196, 5)),
        "alfa_ntc_temp_corr": list(range(162, 198, 5)),
    }
    out["corrections"] = {}
    for name, addresses in groups.items():
        values = {}
        for address in addresses:
            status, result = client.read("holding", address, 1, timeout=1.0)
            if status == "DROPPED":
                client.connect()
                continue
            if status == "OK":
                raw = result[0]
                values[address] = raw - 0x10000 if raw & 0x8000 else raw
        out["corrections"][name] = values
        rendered = ", ".join(f"{a}={v / 10:+.1f}C" for a, v in values.items())
        print(f"  {name:22} {rendered}")

DOCUMENTED_INPUT = (set(range(0, 22)) | set(range(30, 39)) | set(range(40, 53))
                    | set(range(60, 76)) | {80} | set(range(100, 115))
                    | set(range(115, 155))
                    | {a for s in range(8) for a in range(160 + s * 10, 166 + s * 10)})
DOCUMENTED_HOLDING = (set(range(0, 18)) | set(range(20, 24))
                      | {100, 105, 110} | set(range(115, 151, 5))
                      | set(range(160, 196, 5)) | set(range(162, 198, 5))
                      | {a for s in range(8) for a in range(300 + s * 10, 306 + s * 10)}
                      | {a for s in range(8) for a in range(400 + s * 10, 404 + s * 10)}
                      | {900, 920, 922})


def probe_explore(client: Client, out: dict, limit: int, targets: list[int]) -> None:
    """Sweep single registers to find addresses the official map omits.

    The ALFA wall display shows values (e.g. a CoolBreeze cooling percentage)
    that FU_DOC_TCP_CS40.pdf has no register for, so anything that answers
    outside the documented set is worth recording. Single-register reads of a
    composite return ILLEGAL_DATA_ADDRESS, so a failure here is not proof the
    address is unused -- only a success is informative.
    """
    print(f"\n== exploratory sweep for undocumented registers (0..{limit}) ==")
    out["undocumented"] = {"input": {}, "holding": {}}
    hits = {"input": [], "holding": []}
    for kind, documented in (("input", DOCUMENTED_INPUT), ("holding", DOCUMENTED_HOLDING)):
        for address in range(limit + 1):
            if address in documented:
                continue
            status, result = client.read(kind, address, 1, timeout=0.6)
            if status == "DROPPED":
                client.connect()
                continue
            if status == "OK":
                value = result[0]
                out["undocumented"][kind][address] = value
                hits[kind].append((address, value))
        found = hits[kind]
        print(f"  {kind}: {len(found)} undocumented addresses answered")
        for address, value in found:
            flag = "  <== MATCHES TARGET" if value in targets else ""
            print(f"    {kind} {address:4} = {value}{flag}")
    out["explore_targets"] = targets


def probe_writes(client: Client, out: dict) -> None:
    """Reversible write tests. Only runs with --verify-writes."""
    print("\n== WRITE TESTS (each reverted immediately) ==")
    results: dict[str, dict] = {}

    def snapshot(kind: str, address: int, count: int):
        status, words = client.read(kind, address, count)
        return words if status == "OK" else None

    # 1) FC6 to the boost timer -- the fans will audibly ramp up briefly.
    before = snapshot("holding", 1, 1)
    if before is not None:
        st, _ = client.write_single(1, 60)
        time.sleep(1.0)
        mid = snapshot("holding", 1, 1)
        client.write_single(1, before[0])
        time.sleep(0.5)
        after = snapshot("holding", 1, 1)
        results["fc6_boost_timer"] = {"write_status": st, "before": before,
                                      "after_write": mid, "restored": after}
        print(f"  FC6 holding 1: {st}  {before} -> {mid} -> restored {after}")

    # 2) FC6 rewriting the current ventilation mode (no state change).
    before = snapshot("holding", 0, 1)
    if before is not None:
        st, _ = client.write_single(0, before[0])
        results["fc6_mode_noop"] = {"write_status": st, "value": before}
        print(f"  FC6 holding 0 (same value): {st}")

    # 3) FC16 to the away timestamp -- settles word order AND local-vs-UTC.
    before = snapshot("holding", 6, 4)
    if before is not None:
        now = int(time.time())
        st, _ = client.write_multi(6, [now & 0xFFFF, now >> 16])
        time.sleep(0.5)
        mid = snapshot("holding", 6, 2)
        readback = u32_lo_first(mid) if mid else None
        client.write_multi(6, list(before))
        results["fc16_away_begin"] = {
            "write_status": st, "sent_unix_utc": now, "readback_lo_first": readback,
            "delta_seconds": None if readback is None else readback - now,
            "restored": snapshot("holding", 6, 4)}
        print(f"  FC16 holding 6-7: {st}  sent {now} -> read {readback} "
              f"(delta {None if readback is None else readback - now}s)")
        print("      delta ~0 => unit stores UTC; delta ~timezone offset => local time")

    # 4) External sensor presence -- settles the forum's "these don't work" claim.
    before = snapshot("holding", 300, 1)
    if before is not None:
        st, _ = client.write_single(300, 1)
        time.sleep(0.5)
        mid = snapshot("holding", 300, 1)
        client.write_single(300, before[0])
        results["ext_sens_present"] = {"write_status": st, "before": before,
                                       "after_write": mid, "sticks": mid != before}
        print(f"  FC6 holding 300: {st}  {before} -> {mid}  "
              f"{'STICKS' if mid != before else 'ignored'}")

    # 5) Service register -- expected to be refused.
    st, detail = client.write_single(900, 0)
    results["access_code"] = {"write_status": st, "detail": str(detail)}
    print(f"  FC6 holding 900 (access_code): {st} {detail}")

    out["write_tests"] = results


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--host", required=True)
    ap.add_argument("--port", type=int, default=502)
    ap.add_argument("--unit", type=int, default=1,
                    help="Modbus unit id; the Futura only answers 1")
    ap.add_argument("--out", default="registers_observed.json")
    ap.add_argument("--verify-writes", action="store_true",
                    help="run reversible write tests (the fans will ramp briefly)")
    ap.add_argument("--explore", type=int, metavar="MAX_ADDR", default=None,
                    help="sweep single registers up to MAX_ADDR for undocumented values")
    ap.add_argument("--target", type=int, action="append", default=[],
                    help="flag undocumented registers holding this value "
                         "(e.g. --target 63 for the ALFA cooling percentage)")
    ap.add_argument("--scan-bus-units", action="store_true",
                    help="check whether the unit bridges RS-485 peripherals over TCP")
    args = ap.parse_args()

    out: dict = {"host": args.host, "port": args.port, "unit": args.unit,
                 "probed_at_unix": int(time.time())}
    client = Client(args.host, args.port, args.unit)
    try:
        client.connect()
    except OSError as exc:
        print(f"cannot connect to {args.host}:{args.port}: {exc}", file=sys.stderr)
        return 1

    try:
        probe_identity(client, out)
        probe_reads(client, out)
        probe_peripherals(client, out)
        probe_optional_ranges(client, out)
        probe_corrections(client, out)
        probe_composite_boundaries(client, out)
        if args.explore is not None:
            probe_explore(client, out, args.explore, args.target)
        if args.scan_bus_units:
            scan_bus_units(args, out)
        if args.verify_writes:
            probe_writes(client, out)
    finally:
        client.close()

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2, sort_keys=True)
        fh.write("\n")
    print(f"\nwrote {args.out}")
    return 0


def scan_bus_units(args, out: dict) -> None:
    """Confirm the TCP server does not bridge internal RS-485 unit ids.

    Uses a fresh connection per unit id: addressing a non-1 unit on an
    established socket makes the Futura drop the connection.
    """
    print("\n== RS-485 bridging check (fresh connection per unit id) ==")
    candidates = ([("supply damper", u) for u in range(64, 88)]
                  + [("exhaust damper", u) for u in range(96, 120)]
                  + [("wall panel", u) for u in range(9, 14)]
                  + [("alfa", 16)]
                  + [("boost button", u) for u in range(32, 35)])
    reachable = []
    for label, unit in candidates:
        probe = Client(args.host, args.port, unit, timeout=1.2)
        try:
            probe.connect()
        except OSError:
            continue
        status, result = probe.read("holding", 102, 1, timeout=1.2)
        probe.close()
        if status == "OK":
            reachable.append({"unit": unit, "label": label, "position": result[0]})
            print(f"  unit {unit:3} ({label}): position={result[0]}")
    out["rs485_bridged_units"] = reachable
    if reachable:
        print(f"  -> {len(reachable)} peripherals reachable over TCP; damper positions "
              "ARE available without extra hardware")
    else:
        print("  -> no peripheral unit ids answered: the unit is not a Modbus gateway, "
              "so damper positions need a separate RS-485 sniffer (Phase 6)")


if __name__ == "__main__":
    raise SystemExit(main())
