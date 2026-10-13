"""Two units side by side: naming, entity ids, and which one a service reaches."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from homeassistant.config_entries import SOURCE_USER, ConfigEntryState
from homeassistant.const import CONF_HOST, CONF_NAME, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import device_registry as dr
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.jablotron_futura_modbus.const import CONF_UNIT_ID, DOMAIN
from custom_components.jablotron_futura_modbus.registers import Table

FIRST_HOST = "192.0.2.10"
SECOND_HOST = "192.0.2.11"
SECOND_SERIAL = "4200000001"


@pytest.fixture
def second_futura(observed, fake_futura):
    """The fixture unit with its own serial and MAC.

    The MAC matters as much as the serial: the device registry merges devices
    that share a connection, so two units with one MAC would become one device.
    """
    unit = type(fake_futura)(observed)
    # Serial is a low-word-first uint32 at input 1-2: 4200000000 + 1.
    unit.poke(Table.INPUT, 1, unit.peek(Table.INPUT, 1) + 1)
    # MAC bytes are swapped inside each register: 0x0200 ends it in 00:02.
    unit.poke(Table.INPUT, 5, 0x0200)
    return unit


@pytest.fixture
def two_futuras(fake_futura, second_futura):
    """Hand each host its own unit, as the network would."""
    units = {FIRST_HOST: fake_futura, SECOND_HOST: second_futura}
    with patch(
        "custom_components.jablotron_futura_modbus.modbus_client."
        "AsyncModbusTcpClient",
        side_effect=lambda host, **_: units[host],
    ):
        yield units


@pytest.fixture
def second_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        title="Jablotron Futura 2",
        unique_id=SECOND_SERIAL,
        data={
            CONF_HOST: SECOND_HOST,
            CONF_PORT: 502,
            CONF_UNIT_ID: 1,
            CONF_NAME: "Jablotron Futura 2",
        },
    )


@pytest.fixture
async def both_units(hass: HomeAssistant, config_entry, second_entry, two_futuras):
    for entry in (config_entry, second_entry):
        entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return config_entry, second_entry


def _device_id(hass: HomeAssistant, serial: str) -> str:
    device = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, serial)})
    assert device is not None
    return device.id


def _default_name(result) -> str:
    key = next(key for key in result["data_schema"].schema if key == CONF_NAME)
    return key.default()


class TestNaming:
    async def test_the_first_unit_is_offered_the_plain_name(
        self, hass: HomeAssistant, two_futuras
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_USER}
        )
        assert _default_name(result) == "Jablotron Futura"

        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_HOST: FIRST_HOST}
        )
        await hass.async_block_till_done()
        assert result["type"] is FlowResultType.CREATE_ENTRY
        assert result["title"] == "Jablotron Futura"
        assert result["data"][CONF_NAME] == "Jablotron Futura"
        assert hass.states.get("climate.jablotron_futura") is not None

    async def test_a_second_unit_gets_a_number_and_ids_of_its_own(
        self, hass: HomeAssistant, config_entry, two_futuras
    ):
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_USER}
        )
        assert _default_name(result) == "Jablotron Futura 2"

        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_HOST: SECOND_HOST}
        )
        await hass.async_block_till_done()
        assert result["type"] is FlowResultType.CREATE_ENTRY

        # Under the unit's own prefix, not the first unit's ids with _2 on the end.
        assert hass.states.get("climate.jablotron_futura_2") is not None
        assert hass.states.get("sensor.jablotron_futura_2_extract_air_temperature")
        assert hass.states.get("sensor.jablotron_futura_extract_air_temperature_2") is None

    async def test_a_name_already_in_use_is_refused_before_connecting(
        self, hass: HomeAssistant, config_entry, two_futuras
    ):
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()
        reads_before = two_futuras[SECOND_HOST].reads

        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_HOST: SECOND_HOST, CONF_NAME: "Jablotron Futura"}
        )
        assert result["type"] is FlowResultType.FORM
        assert result["errors"] == {CONF_NAME: "name_taken"}
        assert two_futuras[SECOND_HOST].reads == reads_before

    async def test_a_unit_that_moved_keeps_its_name(
        self, hass: HomeAssistant, config_entry, two_futuras
    ):
        config_entry.add_to_hass(hass)
        # The same unit, found at a new address and offered under a new name.
        two_futuras["192.0.2.99"] = two_futuras[FIRST_HOST]

        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_HOST: "192.0.2.99", CONF_NAME: "Renamed"}
        )
        assert result["type"] is FlowResultType.ABORT
        assert result["reason"] == "already_configured"
        assert config_entry.data[CONF_HOST] == "192.0.2.99"
        assert CONF_NAME not in config_entry.data


class TestTwoUnits:
    async def test_both_load_as_separate_devices(self, hass: HomeAssistant, both_units):
        first, second = both_units
        assert first.state is ConfigEntryState.LOADED
        assert second.state is ConfigEntryState.LOADED

        registry = dr.async_get(hass)
        names = {
            registry.async_get(_device_id(hass, serial)).name
            for serial in ("4200000000", SECOND_SERIAL)
        }
        assert names == {"Jablotron Futura", "Jablotron Futura 2"}

    async def test_a_service_reaches_only_the_unit_it_names(
        self, hass: HomeAssistant, both_units, two_futuras
    ):
        await hass.services.async_call(
            DOMAIN,
            "set_function",
            {
                "device_id": _device_id(hass, SECOND_SERIAL),
                "function": "boost",
                "duration": 600,
            },
            blocking=True,
        )
        assert two_futuras[SECOND_HOST].peek(Table.HOLDING, 1) == 600
        assert two_futuras[FIRST_HOST].peek(Table.HOLDING, 1) == 0

    async def test_an_untargeted_call_is_refused_rather_than_guessed(
        self, hass: HomeAssistant, both_units
    ):
        with pytest.raises(ServiceValidationError, match="device_id"):
            await hass.services.async_call(
                DOMAIN, "set_function", {"function": "boost", "duration": 600},
                blocking=True,
            )

    async def test_a_device_that_is_not_a_futura_is_refused(
        self, hass: HomeAssistant, both_units
    ):
        other = MockConfigEntry(domain="other")
        other.add_to_hass(hass)
        device = dr.async_get(hass).async_get_or_create(
            config_entry_id=other.entry_id, identifiers={("other", "x")}
        )
        with pytest.raises(ServiceValidationError):
            await hass.services.async_call(
                DOMAIN, "clear_away", {"device_id": device.id}, blocking=True
            )

    async def test_with_one_unit_left_no_target_is_needed(
        self, hass: HomeAssistant, both_units, two_futuras
    ):
        first, _ = both_units
        assert await hass.config_entries.async_unload(first.entry_id)
        await hass.async_block_till_done()

        await hass.services.async_call(
            DOMAIN, "set_function", {"function": "boost", "duration": 600},
            blocking=True,
        )
        assert two_futuras[SECOND_HOST].peek(Table.HOLDING, 1) == 600
