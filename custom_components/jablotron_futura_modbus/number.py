"""Number entities for the Futura's adjustable holding registers."""

from __future__ import annotations

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity, add_present_entities
from .registers import REGISTERS, Kind, Reg, Table, is_external_reading

_DEVICE_CLASSES = {
    "temperature": NumberDeviceClass.TEMPERATURE,
    "humidity": NumberDeviceClass.HUMIDITY,
    "duration": NumberDeviceClass.DURATION,
}

#: Handled by dedicated platforms rather than as raw numbers.
_EXCLUDED = {
    "ventilation",
    "humidity_setpoint",
    "zone_priority",
    "away_begin",
    "away_end",
    "access_code",
    "user_password",
}


def _is_number(reg: Reg) -> bool:
    if reg.table is not Table.HOLDING or not reg.writable:
        return False
    if reg.key in _EXCLUDED or reg.kind in (Kind.BITS16, Kind.BITS32):
        return False
    if reg.key.endswith(("_present", "_active")):
        return False
    # Written by whatever feeds the slot, and shown as sensors; Home Assistant
    # feeds a slot through the set_external_sensor service.
    if is_external_reading(reg):
        return False
    # A number needs a bounded range to render a slider or box.
    return reg.min_value is not None and reg.max_value is not None


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    polled = {reg.key for block in coordinator.blocks for reg in block.registers}
    add_present_entities(
        entry,
        coordinator,
        async_add_entities,
        [reg for reg in REGISTERS if reg.key in polled and _is_number(reg)],
        lambda reg: FuturaNumber(coordinator, reg),
    )


class FuturaNumber(FuturaEntity, NumberEntity):
    """A bounded, writable holding register."""

    def __init__(self, coordinator: FuturaCoordinator, reg: Reg) -> None:
        category = None
        if reg.config:
            category = EntityCategory.CONFIG
        elif reg.diagnostic:
            category = EntityCategory.DIAGNOSTIC
        super().__init__(
            coordinator,
            NumberEntityDescription(
                key=reg.key,
                name=reg.name or reg.key.replace("_", " ").capitalize(),
                native_unit_of_measurement=reg.unit,
                native_min_value=reg.min_value,
                native_max_value=reg.max_value,
                native_step=reg.step or 1,
                device_class=_DEVICE_CLASSES.get(reg.device_class or ""),
                entity_category=category,
                entity_registry_enabled_default=reg.enabled_default,
                mode=NumberMode.BOX,
            ),
            gate=reg.available_if,
        )

    @property
    def native_value(self) -> float | None:
        return self.coordinator.data.get(self.entity_description.key)

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_write(self.entity_description.key, value)
