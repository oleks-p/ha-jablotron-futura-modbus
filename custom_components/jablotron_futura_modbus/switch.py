"""Switches for the Futura's on/off holding registers."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity, add_present_entities
from .registers import REGISTERS, Reg, Table

_ICONS = {
    "time_program": "mdi:calendar-clock",
    "antiradon": "mdi:radioactive",
    "bypass_enable": "mdi:air-filter",
    "heating_enable": "mdi:fire",
    "cooling_enable": "mdi:snowflake",
    "comfort_enable": "mdi:sofa",
    "kitchenhood_normally_open": "mdi:stove",
}

#: Writable single-register flags that behave as switches.
_SWITCH_KEYS = {
    "time_program",
    "antiradon",
    "bypass_enable",
    "heating_enable",
    "cooling_enable",
    "comfort_enable",
    "kitchenhood_normally_open",
}


def _is_switch(reg: Reg) -> bool:
    if reg.table is not Table.HOLDING or not reg.writable:
        return False
    if reg.key in _SWITCH_KEYS:
        return True
    # External sensor/button presence and activation are also plain flags.
    return reg.key.endswith(("_present", "_active"))


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    polled = {reg.key for block in coordinator.blocks for reg in block.registers}
    add_present_entities(
        entry,
        coordinator,
        async_add_entities,
        [reg for reg in REGISTERS if reg.key in polled and _is_switch(reg)],
        lambda reg: FuturaSwitch(coordinator, reg),
    )


class FuturaSwitch(FuturaEntity, SwitchEntity):
    """A 0/1 holding register."""

    def __init__(self, coordinator: FuturaCoordinator, reg: Reg) -> None:
        super().__init__(
            coordinator,
            SwitchEntityDescription(
                key=reg.key,
                translation_key=reg.key,
                name=reg.name or reg.key.replace("_", " ").capitalize(),
                icon=_ICONS.get(reg.key),
                entity_category=EntityCategory.CONFIG if reg.config else None,
                entity_registry_enabled_default=reg.enabled_default,
            ),
            gate=reg.available_if,
        )

    @property
    def is_on(self) -> bool | None:
        value = self.coordinator.data.get(self.entity_description.key)
        return None if value is None else bool(value)

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_write(self.entity_description.key, 1)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_write(self.entity_description.key, 0)
