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


#: Words that are legitimately Latin in a Ukrainian string: brand names, units,
#: protocol terms, and `Boost` -- which stays untranslated because it is the word
#: on the physical wall buttons and in this house's own entity names.
PROPER_NOUNS = (
    "°C",
    "Boost",
    "CoolBreeze",
    "VarioBreeze",
    "SuperBreeze",
    "ALFA",
    "Jablotron",
    "Futura",
    "Modbus",
    "Home Assistant",
    "Unit ID",
    "TCP",
    "holding",
    "CO2",
    "NTC",
    "RTC",
    "MAC",
    "UIN1",
    "UIN2",
)


def _strip_proper(text: str) -> str:
    """Remove what is legitimately Latin, leaving only suspect words.

    Placeholders go first: `{slot}` is a key Home Assistant substitutes into the
    string, so its name stays English in every language.
    """
    import re

    text = re.sub(r"\{\w+\}", "", text)
    for word in PROPER_NOUNS:
        text = text.replace(word, "")
    return text


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


def test_ukrainian_covers_every_entity(generated):
    """Every English entity string has a Ukrainian one, names and states alike.

    Compared as leaf paths against en.json rather than against the generator's
    output, because the generator does not produce the `select` block -- those
    carry option labels and are hand-written. An earlier version of this test
    checked only the generated domains, so uk.json shipped with no `select` at
    all and three pickers stayed English on screen. Comparing against English
    catches a missing domain, a missing name and a missing option label.
    """
    en_leaves = _leaves(_load("translations/en.json")["entity"])
    uk_leaves = _leaves(_load("translations/uk.json")["entity"])
    missing = en_leaves - uk_leaves
    extra = uk_leaves - en_leaves
    assert not missing, f"untranslated: {sorted(missing)[:8]}"
    assert not extra, f"translations with no English source: {sorted(extra)[:8]}"


def test_ukrainian_generated_block_is_current(generated):
    """The generated domains match tools/uk_names.py."""
    import gen_translations

    uk, missing = gen_translations.ukrainian(generated)
    assert not missing, (
        f"{len(missing)} entities have no Ukrainian name, e.g. {missing[:5]} "
        "-- add them to tools/uk_names.py"
    )
    shipped = _load("translations/uk.json")["entity"]
    for domain, keys in uk.items():
        assert shipped.get(domain) == keys, f"{domain}: run tools/gen_translations.py"


def test_placeholders_survive_translation():
    """A {placeholder} dropped in translation renders as a literal brace."""
    import re

    en = _load("translations/en.json")["entity"]
    uk = _load("translations/uk.json")["entity"]
    for domain, keys in en.items():
        for key, value in keys.items():
            want = set(re.findall(r"\{(\w+)\}", value.get("name", "")))
            got = set(re.findall(r"\{(\w+)\}", uk[domain][key].get("name", "")))
            assert want == got, (
                f"{domain}.{key}: placeholders {want} became {got}"
            )


def test_ukrainian_is_actually_ukrainian():
    """Catch an English word left anywhere in the Ukrainian entity block.

    Not "does it contain Cyrillic": several names are legitimately all-Latin,
    such as "ALFA 3 — CO2", a brand name beside a chemical formula with nothing
    to translate between them. So the proper nouns this device genuinely uses are
    stripped and whatever Latin is left fails -- which is what an untranslated
    English word would be.

    Reads the shipped file rather than the generator, so the hand-written
    `select` block is covered as well.
    """
    import re

    uk = _load("translations/uk.json")["entity"]
    for domain, keys in uk.items():
        for key, value in keys.items():
            strings = {"name": value.get("name", "")}
            strings |= {f"state.{k}": v for k, v in value.get("state", {}).items()}
            for where, text in strings.items():
                if text.isdigit():
                    continue  # ventilation levels 1..5 are numbers
                leftover = re.findall(r"[A-Za-z]+", _strip_proper(text))
                assert not leftover, (
                    f"{domain}.{key}.{where} still has English in it: "
                    f"{leftover} in {text!r}"
                )


def _leaves(obj: object, path: str = "") -> set[str]:
    """Every leaf path in a nested dict, so two files can be compared by shape."""
    if isinstance(obj, dict):
        out: set[str] = set()
        for key, value in obj.items():
            out |= _leaves(value, f"{path}.{key}" if path else key)
        return out
    return {path}


def test_ukrainian_covers_config_options_and_services():
    """The hand-written sections must match English key for key.

    `entity` is generated and tested above; these three are written by hand, so
    nothing otherwise notices a new config field or service argument shipping
    without a Ukrainian string. Home Assistant would quietly show the English,
    which is exactly the half-translated dialog this is meant to prevent.
    """
    en = _load("translations/en.json")
    uk = _load("translations/uk.json")
    for section in ("config", "options", "services"):
        assert section in uk, f"uk.json has no {section} section"
        missing = _leaves(en[section]) - _leaves(uk[section])
        extra = _leaves(uk[section]) - _leaves(en[section])
        assert not missing, f"{section}: untranslated {sorted(missing)}"
        assert not extra, f"{section}: translations with no English source {sorted(extra)}"


def test_ukrainian_prose_is_not_english():
    """A long Latin run in the hand-written sections means a forgotten string."""
    import re

    uk = _load("translations/uk.json")
    for section in ("config", "options", "services"):
        for path in sorted(_leaves(uk[section])):
            value = uk[section]
            for part in path.split("."):
                value = value[part]
            words = re.findall(r"[A-Za-z]{3,}", _strip_proper(value))
            assert not words, f"{section}.{path} looks untranslated: {words} in {value!r}"
