#!/usr/bin/env python3
"""Turn a local probe capture into the committed simulator fixture.

    python3 tools/make_sim_fixture.py registers_observed.json \
        tests/fixtures/futura_l_fua_p_07_20.json

`registers_observed.json` is gitignored on purpose - it is output from a
particular unit on a particular network. The fixture is the same data with the
things that identify the hardware and the network taken out, so it can live in
a public repository:

* `host` and `port` - the address of somebody's ventilation unit on their LAN.
* the MAC, both as the decoded `identity.mac` and as the three INPUT registers
  it is read from (3..5, byte-swapped). Clearing the decoded field alone would
  leave the real address sitting in the register words, which is where the
  integration actually reads it.

Everything else is kept, including the serial number: entity unique_ids are
built from it, so a fixture with a different one would not exercise the ids a
real install produces.

A script rather than a hand edit, so that re-probing a unit and refreshing the
fixture cannot quietly reintroduce what was stripped.
"""
from __future__ import annotations

import json
import pathlib
import sys

#: INPUT registers 3..5 carry the MAC as three byte-swapped words.
MAC_REGISTERS = (3, 4, 5)
PLACEHOLDER_MAC = "00:00:00:00:00:00"


def sanitise(capture: dict) -> dict:
    out = json.loads(json.dumps(capture))     # a copy, so the input is untouched
    out.pop("host", None)
    out.pop("port", None)

    identity = out.get("identity") or {}
    if "mac" in identity:
        identity["mac"] = PLACEHOLDER_MAC
    for index in MAC_REGISTERS:
        if index < len(identity.get("raw") or []):
            identity["raw"][index] = 0

    block = (out.get("input_blocks") or {}).get("0..21")
    if block and block.get("words"):
        for index in MAC_REGISTERS:
            if index < len(block["words"]):
                block["words"][index] = 0
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__.strip().splitlines()[2].strip(), file=sys.stderr)
        return 2
    source, target = pathlib.Path(argv[1]), pathlib.Path(argv[2])
    fixture = sanitise(json.loads(source.read_text()))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(fixture, indent=1, sort_keys=True) + "\n")
    print(f"{source} -> {target}: host/port dropped, MAC cleared "
          f"(identity.mac and input {', '.join(map(str, MAC_REGISTERS))})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
