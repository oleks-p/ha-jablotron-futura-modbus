"""The cards' own strings, which Home Assistant does not translate for them.

Entity names come from the integration's translations; these are the words the
cards print themselves -- "Supply" on a schematic, "BYPASS" across the damper,
the heading over the controls. They live in cards/src/strings/<lang>.json, and
this checks the same things tests/test_translations.py checks for the
integration: both files carry the same keys, placeholders survive translation,
and nothing English is left in the Ukrainian one.

The last two tests are what a translated card actually fails on: a key that is
used but not defined renders as nothing at all, and a key that is defined but
unused is a string somebody stopped printing and left behind.
"""

from __future__ import annotations

import json
import pathlib
import re

import pytest

from tests.ukrainian import strip_proper

ROOT = pathlib.Path(__file__).resolve().parent.parent
STRINGS = ROOT / "cards" / "src" / "strings"
SOURCES = sorted((ROOT / "cards" / "src").glob("*.ts"))

#: Shipped alongside English; add a file here when a language is added.
TRANSLATIONS = ("uk",)


def _load(language: str) -> dict[str, str]:
    return json.loads((STRINGS / f"{language}.json").read_text())


def _placeholders(text: str) -> set[str]:
    return set(re.findall(r"\{(\w+)\}", text))


@pytest.mark.parametrize("language", TRANSLATIONS)
def test_every_english_string_is_translated(language: str):
    english, other = _load("en"), _load(language)
    missing = sorted(set(english) - set(other))
    extra = sorted(set(other) - set(english))
    assert not missing, f"{language}: untranslated {missing}"
    assert not extra, f"{language}: strings with no English source {extra}"


@pytest.mark.parametrize("language", TRANSLATIONS)
def test_placeholders_survive_translation(language: str):
    """A {placeholder} dropped in translation renders as a literal brace."""
    english, other = _load("en"), _load(language)
    for key, text in english.items():
        assert _placeholders(text) == _placeholders(other[key]), (
            f"{language}.{key}: placeholders {_placeholders(text)} became "
            f"{_placeholders(other[key])}"
        )


def test_ukrainian_is_actually_ukrainian():
    """Catch an English word left anywhere in the Ukrainian table.

    Not "does it contain Cyrillic": `CO₂` and `Boost` are legitimately Latin, so
    the proper nouns this device genuinely uses are stripped and whatever Latin
    is left fails -- which is what an untranslated string would be.
    """
    for key, text in _load("uk").items():
        leftover = re.findall(r"[A-Za-z]+", strip_proper(text))
        assert not leftover, f"uk.{key} still has English in it: {leftover} in {text!r}"


def _referenced() -> set[str]:
    """Every string key a card source mentions as a literal."""
    used: set[str] = set()
    for source in SOURCES:
        used |= set(re.findall(r"'([A-Za-z][A-Za-z0-9]*)'", source.read_text()))
    return used


def test_no_card_uses_a_string_that_does_not_exist():
    """A missing key renders as nothing, which is invisible until it is on screen."""
    english = _load("en")
    calls: set[str] = set()
    for source in SOURCES:
        text = source.read_text()
        calls |= set(re.findall(r"text\(\s*[^,]+,\s*'([^']+)'", text))
        calls |= set(re.findall(r"this\.t\(\s*'([^']+)'", text))
    unknown = sorted(calls - set(english))
    assert not unknown, f"cards look up strings that are not defined: {unknown}"


def test_no_string_is_defined_and_never_used():
    """An orphan string is one somebody stopped printing and left behind."""
    orphans = sorted(set(_load("en")) - _referenced())
    assert not orphans, f"strings nothing refers to: {orphans}"
