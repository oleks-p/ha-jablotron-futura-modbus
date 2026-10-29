"""The localised dashboards must be in step with the English one.

`dashboards/futura.yaml` is the source; `tools/localise_dashboard.py` writes
`futura.<lang>.yaml` from it. Both are committed, so a heading added to the
English file and never regenerated would otherwise ship as the one English word
on a Ukrainian dashboard.
"""

from __future__ import annotations

import pathlib
import re
import sys

import pytest
import yaml

from tests.ukrainian import strip_proper

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import localise_dashboard as localise  # noqa: E402


@pytest.mark.parametrize("language", localise.LANGUAGES)
def test_every_phrase_has_a_translation(language: str):
    """Fails naming the phrase, so the fix is to add it rather than find it."""
    _, missing = localise.render(language)
    assert not missing, (
        f"{language}: no translation for {missing} "
        "-- add them to tools/localise_dashboard.py"
    )


@pytest.mark.parametrize("language", localise.LANGUAGES)
def test_generated_dashboard_is_committed(language: str):
    """Regenerating must be a no-op. If this fails, run the tool."""
    path = localise.SOURCE.with_suffix(f".{language}.yaml")
    text, _ = localise.render(language)
    assert path.exists(), f"{path.name} has never been generated"
    assert path.read_text() == text, (
        f"{path.name} is out of date -- run tools/localise_dashboard.py"
    )


def test_ukrainian_dashboard_has_no_english_left():
    """Every heading, chart title and series name reads as Ukrainian."""
    data = yaml.safe_load(localise.SOURCE.with_suffix(".uk.yaml").read_text())
    offenders: list[str] = []

    def walk(node: object) -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                if key in localise.TRANSLATED_KEYS and isinstance(value, str):
                    if re.findall(r"[A-Za-z]{3,}", strip_proper(value)):
                        offenders.append(value)
                else:
                    walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(data)
    assert not offenders, f"untranslated dashboard text: {offenders}"


def test_every_entity_card_asks_for_the_entity_name():
    """A card naming an entity must ask for the entity half of the name.

    Home Assistant composes an entity's name from the device's and the entity's
    own, so every friendly name here begins "Jablotron Futura". Left alone, a
    column of tiles repeats that and truncates the word that actually differs --
    `Jablotron Futura Спожива...`. `name: {type: entity}` asks for the second
    half; this fails on a tile added without it, which is the only way the
    prefix comes back.
    """
    paths = [localise.SOURCE]
    paths += [
        localise.SOURCE.with_suffix(f".{lang}.yaml") for lang in localise.LANGUAGES
    ]
    for path in paths:
        bare = _tiles_without_entity_name(yaml.safe_load(path.read_text()))
        assert not bare, f"{path.name}: tiles with no `name: {{type: entity}}`: {bare}"


def _tiles_without_entity_name(
    node: object, found: list[str] | None = None
) -> list[str]:
    found = [] if found is None else found
    if isinstance(node, dict):
        if node.get("type") == "tile" and node.get("name") != {"type": "entity"}:
            found.append(str(node.get("entity")))
        for value in node.values():
            _tiles_without_entity_name(value, found)
    elif isinstance(node, list):
        for item in node:
            _tiles_without_entity_name(item, found)
    return found


def test_identifiers_are_not_translated():
    """Entity ids, paths and card types must come through untouched."""
    english = yaml.safe_load(localise.SOURCE.read_text())
    for language in localise.LANGUAGES:
        other = yaml.safe_load(
            localise.SOURCE.with_suffix(f".{language}.yaml").read_text()
        )
        assert _identifiers(english) == _identifiers(other), (
            f"{language}: the translation changed an identifier"
        )


def _identifiers(node: object, found: list[str] | None = None) -> list[str]:
    found = [] if found is None else found
    if isinstance(node, dict):
        for key, value in node.items():
            if key in ("entity", "path", "type", "icon") and isinstance(value, str):
                found.append(f"{key}={value}")
            _identifiers(value, found)
    elif isinstance(node, list):
        for item in node:
            _identifiers(item, found)
    return found
