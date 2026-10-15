#!/usr/bin/env python3
"""A simulated Futura on Modbus TCP, for tests and for a dev Home Assistant.

Serve the reference unit's capture, no hardware:

    python3 tools/sim_futura.py --capture registers_observed.json --listen 0.0.0.0:5020

then add the integration with host = this machine, port 5020, unit id 1.

Why this exists. Every question about "does a clean install produce the right
entities" needed the real unit, and the real unit is in a house, on a bus that
takes ONE client. So the install path could only be checked by evicting the
occupants' ventilation from its own controller. This answers those questions
without leaving the laptop.

What it reproduces, because these are the behaviours that actually cost time:

* **One socket.** The vendor's spec allows a single TCP client, and a second
  one does not queue - it takes over and the first stops being answered. Months
  of "the integration goes unavailable at random" was this, with an i3 bridge
  as the other client. A simulator that cheerfully accepted ten clients would
  hide the single thing most worth testing against.
* **Reads that span a gap are refused.** The register map has holes - holding
  18..19, input 22..29, input 39 - and a read crossing one returns
  ILLEGAL_DATA_ADDRESS for the whole request rather than padding it. That is
  why the integration reads in the blocks it does, and a simulator that served
  a flat array would let a wrong block size pass here and fail in the field.
* **Silence on demand** (``--drop-every``). A request the unit simply does not
  answer is the failure the reconnect logic exists for, and the one that is
  impossible to provoke on real hardware at a time of your choosing.

The capture is the source of truth for all of it: `input_blocks` and
`holding_blocks` give the words, `negative_blocks` records which reads the unit
refused and why, and `optional_ranges` the addresses it answers only when the
matching peripheral is fitted.
"""
from __future__ import annotations

import argparse
import contextlib
import json
import logging
import pathlib
import socketserver
import struct
import threading

_LOG = logging.getLogger("sim_futura")

READ_HOLDING = 3
READ_INPUT = 4
WRITE_SINGLE = 6
WRITE_MULTIPLE = 16

ILLEGAL_FUNCTION = 1
ILLEGAL_DATA_ADDRESS = 2

MAX_READ_WORDS = 125


class Unit:
    """The register map, and the rules about which reads are answered."""

    def __init__(self, input_regs: dict[int, int], holding: dict[int, int]) -> None:
        self.input = input_regs
        self.holding = holding
        self.reads = 0
        self.writes = 0
        self.refusals = 0

    @classmethod
    def from_capture(cls, capture: dict) -> Unit:
        def words(blocks: dict) -> dict[int, int]:
            out: dict[int, int] = {}
            for span, block in (blocks or {}).items():
                if block.get("words") is None:
                    continue            # the unit refused this one; keep the hole
                start = int(span.split("..")[0])
                for offset, word in enumerate(block["words"]):
                    out[start + offset] = int(word) & 0xFFFF
            return out

        return cls(words(capture.get("input_blocks")),
                   words(capture.get("holding_blocks")))

    def table(self, function: int) -> dict[int, int] | None:
        if function in (READ_HOLDING, WRITE_SINGLE, WRITE_MULTIPLE):
            return self.holding
        if function == READ_INPUT:
            return self.input
        return None

    def read(self, function: int, address: int, count: int) -> list[int]:
        """Words, or ILLEGAL_DATA_ADDRESS for a request that crosses a hole.

        The whole request fails, not the missing part of it. A unit that padded
        the hole instead would let a wrong block size look correct here and come
        apart against the real one.
        """
        table = self.table(function)
        if table is None:
            raise Exception_(ILLEGAL_FUNCTION)
        if count < 1 or count > MAX_READ_WORDS:
            raise Exception_(ILLEGAL_DATA_ADDRESS)
        missing = [a for a in range(address, address + count) if a not in table]
        if missing:
            self.refusals += 1
            _LOG.debug("refusing %s %d..%d: %d address(es) do not exist, first %d",
                       "holding" if function == READ_HOLDING else "input",
                       address, address + count - 1, len(missing), missing[0])
            raise Exception_(ILLEGAL_DATA_ADDRESS)
        self.reads += 1
        return [table[a] for a in range(address, address + count)]

    def write(self, address: int, values: list[int]) -> None:
        for offset in range(len(values)):
            if address + offset not in self.holding:
                raise Exception_(ILLEGAL_DATA_ADDRESS)
        for offset, value in enumerate(values):
            self.holding[address + offset] = value & 0xFFFF
        self.writes += 1


class Exception_(Exception):
    """A Modbus exception response, by code."""

    def __init__(self, code: int) -> None:
        super().__init__(f"modbus exception {code}")
        self.code = code


def handle(unit: Unit, pdu: bytes) -> bytes:
    """One request PDU to one response PDU."""
    function = pdu[0]
    try:
        if function in (READ_HOLDING, READ_INPUT):
            address, count = struct.unpack(">HH", pdu[1:5])
            words = unit.read(function, address, count)
            return bytes([function, len(words) * 2]) + b"".join(
                struct.pack(">H", w) for w in words)
        if function == WRITE_SINGLE:
            address, value = struct.unpack(">HH", pdu[1:5])
            unit.write(address, [value])
            return pdu[:5]                      # echo, as the protocol requires
        if function == WRITE_MULTIPLE:
            address, count, _nbytes = struct.unpack(">HHB", pdu[1:6])
            values = list(struct.unpack(f">{count}H", pdu[6:6 + count * 2]))
            unit.write(address, values)
            return struct.pack(">BHH", function, address, count)
        raise Exception_(ILLEGAL_FUNCTION)
    except Exception_ as exc:
        return bytes([function | 0x80, exc.code])


class Server(socketserver.ThreadingTCPServer):
    """Modbus TCP, with the unit's one-client rule.

    `allow_reuse_address` only so a restarted simulator can rebind the port;
    it says nothing about how many clients are served.
    """

    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, address, unit: Unit, *, sockets: int = 1,
                 drop_every: int = 0) -> None:
        self.unit = unit
        self.sockets = sockets
        self.drop_every = drop_every
        self._requests = 0
        self._clients: list[socketserver.BaseRequestHandler] = []
        self._lock = threading.Lock()
        super().__init__(address, Handler)

    def admit(self, handler) -> list:
        """Register a client and return whoever has to go to make room.

        Eviction rather than refusal, because that is what the unit does: a new
        client connects fine and the one already there simply stops being
        answered. Refusing instead would make the second client's failure
        obvious, which is the opposite of the bug this reproduces.
        """
        with self._lock:
            self._clients.append(handler)
            evicted = self._clients[:-self.sockets] if self.sockets else []
            self._clients = self._clients[len(evicted):]
            return evicted

    def depart(self, handler) -> None:
        with self._lock:
            if handler in self._clients:
                self._clients.remove(handler)

    def should_drop(self) -> bool:
        if not self.drop_every:
            return False
        with self._lock:
            self._requests += 1
            return self._requests % self.drop_every == 0


class Handler(socketserver.BaseRequestHandler):
    def setup(self) -> None:
        self.evicted = False
        for other in self.server.admit(self):
            other.evicted = True
            _LOG.info("a new client took the socket; %s is no longer answered",
                      other.client_address)

    def handle(self) -> None:
        _LOG.info("client %s connected", self.client_address)
        self.request.settimeout(300)
        buffer = b""
        while True:
            try:
                chunk = self.request.recv(4096)
            except OSError:
                break
            if not chunk:
                break
            buffer += chunk
            while len(buffer) >= 8:
                txn, proto, length, unit_id = struct.unpack(">HHHB", buffer[:7])
                if len(buffer) < 6 + length:
                    break
                pdu, buffer = buffer[7:6 + length], buffer[6 + length:]
                if self.evicted:
                    # Evicted: the socket stays open and nothing comes back,
                    # which is exactly how it looks from the other end.
                    _LOG.debug("ignoring a request from an evicted client")
                    continue
                if self.server.should_drop():
                    _LOG.info("dropping request %#x on purpose", txn)
                    continue
                response = handle(self.server.unit, pdu)
                self.request.sendall(
                    struct.pack(">HHHB", txn, proto, len(response) + 1, unit_id)
                    + response)

    def finish(self) -> None:
        self.server.depart(self)
        _LOG.info("client %s gone", self.client_address)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--capture", default="registers_observed.json",
                    help="the probe capture to serve")
    ap.add_argument("--listen", default="0.0.0.0:5020", help="host:port")
    ap.add_argument("--sockets", type=int, default=1,
                    help="how many clients are answered at once; the real unit "
                         "allows 1 and a further client evicts the previous")
    ap.add_argument("--drop-every", type=int, default=0, metavar="N",
                    help="leave every Nth request unanswered, to exercise the "
                         "reconnect path")
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args(argv)

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(asctime)s %(message)s")
    capture = json.loads(pathlib.Path(args.capture).read_text())
    unit = Unit.from_capture(capture)
    host, _, port = args.listen.rpartition(":")
    server = Server((host or "0.0.0.0", int(port)), unit,
                    sockets=args.sockets, drop_every=args.drop_every)
    ident = capture.get("identity") or {}
    _LOG.info("serving %d input and %d holding registers on %s "
              "(firmware %s, %d sockets)", len(unit.input), len(unit.holding),
              args.listen, ident.get("firmware"), args.sockets)
    with server, contextlib.suppress(KeyboardInterrupt):
        server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
