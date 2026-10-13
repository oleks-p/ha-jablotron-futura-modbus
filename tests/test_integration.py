"""End-to-end behaviour against a device model that enforces the real rules."""

from __future__ import annotations

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant

from custom_components.jablotron_futura_modbus.const import DOMAIN
from custom_components.jablotron_futura_modbus.registers import Table


async def test_setup_succeeds(hass: HomeAssistant, setup_integration):
    assert setup_integration.state is ConfigEntryState.LOADED
    assert DOMAIN in hass.data
    coordinator = hass.data[DOMAIN][setup_integration.entry_id]
    assert coordinator.last_update_success


async def test_identity_reaches_the_device_registry(
    hass: HomeAssistant, setup_integration
):
    from homeassistant.helpers import device_registry as dr

    registry = dr.async_get(hass)
    device = registry.async_get_device(identifiers={(DOMAIN, "4200000000")})
    assert device is not None
    assert device.sw_version == "FUA.P.07.20"
    assert device.hw_version == "131238"
    assert device.model == "Futura L"
    assert ("mac", "00:13:b0:00:00:01") in device.connections


async def test_core_sensors_have_real_values(hass: HomeAssistant, setup_integration):
    # Values come straight from the probed unit, so these are its readings.
    assert hass.states.get("sensor.jablotron_futura_extract_air_temperature").state == (
        "23.7"
    )
    assert hass.states.get("sensor.jablotron_futura_filter_clogging").state == "27"
    assert hass.states.get("sensor.jablotron_futura_air_flow").state == "366"


async def test_no_core_entity_is_unknown(hass: HomeAssistant, setup_integration):
    """A decoding slip usually shows up as a wall of unknown states."""
    bad = [
        state.entity_id
        for state in hass.states.async_all()
        if state.domain in ("sensor", "binary_sensor")
        and state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE)
        and "error_" not in state.entity_id
        and "warning_" not in state.entity_id
    ]
    # Derived values can legitimately be unknown; nothing else should be.
    allowed = {"performance_factor", "outdoor", "external_ntc"}
    unexpected = [e for e in bad if not any(a in e for a in allowed)]
    assert not unexpected, f"unexpected unknown/unavailable states: {unexpected}"


async def test_mode_flags_decode_from_the_high_and_low_registers(
    hass: HomeAssistant, setup_integration
):
    # The unit reported bits 2, 7 and 8 set.
    assert hass.states.get(
        "binary_sensor.jablotron_futura_time_program_active"
    ).state == "on"
    assert hass.states.get("binary_sensor.jablotron_futura_device_on").state == "on"
    assert hass.states.get("binary_sensor.jablotron_futura_boost_active").state == "off"
    assert hass.states.get("binary_sensor.jablotron_futura_fault").state == "off"


async def test_absent_peripherals_produce_no_entities(
    hass: HomeAssistant, setup_integration
):
    """Slots 1, 7 and 8 are empty on this unit; slots 2-6 are populated."""
    for slot, present in ((1, False), (2, True), (6, True), (7, False), (8, False)):
        state = hass.states.get(f"sensor.jablotron_futura_co2_sensor_{slot}_co2")
        if present:
            assert state is not None and state.state not in (
                STATE_UNKNOWN, STATE_UNAVAILABLE
            ), f"slot {slot} should be reporting"
        else:
            assert state is None or state.state == STATE_UNAVAILABLE, (
                f"slot {slot} is empty and should not report a reading"
            )


async def test_alfa_matches_the_wall_display(hass: HomeAssistant, setup_integration):
    assert hass.states.get("sensor.jablotron_futura_alfa_1_temperature").state == "26.3"
    assert hass.states.get("sensor.jablotron_futura_alfa_1_humidity").state == "45.0"


async def test_climate_reflects_the_unit(hass: HomeAssistant, setup_integration):
    state = hass.states.get("climate.jablotron_futura")
    assert state is not None
    # The fixture was captured with additional cooling switched on (holding 16),
    # so the unit's mode is COOL rather than plain ventilation.
    assert state.state == "cool"
    assert state.attributes["temperature"] == 24.0
    assert state.attributes["fan_mode"] == "auto"
    # Off is a mode, never a fan speed: two controls on register 0 could
    # contradict each other.
    assert state.attributes["fan_modes"] == ["1", "2", "3", "4", "5", "auto"]


class TestHvacModes:
    """Mode is register 0 (speed, 0 = off) read together with 15 and 16."""

    async def test_the_offered_modes_follow_fut_config(
        self, hass: HomeAssistant, setup_integration
    ):
        state = hass.states.get("climate.jablotron_futura")
        # This unit has internal heating and CoolBreeze cooling.
        assert state.attributes["hvac_modes"] == ["off", "heat", "cool", "fan_only"]

    async def test_a_unit_without_coolbreeze_offers_no_cool(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        """Offering a mode whose register the unit ignores would be a lie."""
        fake_futura.poke(Table.INPUT, 15, 0b1111_1101)  # clear coolbreeze_cooling
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["hvac_modes"] == ["off", "heat", "fan_only"]

    @pytest.mark.parametrize(
        ("level", "heating", "cooling", "expected"),
        [
            (0, 0, 0, "off"),
            (0, 1, 0, "off"),      # off wins: the fans are not running
            (6, 1, 0, "heat"),
            (6, 0, 1, "cool"),
            (6, 0, 0, "fan_only"),
            (3, 1, 1, "heat"),     # both enabled: heating is reported
        ],
    )
    async def test_mode_is_read_from_all_three_registers(
        self, hass, config_entry, mock_client, fake_futura,
        level, heating, cooling, expected,
    ):
        fake_futura.poke(Table.HOLDING, 0, level)
        fake_futura.poke(Table.HOLDING, 15, heating)
        fake_futura.poke(Table.HOLDING, 16, cooling)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        assert hass.states.get("climate.jablotron_futura").state == expected

    async def test_setting_heat_enables_heating_and_clears_cooling(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        fake_futura.poke(Table.HOLDING, 16, 1)
        await hass.services.async_call(
            "climate", "set_hvac_mode",
            {"entity_id": "climate.jablotron_futura", "hvac_mode": "heat"},
            blocking=True,
        )
        await hass.async_block_till_done()

        assert fake_futura.peek(Table.HOLDING, 15) == 1
        assert fake_futura.peek(Table.HOLDING, 16) == 0

    async def test_off_stops_the_fans_without_touching_the_aux_registers(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "climate", "set_hvac_mode",
            {"entity_id": "climate.jablotron_futura", "hvac_mode": "off"},
            blocking=True,
        )
        await hass.async_block_till_done()

        assert fake_futura.peek(Table.HOLDING, 0) == 0
        # Turning the unit off is not a request to reconfigure cooling.
        assert fake_futura.peek(Table.HOLDING, 16) == 1
        state = hass.states.get("climate.jablotron_futura")
        assert state.state == "off"
        assert state.attributes["fan_mode"] is None

    async def test_leaving_off_restores_the_speed_it_was_running(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """Register 0 keeps no memory of the level, so the entity must."""
        await hass.services.async_call(
            "climate", "set_fan_mode",
            {"entity_id": "climate.jablotron_futura", "fan_mode": "4"},
            blocking=True,
        )
        await hass.async_block_till_done()
        await hass.services.async_call(
            "climate", "set_hvac_mode",
            {"entity_id": "climate.jablotron_futura", "hvac_mode": "off"},
            blocking=True,
        )
        await hass.async_block_till_done()
        assert fake_futura.peek(Table.HOLDING, 0) == 0

        await hass.services.async_call(
            "climate", "set_hvac_mode",
            {"entity_id": "climate.jablotron_futura", "hvac_mode": "fan_only"},
            blocking=True,
        )
        await hass.async_block_till_done()

        assert fake_futura.peek(Table.HOLDING, 0) == 4

    async def test_changing_speed_while_running_leaves_the_mode_alone(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """The complaint that started this: fan mode forcing mode to fan_only."""
        assert hass.states.get("climate.jablotron_futura").state == "cool"

        await hass.services.async_call(
            "climate", "set_fan_mode",
            {"entity_id": "climate.jablotron_futura", "fan_mode": "2"},
            blocking=True,
        )
        await hass.async_block_till_done()

        assert fake_futura.peek(Table.HOLDING, 0) == 2
        # Untouched: choosing a speed is not choosing a mode.
        assert fake_futura.peek(Table.HOLDING, 16) == 1
        assert hass.states.get("climate.jablotron_futura").state == "cool"


async def test_climate_reports_the_room_mean_not_the_duct(
    hass: HomeAssistant, setup_integration
):
    """The app headlines the average of the room sensors, so we match it."""
    coordinator = hass.data[DOMAIN][setup_integration.entry_id]
    readings = [
        coordinator.data.get(f"wall_sensor_{slot}_temperature")
        for slot in range(2, 7)
    ] + [coordinator.data.get("alfa_1_temperature")]
    expected = round(sum(readings) / len(readings), 1)

    assert coordinator.data.get("temp_mean_indoor") == expected
    state = hass.states.get("climate.jablotron_futura")
    assert state.attributes["current_temperature"] == expected
    # The duct probe reads lower; using it would under-report the rooms.
    assert coordinator.data.get("temp_indoor") != expected


class TestPeripheralMeans:
    async def test_absent_slots_are_excluded(
        self, hass: HomeAssistant, setup_integration
    ):
        """Unpopulated slots read 0 and would drag the mean toward zero."""
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        mean = coordinator.data.get("temp_mean_indoor")
        # Slots 1, 7 and 8 are empty on this unit and report 0.
        for slot in (1, 7, 8):
            assert f"wall_sensor_present_{slot}" not in coordinator.data.present
        assert mean > 20, f"mean {mean} looks diluted by empty slots"

    async def test_alfa_ntc_probe_is_excluded(
        self, hass: HomeAssistant, setup_integration
    ):
        """The ALFA's optional NTC input reads 0 when nothing is wired to it."""
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        assert coordinator.data.get("alfa_1_ntc_temperature") == 0.0
        readings = [
            coordinator.data.get(f"wall_sensor_{slot}_temperature")
            for slot in range(2, 7)
        ] + [coordinator.data.get("alfa_1_temperature")]
        assert coordinator.data.get("temp_mean_indoor") == round(
            sum(readings) / len(readings), 1
        )

    async def test_humidity_mean_follows_the_same_rule(
        self, hass: HomeAssistant, setup_integration
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        readings = [
            coordinator.data.get(f"wall_sensor_{slot}_humidity")
            for slot in range(2, 7)
        ] + [coordinator.data.get("alfa_1_humidity")]
        assert coordinator.data.get("humidity_mean_indoor") == round(
            sum(readings) / len(readings), 1
        )

    async def test_co2_max_ignores_empty_slots(
        self, hass: HomeAssistant, setup_integration
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        present = [
            coordinator.data.get(f"wall_sensor_{slot}_co2") for slot in range(2, 7)
        ] + [coordinator.data.get("alfa_1_co2")]
        assert coordinator.data.get("co2_max") == max(present)

    async def test_a_unit_with_no_peripherals_reports_nothing(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        """Falling back to the duct probe keeps climate usable bare-bones."""
        fake_futura.poke(Table.INPUT, 67, 0)   # no wall sensors
        fake_futura.poke(Table.INPUT, 68, 0)
        fake_futura.poke(Table.INPUT, 75, 0)   # no ALFA
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        coordinator = hass.data[DOMAIN][config_entry.entry_id]
        assert coordinator.data.get("temp_mean_indoor") is None
        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["current_temperature"] == coordinator.data.get(
            "temp_indoor"
        )


class TestLimits:
    async def test_humidity_modes_match_the_app(
        self, hass: HomeAssistant, setup_integration
    ):
        state = hass.states.get("select.jablotron_futura_humidity_mode")
        assert state.attributes["options"] == ["dry", "comfort", "wet"]

    async def test_timer_ceilings_match_the_app(
        self, hass: HomeAssistant, setup_integration
    ):
        """Two hours for boost/circulation/overpressure, ten for night/party."""
        for name, hours in (
            ("boost_remaining", 2),
            ("circulation_remaining", 2),
            ("overpressure_remaining", 2),
            ("night_mode_remaining", 10),
            ("party_mode_remaining", 10),
        ):
            state = hass.states.get(f"number.jablotron_futura_{name}")
            assert state.attributes["max"] == hours * 3600, name

    async def test_set_function_rejects_over_the_ceiling(
        self, hass: HomeAssistant, setup_integration
    ):
        from homeassistant.exceptions import ServiceValidationError

        with pytest.raises(ServiceValidationError):
            await hass.services.async_call(
                DOMAIN, "set_function",
                {"function": "boost", "duration": 10800}, blocking=True)

    async def test_set_function_accepts_ten_hours_of_night(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            DOMAIN, "set_function",
            {"function": "night", "duration": 36000}, blocking=True)
        assert (4, [36000]) in fake_futura.writes


async def test_fan_reports_auto_preset(hass: HomeAssistant, setup_integration):
    state = hass.states.get("fan.jablotron_futura")
    assert state.state == "on"
    assert state.attributes["preset_mode"] == "auto"


async def test_valve_topology_is_exposed(hass: HomeAssistant, setup_integration):
    state = hass.states.get("sensor.jablotron_futura_supply_valves")
    assert state.state == "12"
    assert state.attributes["zones"]["1"] == [1, 2, 3, 4]
    assert state.attributes["rs485_unit_ids"][0] == 64
    assert state.attributes["position_available"] is False


class TestWrites:
    async def test_setting_fan_speed_writes_the_level(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "fan",
            "set_percentage",
            {"entity_id": "fan.jablotron_futura", "percentage": 60},
            blocking=True,
        )
        assert (0, [3]) in fake_futura.writes

    async def test_turning_off_writes_zero(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "fan", "turn_off", {"entity_id": "fan.jablotron_futura"}, blocking=True
        )
        assert (0, [0]) in fake_futura.writes

    async def test_setpoint_is_written_in_tenths(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "climate",
            "set_temperature",
            {"entity_id": "climate.jablotron_futura", "temperature": 21.5},
            blocking=True,
        )
        assert (10, [215]) in fake_futura.writes

    async def test_humidity_preset_writes_tenths(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "select",
            "select_option",
            {"entity_id": "select.jablotron_futura_humidity_mode", "option": "dry"},
            blocking=True,
        )
        assert (11, [250]) in fake_futura.writes

    async def test_boost_button_writes_seconds(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "button",
            "press",
            {"entity_id": "button.jablotron_futura_boost_60_minutes"},
            blocking=True,
        )
        assert (1, [3600]) in fake_futura.writes

    async def test_stop_all_uses_one_multi_write(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """Registers 1-5 are contiguous, so one FC16 beats five FC6 writes."""
        await hass.services.async_call(
            "button",
            "press",
            {"entity_id": "button.jablotron_futura_stop_all_functions"},
            blocking=True,
        )
        assert (1, [0, 0, 0, 0, 0]) in fake_futura.writes

    async def test_switch_toggles_bypass(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(
            "switch",
            "turn_off",
            {"entity_id": "switch.jablotron_futura_automatic_bypass"},
            blocking=True,
        )
        assert (14, [0]) in fake_futura.writes


class TestAwayService:
    async def test_away_is_one_write_across_all_four_registers(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """Holding 6-9 is one structure, so it goes in one FC16.

        This is the closer reading of the composite-register rule, not a fix for
        anything: neither one write nor two gets the unit to arm the function.
        See the note in the set_away handler.
        """
        import datetime as dt

        begin = dt.datetime(2026, 9, 1, 8, 0, tzinfo=dt.UTC)
        end = dt.datetime(2026, 9, 8, 18, 0, tzinfo=dt.UTC)
        await hass.services.async_call(
            DOMAIN, "set_away", {"begin": begin, "end": end}, blocking=True
        )
        payloads = [p for a, p in fake_futura.writes if a == 6]
        assert payloads, "nothing written to holding 6"
        assert len(payloads[-1]) == 4, "both timestamps go in a single request"
        assert 8 not in [a for a, _ in fake_futura.writes], (
            "a second write to 8 means the pair was split again"
        )

    async def test_away_uses_low_word_first(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        import datetime as dt

        from custom_components.jablotron_futura_modbus.coordinator import decode_u32

        begin = dt.datetime(2026, 9, 1, 8, 0, tzinfo=dt.UTC)
        await hass.services.async_call(
            DOMAIN, "set_away", {"begin": begin}, blocking=True
        )
        payload = next(p for a, p in fake_futura.writes if a == 6)
        # Reading the pair back with the device's own convention must return a
        # plausible timestamp, not one 65536 times too large.
        stored = decode_u32(payload, 0)
        assert 1_700_000_000 < stored < 2_000_000_000

    async def test_clear_away_zeroes_both_pairs(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        await hass.services.async_call(DOMAIN, "clear_away", {}, blocking=True)
        assert (6, [0, 0]) in fake_futura.writes
        assert (8, [0, 0]) in fake_futura.writes

    async def test_end_before_begin_is_rejected(
        self, hass: HomeAssistant, setup_integration
    ):
        import datetime as dt

        from homeassistant.exceptions import ServiceValidationError

        with pytest.raises(ServiceValidationError):
            await hass.services.async_call(
                DOMAIN,
                "set_away",
                {
                    "begin": dt.datetime(2026, 9, 8, tzinfo=dt.UTC),
                    "end": dt.datetime(2026, 9, 1, tzinfo=dt.UTC),
                },
                blocking=True,
            )


class TestResilience:
    async def test_disconnected_unit_marks_entities_unavailable(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        fake_futura.connected = False
        fake_futura.connect = _failing_connect
        async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=90))
        await hass.async_block_till_done()

        state = hass.states.get("sensor.jablotron_futura_air_flow")
        assert state.state == STATE_UNAVAILABLE

    async def test_ntc_disconnected_reports_nothing(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        """The probe register reads -99 C when nothing is plugged in."""
        fake_futura.poke(Table.INPUT, 38, 0x10000 - 990)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        coordinator = hass.data[DOMAIN][config_entry.entry_id]
        assert coordinator.data.get("temp_outdoor_ntc") is None


async def _failing_connect() -> bool:
    raise ConnectionError("unit unreachable")


class TestCardRegistration:
    """Serving the dashboard cards must never be able to break the entities."""

    async def test_setup_survives_a_card_registration_failure(
        self, hass: HomeAssistant, config_entry, mock_client
    ):
        from unittest.mock import patch

        with patch(
            "custom_components.jablotron_futura_modbus."
            "_async_register_cards",
            side_effect=RuntimeError("no frontend here"),
        ):
            config_entry.add_to_hass(hass)
            result = await hass.config_entries.async_setup(config_entry.entry_id)
            await hass.async_block_till_done()

        # The card helper raising must not take the integration down with it.
        assert result is False or hass.states.get("climate.jablotron_futura")

    async def test_missing_bundle_is_not_an_error(
        self, hass: HomeAssistant, config_entry, mock_client
    ):
        """A source checkout without a built bundle must still set up."""
        from unittest.mock import patch

        # Point at a name that cannot exist rather than patching Path.is_file,
        # which Home Assistant also relies on to discover the integration.
        with patch(
            "custom_components.jablotron_futura_modbus.CARD_FILENAME",
            "not-built.js",
        ):
            config_entry.add_to_hass(hass)
            assert await hass.config_entries.async_setup(config_entry.entry_id)
            await hass.async_block_till_done()

        assert hass.states.get("climate.jablotron_futura") is not None


class TestAwayTimestamps:
    async def test_away_registers_become_real_instants(
        self, hass: HomeAssistant, setup_integration
    ):
        """The unit stores local wall-clock seconds, not a UTC epoch."""
        import datetime as dt


        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        begin = coordinator.data.get("away_begin_at")
        assert isinstance(begin, dt.datetime)
        assert begin.tzinfo is not None

        raw = coordinator.data.get("away_begin")
        # Reinterpreting the stored seconds as local wall clock must reproduce
        # the same calendar time the unit would display.
        naive = dt.datetime.fromtimestamp(int(raw), dt.UTC).replace(tzinfo=None)
        assert begin.replace(tzinfo=None) == naive

    async def test_unset_away_reports_nothing(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        for address in (6, 7, 8, 9):
            fake_futura.poke(Table.HOLDING, address, 0)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        coordinator = hass.data[DOMAIN][config_entry.entry_id]
        assert coordinator.data.get("away_begin_at") is None
        assert coordinator.data.get("away_begin_set") is False


class TestHvacAction:
    async def test_standby_flag_is_read_with_its_prefix(
        self, hass: HomeAssistant, setup_integration
    ):
        """Mode flags are stored prefixed; an unprefixed lookup silently fails."""
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        assert "mode_standby" in coordinator.data.flags
        assert "standby" not in coordinator.data.flags

    async def test_standby_reports_off(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        from homeassistant.components.climate import HVACAction

        # Set fut_mode bit 20 (standby) in the low register.
        fake_futura.poke(Table.INPUT, 16, 1 << 20 & 0xFFFF)
        fake_futura.poke(Table.INPUT, 17, (1 << 20) >> 16)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["hvac_action"] == HVACAction.OFF

    async def test_heating_is_reported_when_the_post_heater_draws_power(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        from homeassistant.components.climate import HVACAction

        # Within the post-heater's rating: the design guide gives 0-350 W,
        # continuously regulated. A value above that would not be a state the
        # unit can reach.
        fake_futura.poke(Table.INPUT, 43, 310)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["hvac_action"] == HVACAction.HEATING


class TestPollingTiers:
    """Slow-tier values must survive the fast polls in between.

    The peripheral presence bitfields live in a slow-tier block, so if a fast
    poll rebuilds state from only what it just read, every peripheral drops out
    one interval after setup -- and the entities go unavailable while the unit is
    perfectly healthy.
    """

    async def test_peripherals_survive_a_fast_only_poll(
        self, hass: HomeAssistant, setup_integration
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        co2 = "sensor.jablotron_futura_co2_sensor_2_co2"
        assert hass.states.get(co2).state not in (STATE_UNKNOWN, STATE_UNAVAILABLE)

        # One fast interval later, still well inside the slow interval.
        async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=16))
        await hass.async_block_till_done()

        state = hass.states.get(co2)
        assert state.state not in (STATE_UNKNOWN, STATE_UNAVAILABLE), (
            "peripheral reading was lost on a fast-only poll"
        )

    async def test_slow_tier_values_persist_across_cycles(
        self, hass: HomeAssistant, setup_integration
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        for _ in range(3):
            async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=16))
            await hass.async_block_till_done()

        # These all come from slow-tier blocks.
        assert coordinator.data.present, "presence flags were lost"
        assert coordinator.data.topology.get("supply"), "valve topology was lost"
        assert coordinator.data.get("zone_priority") is not None
        assert coordinator.data.get("kitchenhood_volume") is not None

    async def test_a_slow_tier_write_survives_a_fast_only_poll(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """The bug behind "switch it to temperature and it goes back to CO2".

        `_build()` decodes from the cache, so a write that is not folded into the
        cached block lasts only until the next rebuild. For a fast-tier register
        the triggered refresh re-reads that block and hides the problem; a
        slow-tier register gets its stale block re-decoded alongside the fast
        ones and snaps back for up to a whole slow interval.
        """
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        entity = "select.jablotron_futura_zone_auto_priority"
        assert hass.states.get(entity).state == "co2"

        await hass.services.async_call(
            "select", "select_option",
            {"entity_id": entity, "option": "temperature"},
            blocking=True,
        )
        await hass.async_block_till_done()
        assert fake_futura.peek(Table.HOLDING, 20) == 0, "the write never landed"

        # A fast poll, well inside the slow interval, so holding 20..23 is not
        # re-read. This is where the value used to revert.
        async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=16))
        await hass.async_block_till_done()

        assert hass.states.get(entity).state == "temperature"

    async def test_a_slow_tier_write_survives_until_the_slow_poll_confirms_it(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """And the value the slow tier eventually reads back must agree."""
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        entity = "switch.jablotron_futura_kitchen_hood_normally_open"
        assert hass.states.get(entity).state == "on"

        await hass.services.async_call(
            "switch", "turn_off", {"entity_id": entity}, blocking=True)
        await hass.async_block_till_done()

        for seconds in (16, 32, 48, 70, 90):
            async_fire_time_changed(
                hass, dt_util.utcnow() + dt.timedelta(seconds=seconds))
            await hass.async_block_till_done()
            assert hass.states.get(entity).state == "off", f"reverted at t+{seconds}s"

        assert fake_futura.peek(Table.HOLDING, 21) == 0

    async def test_valve_topology_stays_populated(
        self, hass: HomeAssistant, setup_integration
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=16))
        await hass.async_block_till_done()

        state = hass.states.get("sensor.jablotron_futura_supply_valves")
        assert state.state == "12"
        assert state.attributes["zones"], "zone layout emptied out"

    async def test_derived_co2_summary_survives(
        self, hass: HomeAssistant, setup_integration
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=16))
        await hass.async_block_till_done()

        assert hass.states.get("sensor.jablotron_futura_highest_co2").state not in (
            STATE_UNKNOWN, STATE_UNAVAILABLE
        )
        assert hass.states.get("sensor.jablotron_futura_air_quality").state in (
            "good", "moderate", "poor"
        )


class TestOutdoorProbe:
    """Input register 38 is a separate outdoor probe, not the duct sensor."""

    async def test_enabled_and_distinct_from_the_duct_sensor(
        self, hass: HomeAssistant, setup_integration
    ):
        from homeassistant.helpers import entity_registry as er

        entry = er.async_get(hass).async_get(
            "sensor.jablotron_futura_outdoor_temperature"
        )
        assert entry is not None, "the outdoor probe should be created"
        assert entry.disabled_by is None, "it should be enabled by default"

        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        assert coordinator.data.get("temp_outdoor_ntc") is not None
        # Register 30 is the air entering the unit; 38 is the outdoor probe.
        assert "temp_ambient" in coordinator.data.values

    async def test_unplugged_probe_reports_nothing(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        fake_futura.poke(Table.INPUT, 38, 0x10000 - 990)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        coordinator = hass.data[DOMAIN][config_entry.entry_id]
        assert coordinator.data.get("temp_outdoor_ntc") is None
        state = hass.states.get("sensor.jablotron_futura_outdoor_temperature")
        assert state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE)


class TestFanOutput:
    """Registers 45 and 46 are PWM percentages, not watts."""

    async def test_reported_as_percentages(
        self, hass: HomeAssistant, setup_integration
    ):
        for side in ("supply", "exhaust"):
            state = hass.states.get(f"sensor.jablotron_futura_{side}_fan_output")
            assert state is not None, side
            assert state.attributes["unit_of_measurement"] == "%"
            assert 0 <= float(state.state) <= 100

    async def test_distinct_from_the_rpm_readings(
        self, hass: HomeAssistant, setup_integration
    ):
        output = hass.states.get("sensor.jablotron_futura_supply_fan_output")
        rpm = hass.states.get("sensor.jablotron_futura_supply_fan_speed")
        assert output.attributes["unit_of_measurement"] == "%"
        assert rpm.attributes["unit_of_measurement"] == "rpm"
        assert float(output.state) != float(rpm.state)


class TestSetpointRange:
    """The unit accepts 16-28 degrees, narrower than the register allows."""

    async def test_climate_advertises_the_real_limits(
        self, hass: HomeAssistant, setup_integration
    ):
        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["min_temp"] == 16.0
        assert state.attributes["max_temp"] == 28.0
        assert state.attributes["target_temp_step"] == 0.5

    async def test_number_entity_matches(self, hass: HomeAssistant, setup_integration):
        state = hass.states.get("number.jablotron_futura_target_temperature")
        assert state.attributes["min"] == 16.0
        assert state.attributes["max"] == 28.0

    async def test_out_of_range_is_refused(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        from homeassistant.exceptions import ServiceValidationError

        for bad in (15.5, 28.5, 30.0):
            with pytest.raises(ServiceValidationError):
                await hass.services.async_call(
                    "climate", "set_temperature",
                    {"entity_id": "climate.jablotron_futura", "temperature": bad},
                    blocking=True)
        assert not any(address == 10 for address, _ in fake_futura.writes)

    async def test_the_bounds_themselves_are_accepted(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        for good, raw in ((16.0, 160), (28.0, 280)):
            await hass.services.async_call(
                "climate", "set_temperature",
                {"entity_id": "climate.jablotron_futura", "temperature": good},
                blocking=True)
            assert (10, [raw]) in fake_futura.writes


class TestWriteRefreshDebounce:
    """A burst of writes must not read the unit once per write.

    The unit exposes a single Modbus socket, and holding a +/- button would
    otherwise issue a full register sweep per keypress — visible as unrelated
    sensors such as the outdoor probe re-sampling on every tap.
    """

    async def test_debouncer_is_configured_to_coalesce(
        self, hass: HomeAssistant, setup_integration
    ):
        from custom_components.jablotron_futura_modbus.const import (
            WRITE_REFRESH_COOLDOWN,
        )

        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        debouncer = coordinator._debounced_refresh
        assert debouncer.cooldown == WRITE_REFRESH_COOLDOWN
        # immediate=True would defeat the point: the first press would still
        # trigger its own full read.
        assert debouncer.immediate is False

    async def test_a_burst_of_writes_causes_one_refresh(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        import datetime as dt

        from homeassistant.util import dt as dt_util
        from pytest_homeassistant_custom_component.common import async_fire_time_changed

        from custom_components.jablotron_futura_modbus.const import (
            WRITE_REFRESH_COOLDOWN,
        )

        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        blocks_per_poll = len(
            [b for b in coordinator.blocks if b.gate_keys() <= coordinator.data.present]
        )
        assert blocks_per_poll > 1

        fake_futura.reads = 0
        for value in (21.0, 21.5, 22.0, 22.5, 23.0):
            await hass.services.async_call(
                "climate", "set_temperature",
                {"entity_id": "climate.jablotron_futura", "temperature": value},
                blocking=True)
        await hass.async_block_till_done()
        during = fake_futura.reads

        async_fire_time_changed(
            hass,
            dt_util.utcnow() + dt.timedelta(seconds=WRITE_REFRESH_COOLDOWN + 1),
        )
        await hass.async_block_till_done()
        after = fake_futura.reads

        assert all(
            (10, [int(v * 10)]) in fake_futura.writes
            for v in (21.0, 21.5, 22.0, 22.5, 23.0)
        ), "every write should still reach the unit"
        # Five writes must not produce five sweeps.
        assert during < 5 * blocks_per_poll, (
            f"{during} reads during 5 writes looks like one sweep per write"
        )
        assert after > during, "the coalesced refresh should still happen"


class TestVentilationRegisterIsNotSharedWithMode:
    """Speed and mode both live in holding 0, and must not fight over it.

    Register 0 takes 0 (off), 1-5 (a preset level) or 6 (automatic). An earlier
    design put the whole range in fan_mode, `off` included, and declared a single
    hvac_mode so no mode picker would appear. Home Assistant renders a
    single-option picker anyway, so mode now carries off/heat/cool/fan_only and
    fan_mode carries the speed alone — off appears in exactly one of them.
    """

    async def test_fan_modes_are_speeds_only(
        self, hass: HomeAssistant, setup_integration
    ):
        state = hass.states.get("climate.jablotron_futura")
        assert state.attributes["fan_modes"] == ["1", "2", "3", "4", "5", "auto"]
        assert "off" not in state.attributes["fan_modes"]

    async def test_no_power_button_beside_the_mode_picker(
        self, hass: HomeAssistant, setup_integration
    ):
        from homeassistant.components.climate import ClimateEntityFeature

        features = hass.states.get(
            "climate.jablotron_futura").attributes["supported_features"]
        # HVACMode.OFF already turns the unit off; a power control would be a
        # second widget writing the same register.
        assert not features & ClimateEntityFeature.TURN_ON
        assert not features & ClimateEntityFeature.TURN_OFF

    async def test_each_speed_writes_its_register_value(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        for option, raw in (("1", 1), ("3", 3), ("5", 5), ("auto", 6)):
            await hass.services.async_call(
                "climate", "set_fan_mode",
                {"entity_id": "climate.jablotron_futura", "fan_mode": option},
                blocking=True)
            await hass.async_block_till_done()
            assert (0, [raw]) in fake_futura.writes, option
            assert hass.states.get(
                "climate.jablotron_futura").attributes["fan_mode"] == option

    async def test_off_reads_back_as_the_off_mode(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        from homeassistant.components.climate import HVACAction

        fake_futura.poke(Table.HOLDING, 0, 0)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        state = hass.states.get("climate.jablotron_futura")
        assert state.state == "off"
        assert state.attributes["hvac_action"] == HVACAction.OFF
        assert state.attributes["fan_mode"] is None

    async def test_the_dial_still_works_while_off(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        """Temperature is a separate register, so it stays settable."""
        fake_futura.poke(Table.HOLDING, 0, 0)
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        await hass.services.async_call(
            "climate", "set_temperature",
            {"entity_id": "climate.jablotron_futura", "temperature": 22.0},
            blocking=True)
        assert (10, [220]) in fake_futura.writes


class TestHvacActionHonesty:
    """The action must not claim cooling the unit cannot report."""

    async def test_plain_ventilation_reports_no_action(
        self, hass: HomeAssistant, setup_integration
    ):
        """A permanent "Fan" under the dial restates the fan-mode control.

        The states that carry information still get through, so the label stays
        worth reading when it appears.
        """
        state = hass.states.get("climate.jablotron_futura")
        assert state.state == "cool"        # set to cool...
        # ...but idle. Returning None drops the attribute rather than setting it
        # to None, which is what leaves the dial's centre blank.
        assert "hvac_action" not in state.attributes

    async def test_open_bypass_is_not_reported_as_cooling(
        self, hass: HomeAssistant, config_entry, mock_client, fake_futura
    ):
        # Bypass open (fut_mode bit 11) with outside cooler than inside — the
        # exact state that used to print "Cooling" with additional cooling off.
        fake_futura.poke(Table.INPUT, 16, (1 << 11) | (1 << 8))
        fake_futura.poke(Table.INPUT, 17, 0)
        fake_futura.poke(Table.INPUT, 30, 180)   # outside 18.0
        fake_futura.poke(Table.INPUT, 32, 240)   # inside  24.0
        fake_futura.poke(Table.HOLDING, 16, 0)   # additional cooling off
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        state = hass.states.get("climate.jablotron_futura")
        assert "hvac_action" not in state.attributes
        # Mode follows the switch, not the bypass.
        assert state.state == "fan_only"
        # The bypass itself is still reported, just not as cooling.
        assert hass.states.get("binary_sensor.jablotron_futura_bypass_open").state == "on"


class TestPeripheralsAppearLate:
    """A peripheral missed on the first poll must not be lost for the session.

    Presence is decoded from a slow-tier block, and entity creation used to be
    gated on it once, at platform setup. On a unit that serves exactly one
    Modbus socket, a first poll that comes up without presence -- a socket the
    previous run has not released yet, a slow first response -- meant the
    peripheral entities were never created at all. Home Assistant then showed
    the ones it remembered as "no longer being provided by the integration" and
    they stayed unavailable, with their history stopped, until the next restart.

    That is not hypothetical: it happened on the real unit, and five CO2 sensors
    and an ALFA went dark for four hours.
    """

    @pytest.fixture
    def blind_first_poll(self, fake_futura):
        """Presence reads zero, as if the bitfields had not been read yet."""
        saved = {
            addr: fake_futura._store[Table.INPUT][addr] for addr in (67, 68, 75)
        }
        for addr in saved:
            fake_futura._store[Table.INPUT][addr] = 0
        yield saved

    async def test_a_late_peripheral_still_gets_its_entity(
        self,
        hass: HomeAssistant,
        config_entry,
        mock_client,
        fake_futura,
        blind_first_poll,
    ):
        config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        coordinator = hass.data[DOMAIN][config_entry.entry_id]
        assert coordinator.data.present == set() or not any(
            gate.startswith(("wall_sensor_present", "alfa_present"))
            for gate in coordinator.data.present
        )
        # Nothing to gate on, so nothing gated exists yet.
        assert hass.states.get("sensor.jablotron_futura_alfa_1_co2") is None

        # The bitfields turn up on a later poll. Presence lives in a slow-tier
        # block, and the slow tier is paced by time.monotonic(), which Home
        # Assistant's virtual clock does not advance -- so the due time is moved
        # instead of the clock. In the field this is why recovery takes up to one
        # slow interval rather than one fast one.
        for addr, value in blind_first_poll.items():
            fake_futura._store[Table.INPUT][addr] = value
        coordinator._last_slow = 0.0
        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert "alfa_present_1" in coordinator.data.present
        state = hass.states.get("sensor.jablotron_futura_alfa_1_co2")
        assert state is not None, "the ALFA never got an entity"
        assert state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)

    async def test_an_entity_is_added_once_only(
        self, hass: HomeAssistant, setup_integration, hass_storage
    ):
        """Repeated updates must not re-add what is already there."""
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        before = len(hass.states.async_entity_ids("sensor"))
        for _ in range(3):
            await coordinator.async_refresh()
            await hass.async_block_till_done()
        assert len(hass.states.async_entity_ids("sensor")) == before
