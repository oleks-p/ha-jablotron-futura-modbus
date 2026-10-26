"""The shipped translations must match the entities the integration creates.

Two failure modes this guards against, both of which are silent in Home
Assistant -- a missing key just shows the fallback, so nobody notices until a
user in another language reports a half-translated device:

* a new entity added without a translation key, which would appear named only in
  English however good the other translation files are;
* an English name edited in the register table without regenerating the JSON, so
  strings.json and the table disagree about what the entity is called.
"""

from __future__ import annotations

import json
import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
COMPONENT = ROOT / "custom_components" / "jablotron_futura_modbus"
sys.path.insert(0, str(ROOT / "tools"))


def _load(name: str) -> dict:
    return json.loads((COMPONENT / name).read_text())


@pytest.fixture(name="generated")
def generated_fixture() -> dict:
    import gen_translations

    return gen_translations.collect()


def test_strings_and_en_agree_on_entities():
    """English is shipped twice; the two copies must say the same thing.

    They had already drifted once: strings.json carried one of the five selects
    and translations/en.json carried all five.
    """
    assert _load("strings.json")["entity"] == _load("translations/en.json")["entity"]


def test_generated_names_are_committed(generated):
    """Regenerating must be a no-op. If this fails, run tools/gen_translations.py."""
    shipped = _load("strings.json")["entity"]
    for domain, keys in generated.items():
        assert domain in shipped, f"no {domain} block in strings.json"
        missing = set(keys) - set(shipped[domain])
        assert not missing, (
            f"{domain}: {len(missing)} entities have no translation, "
            f"e.g. {sorted(missing)[:5]} -- run tools/gen_translations.py"
        )
        wrong = {
            k: (keys[k]["name"], shipped[domain][k]["name"])
            for k in keys
            if shipped[domain][k]["name"] != keys[k]["name"]
        }
        assert not wrong, (
            f"{domain}: names differ from the source, e.g. "
            f"{dict(list(wrong.items())[:3])} -- run tools/gen_translations.py"
        )


def test_no_orphan_translations(generated):
    """A translation for an entity that no longer exists is dead weight."""
    shipped = _load("strings.json")["entity"]
    for domain, keys in shipped.items():
        if domain == "select":
            # Hand-written: its keys are set on the descriptions in select.py
            # rather than derived from the register table.
            continue
        orphans = set(keys) - set(generated.get(domain, {}))
        assert not orphans, f"{domain}: translations with no entity: {sorted(orphans)}"


def test_every_description_carries_a_translation_key():
    """`name=` alone is not translatable, whatever the JSON contains."""
    from custom_components.jablotron_futura_modbus import (
        binary_sensor,
        button,
        number,
        sensor,
        switch,
    )
    from custom_components.jablotron_futura_modbus.registers import REGISTERS

    groups: list[tuple[str, list]] = [
        ("sensor", [sensor._describe(r) for r in REGISTERS if sensor._is_sensor(r)]),
        ("sensor derived", list(sensor.DERIVED)),
        ("sensor slot counts", list(sensor.SLOT_COUNTS)),
        ("binary_sensor", binary_sensor._descriptions()),
        ("button", list(button.DESCRIPTIONS)),
    ]
    for label, descriptions in groups:
        for desc in descriptions:
            assert desc.translation_key, f"{label}: {desc.key} has no translation_key"
            assert desc.translation_key == desc.key, (
                f"{label}: {desc.key} translation_key is {desc.translation_key!r}; "
                "keeping them equal is what lets the generator find the name"
            )

    # number and switch build their descriptions inside async_setup_entry, so
    # they are checked through the register table they are built from.
    for reg in REGISTERS:
        if number._is_number(reg) or switch._is_switch(reg):
            assert reg.key, "a writable register with no key cannot be translated"
