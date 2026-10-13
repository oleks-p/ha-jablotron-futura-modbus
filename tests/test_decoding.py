"""The three encodings this device mixes, and the traps in each."""

from __future__ import annotations

import pytest

from custom_components.jablotron_futura_modbus.coordinator import (
    decode_firmware,
    decode_i16,
    decode_mac,
    decode_register,
    decode_u32,
    encode_u32,
    firmware_tuple,
)
from custom_components.jablotron_futura_modbus.registers import BY_KEY, Kind


class TestWordOrder:
    """uint32 is little-endian by word: the first register holds the low half.

    Every published fork of the earlier integration got this backwards, which
    silently shifts each status bit by 16 places.
    """

    def test_low_word_comes_first(self):
        assert decode_u32([0x0001, 0x0000], 0) == 1
        assert decode_u32([0x0000, 0x0001], 0) == 0x10000

    def test_serial_number_matches_the_label(self):
        # This ordering was confirmed by reading a real unit's serial registers
        # and comparing against the number its app displays. The literal is
        # synthetic here so the repository carries no hardware identifiers.
        assert decode_u32([0x5678, 0x1234], 0) == 0x12345678

    def test_hardware_revision_matches_the_app(self):
        assert decode_u32([166, 2], 0) == 131238

    def test_mode_bit_zero_lives_in_the_low_register(self):
        reg = BY_KEY["mode_bits"]
        # Boost is bit 0, so it must come from the first register, not the second.
        assert decode_register(reg, [0x0001, 0x0000], 0) & 1
        assert not decode_register(reg, [0x0000, 0x0001], 0) & 1

    def test_high_bits_live_in_the_second_register(self):
        # A real reading of [388, 32] is bits 2, 7, 8 and 21 -- the last of which
        # is zone boost and can only come from the high register.
        value = decode_u32([388, 32], 0)
        assert [b for b in range(32) if value >> b & 1] == [2, 7, 8, 21]

    def test_encode_round_trips(self):
        for value in (0, 1, 0xFFFF, 0x10000, 1761120497, 0xFFFFFFFF):
            assert decode_u32(encode_u32(value), 0) == value

    def test_encode_puts_the_low_word_first(self):
        assert encode_u32(0x12345678) == [0x5678, 0x1234]


class TestMac:
    """The MAC array swaps the two bytes inside each register."""

    def test_matches_the_real_address(self):
        # Verified against a real unit's printed MAC; values synthetic here.
        assert decode_mac([0x1300, 0x00B0, 0x0100]) == "00:13:b0:00:00:01"

    def test_is_not_the_naive_big_endian_reading(self):
        # The naive reading would swap every pair and produce a different MAC.
        assert decode_mac([0x1300, 0x00B0, 0x0100]) != "13:00:00:b0:01:00"

    def test_through_the_register_table(self):
        reg = BY_KEY["mac_address"]
        assert reg.kind is Kind.MAC and reg.words == 3
        assert decode_register(reg, [0x1300, 0x00B0, 0x0100], 0) == (
            "00:13:b0:00:00:01"
        )


class TestFirmware:
    """Firmware is not a uint32; the low register packs major and minor."""

    def test_matches_the_app(self):
        assert decode_firmware([1812, 9999]) == "FUA.P.07.20"

    def test_tuple_for_the_version_floor_check(self):
        assert firmware_tuple([1812, 9999]) == (7, 20)

    def test_high_register_is_ignored(self):
        assert decode_firmware([1812, 0]) == decode_firmware([1812, 9999])

    @pytest.mark.parametrize(
        ("word", "expected"),
        [(0x0500, "FUA.P.05.00"), (0x0714, "FUA.P.07.20"), (0x0A01, "FUA.P.10.01")],
    )
    def test_byte_packing(self, word, expected):
        assert decode_firmware([word, 9999]) == expected


class TestSignedAndScaled:
    def test_sign_boundary(self):
        assert decode_i16(0x7FFF) == 32767
        assert decode_i16(0x8000) == -32768
        assert decode_i16(0xFFFF) == -1

    def test_negative_temperature(self):
        reg = BY_KEY["temp_ambient"]
        # -12.5 C arrives as the two's-complement of 125.
        assert decode_register(reg, [0x10000 - 125], 0) == -12.5

    def test_tenths_scaling(self):
        assert decode_register(BY_KEY["temp_indoor"], [237], 0) == 23.7
        assert decode_register(BY_KEY["humidity_indoor"], [525], 0) == 52.5

    def test_millivolts_to_volts(self):
        # The spec calls register 52 "0.001 mV"; it is millivolts.
        assert decode_register(BY_KEY["rtc_battery_voltage"], [3073], 0) == 3.073

    def test_negative_correction(self):
        reg = BY_KEY["wall_sensor_2_temp_correction"]
        assert decode_register(reg, [65524], 0) == -1.2

    def test_unscaled_stays_integral(self):
        assert decode_register(BY_KEY["air_flow"], [366], 0) == 366
        assert decode_register(BY_KEY["filter_wear"], [27], 0) == 27


class TestRegisterTable:
    def test_keys_are_unique(self):
        from custom_components.jablotron_futura_modbus.registers import REGISTERS

        assert len(BY_KEY) == len(REGISTERS)

    def test_composite_widths(self):
        assert BY_KEY["serial_number"].words == 2
        assert BY_KEY["mac_address"].words == 3
        assert BY_KEY["mode_bits"].words == 2
        assert BY_KEY["device_id"].words == 1

    def test_reserved_warning_bits_are_absent(self):
        """Bits 6 and 7 of fut_warning are undefined and must not be entities."""
        from custom_components.jablotron_futura_modbus.registers import WARNING_BITS

        assert 6 not in WARNING_BITS
        assert 7 not in WARNING_BITS
        assert set(WARNING_BITS) == {0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13}

    def test_fan_output_is_a_percentage(self):
        """Registers 45 and 46 are PWM percent, not watts."""
        assert BY_KEY["fan_pwm_supply"].unit == "%"
        assert BY_KEY["fan_pwm_exhaust"].unit == "%"


class TestValveTopology:
    def test_bit_maps_to_zone_valve_and_unit_id(self):
        from custom_components.jablotron_futura_modbus.registers import (
            decode_valve_topology,
        )

        # A real supply reading: 12 valves across six zones.
        supply = decode_valve_topology(decode_u32([3903, 257], 0), exhaust=False)
        assert len(supply) == 12
        assert supply[0] == {
            "bit": 0, "zone": 1, "valve": 1, "rs485_unit_id": 64,
        }
        # bit 8 is the second valve of zone 1, on the next unit-id block.
        by_bit = {v["bit"]: v for v in supply}
        assert by_bit[8] == {
            "bit": 8, "zone": 1, "valve": 2, "rs485_unit_id": 72,
        }

    def test_exhaust_uses_a_different_unit_id_base(self):
        from custom_components.jablotron_futura_modbus.registers import (
            decode_valve_topology,
        )

        exhaust = decode_valve_topology(decode_u32([783, 1], 0), exhaust=True)
        assert len(exhaust) == 7
        assert exhaust[0]["rs485_unit_id"] == 96
