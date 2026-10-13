"""Binary sensors for the Futura's mode, error, warning and capability bits."""

from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity
from .registers import (
    CONFIG_BITS,
    DIGITAL_INPUT_BITS,
    ERROR_BITS,
    MODE_BITS,
    WARNING_BITS,
)

_MODE_ICONS = {
    "boost_active": "mdi:fan-plus",
    "circulation_active": "mdi:autorenew",
    "time_program_active": "mdi:calendar-clock",
    "overpressure_active": "mdi:weather-windy",
    "away_active": "mdi:bag-suitcase",
    "party_active": "mdi:glass-cocktail",
    "night_active": "mdi:weather-night",
    "antiradon_active": "mdi:radioactive",
    "device_on": "mdi:power",
    "bypass_open": "mdi:air-filter",
    "standby": "mdi:power-standby",
    "zone_boost": "mdi:fan-speed-3",
}


def _descriptions() -> list[BinarySensorEntityDescription]:
    out: list[BinarySensorEntityDescription] = []

    for name in MODE_BITS.values():
        out.append(
            BinarySensorEntityDescription(
                key=f"mode_{name}",
                name=name.replace("_", " ").capitalize(),
                icon=_MODE_ICONS.get(name),
            )
        )
    for name in ERROR_BITS.values():
        out.append(
            BinarySensorEntityDescription(
                key=f"error_{name}",
                name=f"Error: {name.replace('_', ' ')}",
                device_class=BinarySensorDeviceClass.PROBLEM,
                entity_registry_enabled_default=False,
            )
        )
    for name in WARNING_BITS.values():
        out.append(
            BinarySensorEntityDescription(
                key=f"warning_{name}",
                name=f"Warning: {name.replace('_', ' ')}",
                device_class=BinarySensorDeviceClass.PROBLEM,
                entity_registry_enabled_default=False,
            )
        )
    for name in CONFIG_BITS.values():
        out.append(
            BinarySensorEntityDescription(
                key=f"config_{name}",
                name=f"Supports {name.replace('_', ' ')}",
                entity_category=EntityCategory.DIAGNOSTIC,
                entity_registry_enabled_default=False,
            )
        )
    for name in DIGITAL_INPUT_BITS.values():
        out.append(
            BinarySensorEntityDescription(
                key=f"input_{name}",
                name=f"Input {name.replace('_', ' ')}",
                entity_category=EntityCategory.DIAGNOSTIC,
                entity_registry_enabled_default=False,
            )
        )

    out += [
        BinarySensorEntityDescription(
            key="any_error",
            name="Fault",
            device_class=BinarySensorDeviceClass.PROBLEM,
        ),
        BinarySensorEntityDescription(
            key="any_warning",
            name="Warning",
            device_class=BinarySensorDeviceClass.PROBLEM,
        ),
    ]
    return out


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        FuturaBinarySensor(coordinator, description)
        for description in _descriptions()
    )


class FuturaBinarySensor(FuturaEntity, BinarySensorEntity):
    """One decoded bit."""

    @property
    def is_on(self) -> bool | None:
        return self.coordinator.data.flags.get(self.entity_description.key)
