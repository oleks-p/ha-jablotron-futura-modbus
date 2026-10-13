"""The Jablotron Futura register map -- single source of truth.

Every platform, the block planner and the diagnostics dump read from the tables
here, so a register is declared exactly once.

Derived from FU_DOC_TCP_CS40.pdf (register map v4.00, 2022-11-30) and verified
live against a Futura L on firmware FUA.P.07.20.

Three encoding conventions coexist in this device and are easy to confuse:

* ``U32`` -- the FIRST register holds the LOW 16 bits.  ``value = (r[1] << 16) | r[0]``
  and writes must send ``[lo, hi]``.  Verified: ``fut_mode`` reads ``[388, 32]``,
  which is bits 2/7/8/21; the opposite order would be bits 5/18/23/24.
* ``MAC`` -- an array of 3 registers whose two bytes are LITTLE-endian *within*
  each register.  Verified: ``[0x1300, 0x00B0, 0x0100]`` is ``00:13:b0:00:00:01``.
* ``FIRMWARE`` -- not a u32 at all.  The low register packs major/minor as two
  bytes; the high register is a constant marker (9999).  Verified: ``1812`` is
  ``FUA.P.07.20``.

Composite registers are atomic: a read that starts or ends mid-composite returns
ILLEGAL_DATA_ADDRESS.  Confirmed by scanning accepted read counts at input 0 --
``[1, 3, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22]`` is exactly the boundary set of
u16, u32, mac[3], u32, u32, u32, u32, u16, u16, u32, u32, u32.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from .const import (
    TEMP_SETPOINT_MAX,
    TEMP_SETPOINT_MIN,
    TEMP_SETPOINT_STEP,
)


class Table(StrEnum):
    """Which Modbus table a register lives in."""

    INPUT = "input"      # read-only, FC4
    HOLDING = "holding"  # read/write, FC3 / FC6 / FC16


class Kind(StrEnum):
    """How the raw registers decode into a value."""

    U16 = "u16"
    I16 = "i16"
    U32 = "u32"
    BITS16 = "bits16"
    BITS32 = "bits32"
    MAC = "mac"
    FIRMWARE = "firmware"


class Tier(StrEnum):
    """How often a register needs re-reading."""

    ONCE = "once"    # immutable identity, read at setup
    FAST = "fast"    # live values
    SLOW = "slow"    # configuration and statistics


#: Registers whose value spans more than one address.
WORDS: dict[Kind, int] = {
    Kind.U16: 1,
    Kind.I16: 1,
    Kind.U32: 2,
    Kind.BITS16: 1,
    Kind.BITS32: 2,
    Kind.MAC: 3,
    Kind.FIRMWARE: 2,
}


@dataclass(frozen=True, slots=True)
class Reg:
    """One logical value in the Futura register map."""

    key: str
    table: Table
    address: int
    kind: Kind = Kind.U16
    scale: float = 1.0
    unit: str | None = None
    device_class: str | None = None
    state_class: str | None = None
    name: str = ""
    tier: Tier = Tier.FAST
    writable: bool = False
    min_value: float | None = None
    max_value: float | None = None
    step: float | None = None
    diagnostic: bool = False
    config: bool = False
    enabled_default: bool = True
    # Gate on a decoded presence flag, e.g. "wall_sensor_present_3".
    available_if: str | None = None
    # Free-form notes surfaced in diagnostics.
    note: str = ""

    @property
    def words(self) -> int:
        return WORDS[self.kind]

    @property
    def end(self) -> int:
        """Last address occupied, inclusive."""
        return self.address + self.words - 1


def _identity() -> list[Reg]:
    return [
        Reg("device_id", Table.INPUT, 0, Kind.U16, tier=Tier.ONCE,
            name="Device ID", diagnostic=True, note="always 39 for Futura"),
        Reg("serial_number", Table.INPUT, 1, Kind.U32, tier=Tier.ONCE,
            name="Serial number", diagnostic=True),
        Reg("mac_address", Table.INPUT, 3, Kind.MAC, tier=Tier.ONCE,
            name="MAC address", diagnostic=True),
        Reg("hw_revision", Table.INPUT, 6, Kind.U32, tier=Tier.ONCE,
            name="Hardware revision", diagnostic=True),
        Reg("firmware", Table.INPUT, 8, Kind.FIRMWARE, tier=Tier.ONCE,
            name="Firmware version", diagnostic=True),
        Reg("build_number", Table.INPUT, 10, Kind.U32, tier=Tier.ONCE,
            name="Build number", diagnostic=True, enabled_default=False,
            note="spec: unused, reads 0"),
        Reg("regmap_version", Table.INPUT, 12, Kind.U32, tier=Tier.ONCE,
            name="Register map version", diagnostic=True, enabled_default=False),
        # Superseded for display purposes by the derived "model" sensor, so the
        # raw code is kept for diagnostics but off by default.
        Reg("variant", Table.INPUT, 14, Kind.U16, tier=Tier.ONCE,
            name="Model variant", diagnostic=True, enabled_default=False,
            note="0/1 = Futura L, 2 = Futura M"),
    ]


def _status() -> list[Reg]:
    return [
        Reg("config_bits", Table.INPUT, 15, Kind.BITS16, tier=Tier.FAST,
            name="Capabilities", diagnostic=True,
            note="bit 9 is set on FW 7.20 but undocumented"),
        Reg("mode_bits", Table.INPUT, 16, Kind.BITS32, name="Operating mode flags",
            diagnostic=True),
        Reg("error_bits", Table.INPUT, 18, Kind.BITS32, name="Error flags",
            diagnostic=True),
        Reg("warning_bits", Table.INPUT, 20, Kind.BITS32, name="Warning flags",
            diagnostic=True),
    ]


def _climate_sensors() -> list[Reg]:
    temps = [
        ("temp_ambient", 30, "Outside air temperature"),
        ("temp_fresh", 31, "Supply air temperature"),
        ("temp_indoor", 32, "Extract air temperature"),
        ("temp_waste", 33, "Exhaust air temperature"),
    ]
    humis = [
        ("humidity_ambient", 34, "Outside air humidity"),
        ("humidity_fresh", 35, "Supply air humidity"),
        ("humidity_indoor", 36, "Extract air humidity"),
        ("humidity_waste", 37, "Exhaust air humidity"),
    ]
    regs = [
        Reg(key, Table.INPUT, addr, Kind.I16, scale=0.1, unit="°C",
            device_class="temperature", state_class="measurement", name=name)
        for key, addr, name in temps
    ]
    regs += [
        Reg(key, Table.INPUT, addr, Kind.I16, scale=0.1, unit="%",
            device_class="humidity", state_class="measurement", name=name)
        for key, addr, name in humis
    ]
    regs.append(
        # A separate outdoor probe, distinct from the outside-air duct sensor at
        # register 30: it reads the real outdoor temperature rather than the air
        # entering the unit. Reports nothing when no probe is wired up.
        Reg("temp_outdoor_ntc", Table.INPUT, 38, Kind.I16, scale=0.1, unit="°C",
            device_class="temperature", state_class="measurement",
            name="Outdoor temperature",
            note="raw -990 means the probe is unplugged")
    )
    return regs


def _performance() -> list[Reg]:
    return [
        Reg("filter_wear", Table.INPUT, 40, unit="%", state_class="measurement",
            name="Filter clogging"),
        Reg("power_consumption", Table.INPUT, 41, unit="W", device_class="power",
            state_class="measurement", name="Power consumption"),
        Reg("heat_recovered", Table.INPUT, 42, unit="W", device_class="power",
            state_class="measurement", name="Heat recovered"),
        # The unit's own electric post-heater, which the design guide rates at
        # 0-350 W continuously regulated. Not the CoolBreeze: that module runs off
        # a separate 230 V / 16 A supply, so none of its 460 W cooling or 660 W
        # heating draw reaches this register or `power_consumption`.
        Reg("heating_power", Table.INPUT, 43, unit="W", device_class="power",
            state_class="measurement", name="Post-heater power"),
        Reg("air_flow", Table.INPUT, 44, unit="m³/h", state_class="measurement",
            name="Air flow"),
        Reg("fan_pwm_supply", Table.INPUT, 45, unit="%", state_class="measurement",
            name="Supply fan output", note="percent, not watts"),
        Reg("fan_pwm_exhaust", Table.INPUT, 46, unit="%", state_class="measurement",
            name="Exhaust fan output", note="percent, not watts"),
        Reg("fan_rpm_supply", Table.INPUT, 47, unit="rpm", state_class="measurement",
            name="Supply fan speed"),
        Reg("fan_rpm_exhaust", Table.INPUT, 48, unit="rpm", state_class="measurement",
            name="Exhaust fan speed"),
        Reg("uin1_voltage", Table.INPUT, 49, scale=0.001, unit="V",
            device_class="voltage", state_class="measurement", name="Input UIN1 voltage",
            diagnostic=True, enabled_default=False),
        Reg("uin2_voltage", Table.INPUT, 50, scale=0.001, unit="V",
            device_class="voltage", state_class="measurement", name="Input UIN2 voltage",
            diagnostic=True, enabled_default=False),
        Reg("digital_inputs", Table.INPUT, 51, Kind.BITS16, name="Digital inputs",
            diagnostic=True),
        Reg("rtc_battery_voltage", Table.INPUT, 52, scale=0.001, unit="V",
            device_class="voltage", state_class="measurement",
            name="RTC battery voltage", diagnostic=True,
            note="PDF says 0.001 mV; it is mV -- reads 3073 = 3.073 V"),
    ]


def _statistics_and_presence() -> list[Reg]:
    return [
        Reg("stat_reads", Table.INPUT, 60, Kind.U32, tier=Tier.SLOW,
            state_class="total_increasing", name="Modbus reads",
            diagnostic=True, enabled_default=False),
        Reg("stat_writes", Table.INPUT, 62, Kind.U32, tier=Tier.SLOW,
            state_class="total_increasing", name="Modbus writes",
            diagnostic=True, enabled_default=False),
        Reg("stat_fails", Table.INPUT, 64, Kind.U32, tier=Tier.SLOW,
            state_class="total_increasing", name="Modbus failures",
            diagnostic=True, enabled_default=False),
        Reg("connected_wall_ui", Table.INPUT, 66, Kind.BITS16, tier=Tier.SLOW,
            name="Wall controllers connected", diagnostic=True),
        Reg("connected_wall_sensors", Table.INPUT, 67, Kind.BITS32, tier=Tier.SLOW,
            name="Wall sensors connected", diagnostic=True),
        Reg("connected_coolbreeze", Table.INPUT, 69, Kind.U16, tier=Tier.SLOW,
            name="CoolBreeze connected", diagnostic=True),
        Reg("connected_valve_supply", Table.INPUT, 70, Kind.BITS32, tier=Tier.SLOW,
            name="Supply valves connected", diagnostic=True),
        Reg("connected_valve_exhaust", Table.INPUT, 72, Kind.BITS32, tier=Tier.SLOW,
            name="Exhaust valves connected", diagnostic=True),
        Reg("connected_buttons", Table.INPUT, 74, Kind.BITS16, tier=Tier.SLOW,
            name="Boost buttons connected", diagnostic=True),
        Reg("connected_alfa", Table.INPUT, 75, Kind.BITS16, tier=Tier.SLOW,
            name="ALFA controllers connected", diagnostic=True),
        Reg("zone_identify", Table.INPUT, 80, Kind.BITS16, tier=Tier.SLOW,
            name="Zone identify mode", diagnostic=True,
            note="identify-mode state per zone, not zone presence"),
    ]


def _peripherals() -> list[Reg]:
    """Wall UI controllers, wall CO2 sensors and ALFA controllers.

    Wall UI and wall sensors use a stride of 5; ALFA uses a stride of 10 but
    only the first 6 registers of each slot exist.
    """
    regs: list[Reg] = []

    for slot in range(1, 4):
        base = 100 + (slot - 1) * 5
        gate = f"wall_ui_present_{slot}"
        regs += [
            Reg(f"wall_ui_{slot}_address", Table.INPUT, base, tier=Tier.SLOW,
                name=f"Wall controller {slot} bus address", diagnostic=True,
                enabled_default=False, available_if=gate),
            Reg(f"wall_ui_{slot}_options", Table.INPUT, base + 1, Kind.BITS16,
                tier=Tier.SLOW, name=f"Wall controller {slot} options",
                diagnostic=True, enabled_default=False, available_if=gate),
            Reg(f"wall_ui_{slot}_co2", Table.INPUT, base + 2, unit="ppm",
                device_class="carbon_dioxide", state_class="measurement",
                name=f"Wall controller {slot} CO2", available_if=gate),
            Reg(f"wall_ui_{slot}_temperature", Table.INPUT, base + 3, Kind.I16,
                scale=0.1, unit="°C", device_class="temperature",
                state_class="measurement",
                name=f"Wall controller {slot} temperature", available_if=gate),
            Reg(f"wall_ui_{slot}_humidity", Table.INPUT, base + 4, scale=0.1,
                unit="%", device_class="humidity", state_class="measurement",
                name=f"Wall controller {slot} humidity", available_if=gate),
        ]

    for slot in range(1, 9):
        base = 115 + (slot - 1) * 5
        gate = f"wall_sensor_present_{slot}"
        regs += [
            Reg(f"wall_sensor_{slot}_address", Table.INPUT, base, tier=Tier.SLOW,
                name=f"CO2 sensor {slot} bus address", diagnostic=True,
                enabled_default=False, available_if=gate),
            Reg(f"wall_sensor_{slot}_options", Table.INPUT, base + 1, Kind.BITS16,
                tier=Tier.SLOW, name=f"CO2 sensor {slot} options",
                diagnostic=True, enabled_default=False, available_if=gate),
            Reg(f"wall_sensor_{slot}_co2", Table.INPUT, base + 2, unit="ppm",
                device_class="carbon_dioxide", state_class="measurement",
                name=f"CO2 sensor {slot} CO2", available_if=gate),
            Reg(f"wall_sensor_{slot}_temperature", Table.INPUT, base + 3, Kind.I16,
                scale=0.1, unit="°C", device_class="temperature",
                state_class="measurement", name=f"CO2 sensor {slot} temperature",
                available_if=gate),
            Reg(f"wall_sensor_{slot}_humidity", Table.INPUT, base + 4, scale=0.1,
                unit="%", device_class="humidity", state_class="measurement",
                name=f"CO2 sensor {slot} humidity", available_if=gate),
        ]

    for slot in range(1, 9):
        base = 160 + (slot - 1) * 10
        gate = f"alfa_present_{slot}"
        regs += [
            Reg(f"alfa_{slot}_address", Table.INPUT, base, tier=Tier.SLOW,
                name=f"ALFA {slot} bus address", diagnostic=True,
                enabled_default=False, available_if=gate),
            Reg(f"alfa_{slot}_options", Table.INPUT, base + 1, Kind.BITS16,
                tier=Tier.SLOW, name=f"ALFA {slot} options", diagnostic=True,
                enabled_default=False, available_if=gate),
            Reg(f"alfa_{slot}_co2", Table.INPUT, base + 2, unit="ppm",
                device_class="carbon_dioxide", state_class="measurement",
                name=f"ALFA {slot} CO2", available_if=gate),
            Reg(f"alfa_{slot}_temperature", Table.INPUT, base + 3, Kind.I16,
                scale=0.1, unit="°C", device_class="temperature",
                state_class="measurement", name=f"ALFA {slot} temperature",
                available_if=gate),
            Reg(f"alfa_{slot}_humidity", Table.INPUT, base + 4, scale=0.1, unit="%",
                device_class="humidity", state_class="measurement",
                name=f"ALFA {slot} humidity", available_if=gate),
            Reg(f"alfa_{slot}_ntc_temperature", Table.INPUT, base + 5, Kind.I16,
                scale=0.1, unit="°C", device_class="temperature",
                state_class="measurement", name=f"ALFA {slot} NTC temperature",
                enabled_default=False, available_if=gate),
        ]

    return regs


def _controls() -> list[Reg]:
    return [
        Reg("ventilation", Table.HOLDING, 0, writable=True, name="Ventilation level",
            min_value=0, max_value=6, step=1,
            note="0 = off, 1-5 = preset level, 6 = automatic"),
        Reg("boost_timer", Table.HOLDING, 1, writable=True, unit="s",
            device_class="duration", name="Boost remaining",
            min_value=0, max_value=7200, step=60),
        Reg("circulation_timer", Table.HOLDING, 2, writable=True, unit="s",
            device_class="duration", name="Circulation remaining",
            min_value=0, max_value=7200, step=60),
        Reg("overpressure_timer", Table.HOLDING, 3, writable=True, unit="s",
            device_class="duration", name="Overpressure remaining",
            min_value=0, max_value=7200, step=60),
        # The app allows ten hours for both, beyond what the map documents.
        Reg("night_timer", Table.HOLDING, 4, writable=True, unit="s",
            device_class="duration", name="Night mode remaining",
            min_value=0, max_value=36000, step=60),
        Reg("party_timer", Table.HOLDING, 5, writable=True, unit="s",
            device_class="duration", name="Party mode remaining",
            min_value=0, max_value=36000, step=60),
        Reg("away_begin", Table.HOLDING, 6, Kind.U32, writable=True,
            name="Away begins", note="unix timestamp in LOCAL time, 0 = off"),
        Reg("away_end", Table.HOLDING, 8, Kind.U32, writable=True,
            name="Away ends", note="unix timestamp in LOCAL time, 0 = off"),
        Reg("temperature_setpoint", Table.HOLDING, 10, scale=0.1, writable=True,
            unit="°C", device_class="temperature", name="Target temperature",
            min_value=TEMP_SETPOINT_MIN, max_value=TEMP_SETPOINT_MAX,
            step=TEMP_SETPOINT_STEP),
        Reg("humidity_setpoint", Table.HOLDING, 11, scale=0.1, writable=True,
            unit="%", device_class="humidity", name="Target humidity",
            min_value=20, max_value=80, step=1),
        Reg("time_program", Table.HOLDING, 12, writable=True, name="Schedule"),
        Reg("antiradon", Table.HOLDING, 13, writable=True, name="Radon protection"),
        Reg("bypass_enable", Table.HOLDING, 14, writable=True,
            name="Automatic bypass", available_if="has_bypass"),
        Reg("heating_enable", Table.HOLDING, 15, writable=True,
            name="Additional heating", available_if="has_heating"),
        Reg("cooling_enable", Table.HOLDING, 16, writable=True,
            name="Additional cooling", available_if="has_cooling"),
        Reg("comfort_enable", Table.HOLDING, 17, writable=True,
            name="Comfort temperature control"),
    ]


def _zone_config() -> list[Reg]:
    return [
        Reg("zone_priority", Table.HOLDING, 20, writable=True, tier=Tier.SLOW,
            name="Zone auto priority", config=True,
            note="0 = temperature, 1 = CO2"),
        Reg("kitchenhood_normally_open", Table.HOLDING, 21, writable=True,
            tier=Tier.SLOW, name="Kitchen hood normally open", config=True),
        Reg("zone_boost_volume", Table.HOLDING, 22, writable=True, tier=Tier.SLOW,
            unit="m³/h", name="Zone boost volume", config=True,
            min_value=50, max_value=150, step=10),
        Reg("kitchenhood_volume", Table.HOLDING, 23, writable=True, tier=Tier.SLOW,
            unit="m³/h", name="Kitchen hood volume", config=True,
            min_value=50, max_value=150, step=10),
    ]


def _corrections() -> list[Reg]:
    """Temperature-correction registers.

    Strided with gaps between them, so each must be read individually -- a
    contiguous block read across 100..114 or 115..154 fails even though every
    listed address exists.
    """
    regs: list[Reg] = []
    for slot in range(1, 4):
        regs.append(
            Reg(f"wall_ui_{slot}_temp_correction", Table.HOLDING,
                100 + (slot - 1) * 5, Kind.I16, scale=0.1, writable=True,
                tier=Tier.SLOW, unit="°C", name=f"Wall controller {slot} offset",
                min_value=-10, max_value=10, step=0.1, config=True,
                enabled_default=False, available_if=f"wall_ui_present_{slot}")
        )
    for slot in range(1, 9):
        regs.append(
            Reg(f"wall_sensor_{slot}_temp_correction", Table.HOLDING,
                115 + (slot - 1) * 5, Kind.I16, scale=0.1, writable=True,
                tier=Tier.SLOW, unit="°C", name=f"CO2 sensor {slot} offset",
                min_value=-10, max_value=10, step=0.1, config=True,
                enabled_default=False, available_if=f"wall_sensor_present_{slot}")
        )
    for slot in range(1, 9):
        regs.append(
            Reg(f"alfa_{slot}_temp_correction", Table.HOLDING,
                160 + (slot - 1) * 5, Kind.I16, scale=0.1, writable=True,
                tier=Tier.SLOW, unit="°C", name=f"ALFA {slot} offset",
                min_value=-10, max_value=10, step=0.1, config=True,
                enabled_default=False, available_if=f"alfa_present_{slot}")
        )
        regs.append(
            Reg(f"alfa_{slot}_ntc_temp_correction", Table.HOLDING,
                162 + (slot - 1) * 5, Kind.I16, scale=0.1, writable=True,
                tier=Tier.SLOW, unit="°C", name=f"ALFA {slot} NTC offset",
                min_value=-10, max_value=10, step=0.1, config=True,
                enabled_default=False, available_if=f"alfa_present_{slot}")
        )
    return regs


def _external() -> list[Reg]:
    """External sensors and buttons: slots another system fills in.

    Unlike the wall sensors and ALFAs these are not devices on the unit's bus but
    holding registers a third party writes for the unit to use -- a building
    controller, or Home Assistant through `set_external_sensor`. Each slot says
    whether it is in use in its own first register, so that flag is read for all
    sixteen slots, and the rest of a slot only becomes entities once it is set.
    On FW 7.20 every slot reads back cleanly, and an unused one is all zeros.

    The readings are writable, but they are shown as sensors: what they hold is
    whatever the feeding system last wrote, which is a reading like any other.
    """
    regs: list[Reg] = []
    for slot in range(1, 9):
        base = 300 + (slot - 1) * 10
        gate = f"ext_sensor_present_{slot}"
        regs += [
            Reg(f"ext_sensor_{slot}_present", Table.HOLDING, base, writable=True,
                tier=Tier.SLOW, name=f"External sensor {slot} present",
                config=True, enabled_default=False),
            Reg(f"ext_sensor_{slot}_invalid", Table.HOLDING, base + 1, Kind.BITS16,
                tier=Tier.SLOW, name=f"External sensor {slot} invalid flags",
                diagnostic=True, available_if=gate),
            Reg(f"ext_sensor_{slot}_temperature", Table.HOLDING, base + 2, Kind.I16,
                scale=0.1, writable=True, tier=Tier.SLOW, unit="°C",
                device_class="temperature", state_class="measurement",
                name=f"External sensor {slot} temperature",
                min_value=-20, max_value=100, step=0.1, available_if=gate),
            Reg(f"ext_sensor_{slot}_humidity", Table.HOLDING, base + 3, writable=True,
                tier=Tier.SLOW, unit="%", device_class="humidity",
                state_class="measurement", name=f"External sensor {slot} humidity",
                min_value=0, max_value=100, step=1, available_if=gate),
            Reg(f"ext_sensor_{slot}_co2", Table.HOLDING, base + 4, writable=True,
                tier=Tier.SLOW, unit="ppm", device_class="carbon_dioxide",
                state_class="measurement", name=f"External sensor {slot} CO2",
                min_value=0, max_value=10000, step=1, available_if=gate),
            Reg(f"ext_sensor_{slot}_floor_temperature", Table.HOLDING, base + 5,
                Kind.I16, scale=0.1, writable=True, tier=Tier.SLOW, unit="°C",
                device_class="temperature", state_class="measurement",
                name=f"External sensor {slot} floor temperature",
                min_value=-20, max_value=100, step=0.1, available_if=gate),
        ]
    for slot in range(1, 9):
        base = 400 + (slot - 1) * 10
        gate = f"ext_button_present_{slot}"
        regs += [
            Reg(f"ext_button_{slot}_present", Table.HOLDING, base, writable=True,
                tier=Tier.SLOW, name=f"External button {slot} present",
                config=True, enabled_default=False),
            Reg(f"ext_button_{slot}_mode", Table.HOLDING, base + 1, writable=True,
                tier=Tier.SLOW, name=f"External button {slot} mode",
                config=True, available_if=gate, note="0 = boost, 1 = kitchen hood"),
            Reg(f"ext_button_{slot}_timer", Table.HOLDING, base + 2, writable=True,
                tier=Tier.SLOW, unit="s", device_class="duration",
                name=f"External button {slot} timer",
                min_value=0, max_value=10800, step=60, available_if=gate),
            Reg(f"ext_button_{slot}_active", Table.HOLDING, base + 3, writable=True,
                tier=Tier.SLOW, name=f"External button {slot} active",
                available_if=gate, note="limited to 3 hours by the unit"),
        ]
    return regs


def is_external_reading(reg: Reg) -> bool:
    """An external sensor's value, shown as a sensor although it is writable."""
    return reg.key.startswith("ext_sensor_") and not reg.key.endswith(
        ("_present", "_invalid")
    )


def _service() -> list[Reg]:
    return [
        Reg("access_code", Table.HOLDING, 900, writable=True, tier=Tier.SLOW,
            name="Service access code", diagnostic=True, enabled_default=False),
        Reg("user_password", Table.HOLDING, 920, writable=True, tier=Tier.SLOW,
            name="User password", diagnostic=True, enabled_default=False,
            note="65535 means unused"),
        Reg("password_timeout", Table.HOLDING, 922, writable=True, tier=Tier.SLOW,
            unit="s", name="Password timeout", diagnostic=True,
            enabled_default=False),
    ]


REGISTERS: tuple[Reg, ...] = tuple(
    _identity()
    + _status()
    + _climate_sensors()
    + _performance()
    + _statistics_and_presence()
    + _peripherals()
    + _controls()
    + _zone_config()
    + _corrections()
    + _external()
    + _service()
)

BY_KEY: dict[str, Reg] = {reg.key: reg for reg in REGISTERS}


# ---------------------------------------------------------------------------
# bit decode tables (FU_DOC_TCP_CS40.pdf pages 6-9)
# ---------------------------------------------------------------------------

MODE_BITS: dict[int, str] = {
    0: "boost_active",
    1: "circulation_active",
    2: "time_program_active",
    3: "overpressure_active",
    4: "away_active",
    5: "party_active",
    6: "night_active",
    7: "antiradon_active",
    8: "device_on",
    9: "filter_check_running",
    10: "drying_running",
    11: "bypass_open",
    12: "low_outdoor_temp_limit",
    13: "stopped_after_error",
    14: "starting_up",
    15: "service_mode",
    16: "waste_air_below_minus_three",
    17: "antifreeze_active",
    18: "emergency_stop",
    19: "pressure_loss_measurement",
    20: "standby",
    21: "zone_boost",
    22: "zone_pressure_loss_measurement",
}

ERROR_BITS: dict[int, str] = {
    0: "sensor_ambient",
    1: "sensor_indoor",
    2: "sensor_fresh",
    3: "sensor_waste",
    4: "fan_supply",
    5: "fan_exhaust",
    6: "exchanger_communication",
    7: "exchanger_damper_position",
    8: "io_board_communication",
    9: "fan_supply_blocked",
    10: "fan_exhaust_blocked",
    11: "coolbreeze_communication",
    12: "coolbreeze_outdoor_unit",
}

# Bits 6 and 7 are undefined in the spec and deliberately absent here.
WARNING_BITS: dict[int, str] = {
    0: "filter_uninitialised",
    1: "filter_too_dirty",
    2: "filter_used_too_long",
    3: "rtc_battery_low",
    4: "fan_supply_overspeed",
    5: "fan_exhaust_overspeed",
    8: "outdoor_temp_too_low",
    9: "zone_config_supply",
    10: "zone_config_exhaust",
    11: "emergency_stop",
    12: "superbreeze_communication",
    13: "superbreeze_general",
}

CONFIG_BITS: dict[int, str] = {
    0: "internal_heating",
    1: "coolbreeze_cooling",
    2: "coolbreeze_heating",
    3: "bypass",
    4: "variobreeze",
    5: "inner_circulation",
    6: "coolbreeze",
    7: "exchanger_control",
}

DIGITAL_INPUT_BITS: dict[int, str] = {
    0: "user_button",
    1: "factory_button",
    2: "boost_input",
    3: "uin1",
    4: "uin2",
}

EXT_SENSOR_INVALID_BITS: dict[int, str] = {
    0: "temperature_invalid",
    1: "humidity_invalid",
    2: "co2_invalid",
    3: "floor_temperature_invalid",
}

#: Peripheral options bitfields: a set bit means the value is NOT evaluated.
PERIPHERAL_OPTION_BITS: dict[int, str] = {
    0: "co2_ignored",
    1: "temperature_ignored",
    2: "humidity_ignored",
}


def decode_valve_topology(mask: int, exhaust: bool) -> list[dict[str, int]]:
    """Map a valve presence bitfield to zone, valve index and RS-485 unit id.

    ``bit = (valve - 1) * 8 + (zone - 1)``, and the peripheral's own Modbus unit
    id on the internal bus is ``64 + bit`` for supply, ``96 + bit`` for exhaust.
    Those unit ids are not reachable through the Futura's TCP server -- they are
    recorded so an external RS-485 sniffer can be correlated with these zones.
    """
    base = 96 if exhaust else 64
    return [
        {
            "bit": bit,
            "zone": bit % 8 + 1,
            "valve": bit // 8 + 1,
            "rs485_unit_id": base + bit,
        }
        for bit in range(32)
        if mask >> bit & 1
    ]
