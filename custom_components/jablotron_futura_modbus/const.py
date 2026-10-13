"""Constants for the Jablotron Futura (Modbus TCP) integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "jablotron_futura_modbus"

# The Futura exposes exactly one TCP socket and answers unit id 1 only.
# Addressing any other unit id on a live socket makes it drop the connection.
DEFAULT_PORT: Final = 502
DEFAULT_UNIT_ID: Final = 1
SUPPORTED_UNIT_ID: Final = 1

CONF_UNIT_ID: Final = "unit_id"
CONF_SCAN_INTERVAL: Final = "scan_interval"
CONF_SLOW_INTERVAL: Final = "slow_interval"
CONF_ENABLE_EXTERNAL_SENSORS: Final = "enable_external_sensors"
CONF_ENABLE_EXTERNAL_BUTTONS: Final = "enable_external_buttons"
CONF_ENABLE_CORRECTIONS: Final = "enable_corrections"

DEFAULT_SCAN_INTERVAL: Final = 15
DEFAULT_SLOW_INTERVAL: Final = 60
MIN_SCAN_INTERVAL: Final = 5
MAX_SCAN_INTERVAL: Final = 300

# A write refreshes the whole register set so the change shows up promptly, but
# holding a +/- button would otherwise fire one full read per press. Collapsing a
# burst into a single refresh keeps traffic off the unit's one socket, and stops
# unrelated readings such as the outdoor probe visibly re-sampling on every tap.
WRITE_REFRESH_COOLDOWN: Final = 2.0

# Register map v4.00 requires firmware FUA.P.05.00 or newer.
MIN_FIRMWARE: Final = (5, 0)

MANUFACTURER: Final = "Jablotron"
DEVICE_ID_FUTURA: Final = 39

# The device name, and so the start of every entity id. A second unit is offered
# this with a number after it; see the config flow for why.
DEFAULT_NAME: Final = "Jablotron Futura"

PLATFORMS: Final = [
    "binary_sensor",
    "button",
    "climate",
    "fan",
    "number",
    "select",
    "sensor",
    "switch",
]

# Ventilation levels written to holding register 0.
MODE_OFF: Final = 0
MODE_AUTO: Final = 6
VENTILATION_LEVELS: Final = (1, 2, 3, 4, 5)

# The comfort setpoint the unit accepts, in degrees Celsius. The register itself
# takes a wider span, but anything outside this is rejected by the unit.
TEMP_SETPOINT_MIN: Final = 16.0
TEMP_SETPOINT_MAX: Final = 28.0
TEMP_SETPOINT_STEP: Final = 0.5

# Humidity presets written to holding register 11 (tenths of a percent).
HUMIDITY_PRESETS: Final = {"dry": 250, "comfort": 500, "wet": 750}

# Function timer limits, in seconds, from the register map.
# The app caps boost, circulation and overpressure at two hours, and night and
# party at ten. The register map documents 7200 s for night and 28800 s for
# party, but the unit accepts more than that, so the app's limits are used here.
TIMER_LIMITS: Final = {
    "boost": (0, 7200),
    "circulation": (0, 7200),
    "overpressure": (0, 7200),
    "night": (0, 36000),
    "party": (0, 36000),
}

# fut_t_out reports -99 degrees (raw -990) when the NTC probe is unplugged.
NTC_DISCONNECTED_RAW: Final = -990

SERVICE_SET_AWAY: Final = "set_away"
SERVICE_CLEAR_AWAY: Final = "clear_away"
SERVICE_SET_FUNCTION: Final = "set_function"
SERVICE_SET_EXTERNAL_SENSOR: Final = "set_external_sensor"
SERVICE_UNLOCK_SERVICE: Final = "unlock_service"
SERVICE_WRITE_REGISTER: Final = "write_register"
