"""Sensor entities, generated from the register table."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity, add_present_entities
from .registers import REGISTERS, Kind, Reg

#: Register kinds that are bitfields or identity strings rather than readings.
_NON_SENSOR_KINDS = {Kind.BITS16, Kind.BITS32}

#: Registers surfaced through a dedicated platform instead of a plain sensor.
_HANDLED_ELSEWHERE = {
    "ventilation",
    "temperature_setpoint",
    "humidity_setpoint",
    "time_program",
    "antiradon",
    "bypass_enable",
    "heating_enable",
    "cooling_enable",
    "comfort_enable",
    "zone_priority",
    "kitchenhood_normally_open",
    "zone_boost_volume",
    "kitchenhood_volume",
    "access_code",
    "user_password",
    "password_timeout",
}

_DEVICE_CLASSES = {
    "temperature": SensorDeviceClass.TEMPERATURE,
    "humidity": SensorDeviceClass.HUMIDITY,
    "power": SensorDeviceClass.POWER,
    "voltage": SensorDeviceClass.VOLTAGE,
    "carbon_dioxide": SensorDeviceClass.CO2,
    "duration": SensorDeviceClass.DURATION,
}
_STATE_CLASSES = {
    "measurement": SensorStateClass.MEASUREMENT,
    "total_increasing": SensorStateClass.TOTAL_INCREASING,
}


def _is_sensor(reg: Reg) -> bool:
    if reg.kind in _NON_SENSOR_KINDS:
        return False
    if reg.key in _HANDLED_ELSEWHERE:
        return False
    # Writable holding registers become numbers/switches/selects, except the
    # function timers, which are also useful as read-only countdowns.
    if reg.writable and not reg.key.endswith("_timer"):
        return False
    if reg.key.endswith("_temp_correction"):
        return False
    return True


def _describe(reg: Reg) -> SensorEntityDescription:
    category = None
    if reg.diagnostic:
        category = EntityCategory.DIAGNOSTIC
    elif reg.config:
        category = EntityCategory.CONFIG
    return SensorEntityDescription(
        key=reg.key,
        name=reg.name or reg.key.replace("_", " ").capitalize(),
        native_unit_of_measurement=reg.unit,
        device_class=_DEVICE_CLASSES.get(reg.device_class or ""),
        state_class=_STATE_CLASSES.get(reg.state_class or ""),
        entity_category=category,
        entity_registry_enabled_default=reg.enabled_default,
    )


#: Values the coordinator derives rather than reads.
DERIVED: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key="performance_factor",
        name="Performance factor",
        state_class=SensorStateClass.MEASUREMENT,
        icon="mdi:chart-line",
    ),
    SensorEntityDescription(
        key="temp_mean_indoor",
        name="Indoor temperature",
        native_unit_of_measurement="°C",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="humidity_mean_indoor",
        name="Indoor humidity",
        native_unit_of_measurement="%",
        device_class=SensorDeviceClass.HUMIDITY,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="co2_max",
        name="Highest CO2",
        native_unit_of_measurement="ppm",
        device_class=SensorDeviceClass.CO2,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key="air_quality",
        name="Air quality",
        device_class=SensorDeviceClass.ENUM,
        options=["good", "moderate", "poor"],
        icon="mdi:leaf",
    ),
    SensorEntityDescription(
        key="ventilation_text",
        name="Ventilation mode",
        device_class=SensorDeviceClass.ENUM,
        options=["off", "1", "2", "3", "4", "5", "auto"],
        icon="mdi:fan",
    ),
    SensorEntityDescription(
        key="away_begin_at",
        name="Away begins",
        device_class=SensorDeviceClass.TIMESTAMP,
        icon="mdi:bag-suitcase",
    ),
    SensorEntityDescription(
        key="away_end_at",
        name="Away ends",
        device_class=SensorDeviceClass.TIMESTAMP,
        icon="mdi:bag-suitcase-off",
    ),
    SensorEntityDescription(
        key="model",
        name="Model",
        entity_category=EntityCategory.DIAGNOSTIC,
        icon="mdi:information-outline",
    ),
)

VALVE_COUNTS: tuple[tuple[str, str], ...] = (
    ("supply", "Supply valves"),
    ("exhaust", "Exhaust valves"),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    polled = {reg.key for block in coordinator.blocks for reg in block.registers}

    entities: list[SensorEntity] = [
        FuturaSensor(coordinator, desc) for desc in DERIVED
    ]
    entities += [
        FuturaValveCountSensor(coordinator, side, label)
        for side, label in VALVE_COUNTS
    ]
    async_add_entities(entities)

    # Gated registers arrive as their peripheral is seen, which for a slot that
    # is already plugged in is on the first update.
    add_present_entities(
        entry,
        coordinator,
        async_add_entities,
        [reg for reg in REGISTERS if reg.key in polled and _is_sensor(reg)],
        lambda reg: FuturaSensor(coordinator, _describe(reg), gate=reg.available_if),
    )


class FuturaSensor(FuturaEntity, SensorEntity):
    """A single decoded register."""

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get(self.entity_description.key)


class FuturaValveCountSensor(FuturaEntity, SensorEntity):
    """How many VarioBreeze valves exist, with the zone layout as attributes.

    The Futura reports which valves are fitted and in which zone, but not their
    position -- that lives on the internal RS-485 bus, which the TCP server does
    not bridge. The RS-485 unit id of each valve is exposed so an external bus
    sniffer can be lined up with these zones.
    """

    _attr_icon = "mdi:pipe-valve"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: FuturaCoordinator, side: str, label: str) -> None:
        super().__init__(
            coordinator,
            SensorEntityDescription(
                key=f"valve_count_{side}",
                name=label,
                state_class=SensorStateClass.MEASUREMENT,
            ),
        )
        self._side = side

    @property
    def native_value(self) -> int | None:
        valves = self.coordinator.data.topology.get(self._side)
        return None if valves is None else len(valves)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        valves = self.coordinator.data.topology.get(self._side) or []
        zones: dict[int, list[int]] = {}
        for valve in valves:
            zones.setdefault(valve["zone"], []).append(valve["valve"])
        return {
            "zones": {str(zone): sorted(v) for zone, v in sorted(zones.items())},
            "rs485_unit_ids": [v["rs485_unit_id"] for v in valves],
            "position_available": False,
        }
