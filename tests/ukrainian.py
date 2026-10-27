"""Helpers shared by the tests that check a Ukrainian file is Ukrainian.

Used by the integration's translations, the cards' string table and the
localised dashboard, which all face the same question: is there an English word
left in here that nobody noticed?
"""

from __future__ import annotations

import re

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
    "CO₂",
    "NTC",
    "RTC",
    "MAC",
    "UIN1",
    "UIN2",
    # A key in a card's YAML config, quoted in an error message. Translating it
    # would name an option that does not exist.
    "prefix",
)


def strip_proper(text: str) -> str:
    """Remove what is legitimately Latin, leaving only suspect words.

    Placeholders go first: `{slot}` is a key Home Assistant substitutes into the
    string, so its name stays English in every language.
    """
    text = re.sub(r"\{\w+\}", "", text)
    for word in PROPER_NOUNS:
        text = text.replace(word, "")
    return text


def leaves(obj: object, path: str = "") -> set[str]:
    """Every leaf path in a nested dict, so two files can be compared by shape."""
    if isinstance(obj, dict):
        out: set[str] = set()
        for key, value in obj.items():
            out |= leaves(value, f"{path}.{key}" if path else key)
        return out
    return {path}
