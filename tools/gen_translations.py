"""Generate the `entity` block of strings.json and translations/en.json.

Every entity name in this integration is written once, next to the thing it
names: `Reg.name` in the register table, or the `name=` on a description in the
platform that builds it. Those are the English source. This writes them out as
the translation keys Home Assistant needs, so the two cannot drift -- and
`tests/test_translations.py` fails the build if the committed JSON does not match
what this produces.

Why generate rather than hand-maintain: there are nearly three hundred entities,
and the register table is already the single declarative description of all of
them. Keeping a parallel JSON of three hundred names in step by hand is the kind
of job that is correct on the day it is written and wrong a month later.

The other translation sections -- config, options, services -- are hand-written
and are preserved untouched.

Run it directly, or let the test tell you to.
"""

from __future__ import annotations

import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
COMPONENT = ROOT / "custom_components" / "jablotron_futura_modbus"

sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(HERE))


def collect() -> dict[str, dict[str, dict[str, str]]]:
    """Map entity domain -> translation key -> {"name": English}.

    Imported rather than parsed: the descriptions are Python, several are built
    in loops over the bit tables, and a regex over the source would have to
    reimplement that construction to stay right.
    """
    from custom_components.jablotron_futura_modbus import (  # noqa: PLC0415
        binary_sensor,
        button,
        number,
        sensor,
        switch,
    )
    from custom_components.jablotron_futura_modbus.registers import (  # noqa: PLC0415
        REGISTERS,
    )

    out: dict[str, dict[str, dict[str, str]]] = {}

    def add(domain: str, key: str, name: str | None) -> None:
        if not name:
            return
        bucket = out.setdefault(domain, {})
        if key in bucket and bucket[key]["name"] != name:
            raise SystemExit(
                f"{domain}.{key} is named twice and differently: "
                f"{bucket[key]['name']!r} vs {name!r}"
            )
        bucket[key] = {"name": name}

    # Sensors: register-derived, plus the derived, slot-count and valve-count
    # entities the platform adds itself.
    for reg in REGISTERS:
        if sensor._is_sensor(reg):
            add("sensor", reg.key, sensor._describe(reg).name)
    for desc in (*sensor.DERIVED, *sensor.SLOT_COUNTS):
        add("sensor", desc.key, desc.name)
    for side, label in sensor.VALVE_COUNTS:
        add("sensor", f"valve_count_{side}", label)

    for desc in binary_sensor._descriptions():
        add("binary_sensor", desc.key, desc.name)

    for desc in button.DESCRIPTIONS:
        add("button", desc.key, desc.name)

    for reg in REGISTERS:
        if number._is_number(reg):
            add("number", reg.key, reg.name or None)
        if switch._is_switch(reg):
            add("switch", reg.key, reg.name or None)

    return {domain: dict(sorted(keys.items())) for domain, keys in sorted(out.items())}


def hand_written_selects() -> dict:
    """The `select` block, which stays hand-written.

    Selects carry option labels as well as names, and those labels are states
    rather than entities -- this generator has no business inventing them.

    Taken from translations/en.json rather than from whichever file is being
    written, because the two had already drifted: strings.json carried one of the
    five selects and en.json carried all five. Reading each file's own copy would
    have preserved that drift forever, which is the problem this script exists to
    stop.
    """
    path = COMPONENT / "translations" / "en.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text()).get("entity", {}).get("select", {})


def merge(path: pathlib.Path, entity: dict, kept_select: dict) -> tuple[str, bool]:
    """Return the file's new text, and whether it differs from what is on disk.

    The hand-written sections are read back and kept; only `entity` is replaced.
    """
    existing = json.loads(path.read_text()) if path.exists() else {}
    merged = dict(existing)
    merged["entity"] = dict(entity)
    if kept_select:
        merged["entity"]["select"] = kept_select
    merged["entity"] = dict(sorted(merged["entity"].items()))
    text = json.dumps(merged, indent=2, ensure_ascii=False) + "\n"
    return text, (not path.exists() or path.read_text() != text)


def ukrainian(entity: dict) -> tuple[dict, list[str]]:
    """The Ukrainian `entity` block, and any keys it has no name for."""
    import uk_names  # noqa: PLC0415

    out: dict[str, dict[str, dict[str, str]]] = {}
    missing: list[str] = []
    for domain, keys in entity.items():
        for key in keys:
            uk = uk_names.name(key)
            if uk is None:
                missing.append(f"{domain}.{key}")
            else:
                out.setdefault(domain, {})[key] = {"name": uk}
    return {d: dict(sorted(k.items())) for d, k in sorted(out.items())}, sorted(missing)


def main() -> int:
    entity = collect()
    selects = hand_written_selects()
    total = sum(len(v) for v in entity.values())
    changed = []
    for name in ("strings.json", "translations/en.json"):
        path = COMPONENT / name
        text, differs = merge(path, entity, selects)
        if differs:
            path.write_text(text)
            changed.append(name)
    uk, missing = ukrainian(entity)
    if missing:
        print(f"Ukrainian: {len(missing)} keys have no name yet:")
        for key in missing[:20]:
            print(f"    {key}")
        if len(missing) > 20:
            print(f"    ... and {len(missing) - 20} more")
    else:
        path = COMPONENT / "translations" / "uk.json"
        existing = json.loads(path.read_text()) if path.exists() else {}
        merged = dict(existing)
        merged["entity"] = uk
        text = json.dumps(merged, indent=2, ensure_ascii=False) + "\n"
        if not path.exists() or path.read_text() != text:
            path.write_text(text)
            changed.append("translations/uk.json")

    print(f"{total} entity names across {len(entity)} domains:")
    for domain, keys in entity.items():
        print(f"  {domain:16} {len(keys)}  uk: {len(uk.get(domain, {}))}")
    print("wrote: " + (", ".join(changed) if changed else "nothing, already current"))
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
