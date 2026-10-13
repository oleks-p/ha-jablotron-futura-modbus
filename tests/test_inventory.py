"""The shape of the entity set a real unit produces."""

from __future__ import annotations

from collections import Counter

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.jablotron_futura_modbus.registers import REGISTERS


async def test_every_platform_contributes(hass: HomeAssistant, setup_integration):
    domains = Counter(
        entity.domain for entity in er.async_get(hass).entities.values()
    )
    for domain in (
        "sensor", "binary_sensor", "switch", "select", "number", "button",
        "fan", "climate",
    ):
        assert domains[domain] > 0, f"{domain} produced no entities"
    assert domains["fan"] == 1
    assert domains["climate"] == 1


async def test_default_install_is_not_overwhelming(
    hass: HomeAssistant, setup_integration
):
    """Diagnostics and service registers stay hidden unless asked for."""
    entities = list(er.async_get(hass).entities.values())
    enabled = [entity for entity in entities if not entity.disabled]
    assert 80 <= len(enabled) <= 140, (
        f"{len(enabled)} entities enabled by default; the default view should "
        "stay legible"
    )
    assert len(enabled) < len(entities), "some entities should be opt-in"


async def test_nothing_is_unavailable_on_a_healthy_unit(
    hass: HomeAssistant, setup_integration
):
    """Absent peripherals are skipped at setup rather than left unavailable."""
    unavailable = [
        state.entity_id
        for state in hass.states.async_all()
        if state.state == "unavailable"
    ]
    assert not unavailable, f"unavailable entities on a healthy unit: {unavailable}"


async def test_one_reading_per_connected_peripheral(
    hass: HomeAssistant, setup_integration
):
    """This unit has five wall CO2 sensors plus one ALFA, so six readings."""
    co2 = [
        state.entity_id
        for state in hass.states.async_all("sensor")
        if state.entity_id.endswith("_co2")
        and "highest" not in state.entity_id
    ]
    assert len(co2) == 6, f"expected 6 CO2 readings, got {sorted(co2)}"


async def test_derived_values_are_present(hass: HomeAssistant, setup_integration):
    for entity_id in (
        "sensor.jablotron_futura_highest_co2",
        "sensor.jablotron_futura_air_quality",
        "sensor.jablotron_futura_ventilation_mode",
        "sensor.jablotron_futura_supply_valves",
        "sensor.jablotron_futura_exhaust_valves",
    ):
        assert hass.states.get(entity_id) is not None, f"{entity_id} missing"


async def test_air_quality_tracks_the_worst_sensor(
    hass: HomeAssistant, setup_integration
):
    worst = float(hass.states.get("sensor.jablotron_futura_highest_co2").state)
    quality = hass.states.get("sensor.jablotron_futura_air_quality").state
    expected = "good" if worst < 800 else "moderate" if worst < 1200 else "poor"
    assert quality == expected


def test_register_43_is_named_for_the_post_heater():
    """Not "heating power": it is one of two heating sources, and the smaller.

    The system design guide rates the built-in electric post-heater at 0-350 W
    continuously regulated, while CoolBreeze heating draws 660 W from a separate
    supply that reaches no register. Naming this "heating power" invited the
    reading that it covered both.
    """
    reg = next(r for r in REGISTERS if r.key == "heating_power")
    assert reg.name == "Post-heater power"
    assert reg.unit == "W"


def test_every_select_option_has_a_translated_label():
    """Without a label HA prints the raw slug, so "co2" sat beside "On"/"Off".

    The state machine keeps the slug either way -- the frontend does the
    substitution -- so this checks the translation file rather than a state.
    """
    import json
    from pathlib import Path

    from custom_components.jablotron_futura_modbus.select import DESCRIPTIONS

    root = Path(__file__).parent.parent / "custom_components/jablotron_futura_modbus"
    strings = json.loads((root / "translations/en.json").read_text())
    selects = strings["entity"]["select"]

    for desc in DESCRIPTIONS:
        key = desc.translation_key
        assert key in selects, f"{desc.key} has no translations"
        assert selects[key].get("name"), f"{key} has no name"
        labels = selects[key].get("state", {})
        missing = [o for o in desc.options if o not in labels]
        assert not missing, f"{key} is missing labels for {missing}"
