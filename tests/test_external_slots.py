"""External sensors and buttons: slots another system writes into the unit."""

from __future__ import annotations

from homeassistant.const import STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.jablotron_futura_modbus.const import DOMAIN
from custom_components.jablotron_futura_modbus.registers import Table

PREFIX = "jablotron_futura"


async def _slow_poll(hass: HomeAssistant, entry) -> None:
    """Read the slow tier now; it is paced by a clock tests do not advance."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    coordinator._last_slow = 0.0
    await coordinator.async_refresh()
    await hass.async_block_till_done()


def _claim_sensor(fake, slot: int, *, temp: float, rh: int, co2: int,
                  floor: float = 0.0, invalid: int = 0) -> None:
    base = 300 + (slot - 1) * 10
    for offset, value in enumerate(
        [1, invalid, round(temp * 10), rh, co2, round(floor * 10)]
    ):
        fake.poke(Table.HOLDING, base + offset, value)


class TestPolling:
    async def test_every_slot_is_read_without_opting_in(
        self, hass: HomeAssistant, setup_integration
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        starts = {
            block.address for block in coordinator.blocks
            if block.table is Table.HOLDING
        }
        assert {300 + 10 * n for n in range(8)} <= starts
        assert {400 + 10 * n for n in range(8)} <= starts


class TestUnusedSlots:
    """The fixture unit, like most, has nothing feeding its external slots."""

    async def test_they_are_counted_but_get_no_entities(
        self, hass: HomeAssistant, setup_integration
    ):
        assert hass.states.get(f"sensor.{PREFIX}_external_sensors").state == "0"
        assert hass.states.get(f"sensor.{PREFIX}_external_buttons").state == "0"
        readings = [
            s.entity_id for s in hass.states.async_all()
            if "_external_sensor_" in s.entity_id or "_external_button_" in s.entity_id
        ]
        assert readings == []

    async def test_the_slot_flags_exist_for_claiming_a_slot_by_hand(
        self, hass: HomeAssistant, setup_integration
    ):
        entry = er.async_get(hass).async_get(f"switch.{PREFIX}_external_sensor_1_present")
        assert entry is not None
        assert entry.disabled_by is er.RegistryEntryDisabler.INTEGRATION

    async def test_the_bus_boost_buttons_are_counted_too(
        self, hass: HomeAssistant, setup_integration
    ):
        """Three boost buttons sit on this unit's bus; nothing showed them."""
        state = hass.states.get(f"sensor.{PREFIX}_boost_buttons")
        assert state.state == "3"
        assert state.attributes["slots"] == [1, 2, 3]


class TestSensorInUse:
    async def test_a_claimed_slot_gets_its_readings(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        _claim_sensor(fake_futura, 2, temp=21.5, rh=40, co2=650, floor=24.0)
        await _slow_poll(hass, setup_integration)

        state = lambda what: hass.states.get(f"sensor.{PREFIX}_external_sensor_2_{what}")
        assert state("temperature").state == "21.5"
        assert state("temperature").attributes["unit_of_measurement"] == "°C"
        assert state("humidity").state == "40"
        assert state("co2").state == "650"
        assert state("floor_temperature").state == "24.0"
        count = hass.states.get(f"sensor.{PREFIX}_external_sensors")
        assert count.state == "1"
        assert count.attributes["slots"] == [2]

    async def test_a_value_marked_invalid_is_unknown_rather_than_zero(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        # Bit 3: no floor reading. The register still holds a number.
        _claim_sensor(fake_futura, 1, temp=22.0, rh=45, co2=500, invalid=0b1000)
        await _slow_poll(hass, setup_integration)

        floor = hass.states.get(f"sensor.{PREFIX}_external_sensor_1_floor_temperature")
        assert floor.state == STATE_UNKNOWN
        assert hass.states.get(f"sensor.{PREFIX}_external_sensor_1_temperature").state == (
            "22.0"
        )

    async def test_it_counts_as_a_room_sensor(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        _claim_sensor(fake_futura, 4, temp=22.0, rh=45, co2=2400)
        await _slow_poll(hass, setup_integration)

        assert float(hass.states.get(f"sensor.{PREFIX}_highest_co2").state) == 2400
        assert hass.states.get(f"sensor.{PREFIX}_air_quality").state == "poor"

    async def test_an_invalid_co2_does_not_become_the_worst_room(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        _claim_sensor(fake_futura, 4, temp=22.0, rh=45, co2=9999, invalid=0b0100)
        await _slow_poll(hass, setup_integration)

        assert float(hass.states.get(f"sensor.{PREFIX}_highest_co2").state) < 9999

    async def test_releasing_the_slot_leaves_its_entities_unavailable(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        _claim_sensor(fake_futura, 2, temp=21.5, rh=40, co2=650)
        await _slow_poll(hass, setup_integration)
        fake_futura.poke(Table.HOLDING, 310, 0)
        await _slow_poll(hass, setup_integration)

        state = hass.states.get(f"sensor.{PREFIX}_external_sensor_2_co2")
        assert state.state == "unavailable"
        assert hass.states.get(f"sensor.{PREFIX}_external_sensors").state == "0"

    async def test_feeding_a_slot_from_home_assistant_shows_at_once(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """No slow poll in between: the write itself has to reach the entities."""
        await hass.services.async_call(
            DOMAIN, "set_external_sensor",
            {"index": 3, "temperature": -4.5, "co2": 900},
            blocking=True,
        )
        await hass.async_block_till_done()

        assert fake_futura.peek(Table.HOLDING, 320) == 1
        assert fake_futura.peek(Table.HOLDING, 322) == (-45) & 0xFFFF
        assert hass.states.get(f"sensor.{PREFIX}_external_sensor_3_temperature").state == (
            "-4.5"
        )
        assert hass.states.get(f"sensor.{PREFIX}_external_sensor_3_co2").state == "900"


class TestButtonInUse:
    async def test_a_claimed_button_gets_its_controls(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        for offset, value in enumerate([1, 1, 600, 0]):  # in use, hood, 10 min, idle
            fake_futura.poke(Table.HOLDING, 400 + offset, value)
        await _slow_poll(hass, setup_integration)

        mode = hass.states.get(f"select.{PREFIX}_external_button_1_mode")
        assert mode.state == "kitchen_hood"
        assert mode.attributes["options"] == ["boost", "kitchen_hood"]
        assert float(hass.states.get(f"number.{PREFIX}_external_button_1_timer").state) == 600
        assert hass.states.get(f"switch.{PREFIX}_external_button_1_active").state == "off"
        assert hass.states.get(f"sensor.{PREFIX}_external_buttons").state == "1"

    async def test_its_controls_write_the_slot(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        fake_futura.poke(Table.HOLDING, 410, 1)
        await _slow_poll(hass, setup_integration)

        await hass.services.async_call(
            "select", "select_option",
            {"entity_id": f"select.{PREFIX}_external_button_2_mode", "option": "boost"},
            blocking=True,
        )
        await hass.services.async_call(
            "switch", "turn_on",
            {"entity_id": f"switch.{PREFIX}_external_button_2_active"},
            blocking=True,
        )
        assert fake_futura.peek(Table.HOLDING, 411) == 0
        assert fake_futura.peek(Table.HOLDING, 413) == 1
