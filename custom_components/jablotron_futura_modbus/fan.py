"""Fan entity mapping the Futura's ventilation level."""

from __future__ import annotations

import math
from typing import Any

from homeassistant.components.fan import (
    FanEntity,
    FanEntityDescription,
    FanEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util.percentage import (
    percentage_to_ranged_value,
    ranged_value_to_percentage,
)

from .const import DOMAIN, MODE_AUTO, MODE_OFF
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity

#: Manual levels 1-5 map onto the percentage scale; Auto is a preset instead,
#: because it is a distinct mode rather than a sixth speed.
LEVEL_RANGE = (1, 5)
PRESET_AUTO = "auto"


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([FuturaFan(coordinator)])


class FuturaFan(FuturaEntity, FanEntity):
    """Ventilation as a fan: off, five manual levels, or automatic."""

    _attr_name = None
    _attr_icon = "mdi:hvac"
    _attr_speed_count = 5
    _attr_preset_modes = [PRESET_AUTO]
    _attr_supported_features = (
        FanEntityFeature.SET_SPEED
        | FanEntityFeature.PRESET_MODE
        | FanEntityFeature.TURN_ON
        | FanEntityFeature.TURN_OFF
    )

    def __init__(self, coordinator: FuturaCoordinator) -> None:
        super().__init__(coordinator, FanEntityDescription(key="ventilation"))

    @property
    def _level(self) -> int | None:
        value = self.coordinator.data.get("ventilation")
        return None if value is None else int(value)

    @property
    def is_on(self) -> bool | None:
        level = self._level
        return None if level is None else level != MODE_OFF

    @property
    def percentage(self) -> int | None:
        level = self._level
        if level is None:
            return None
        if level == MODE_OFF:
            return 0
        if level == MODE_AUTO:
            # In automatic mode the unit picks the level itself; report the fan
            # output so the slider reflects what the hardware is actually doing.
            return self.coordinator.data.get("fan_pwm_supply")
        return ranged_value_to_percentage(LEVEL_RANGE, level)

    @property
    def preset_mode(self) -> str | None:
        level = self._level
        return PRESET_AUTO if level == MODE_AUTO else None

    async def async_set_percentage(self, percentage: int) -> None:
        if percentage == 0:
            await self.coordinator.async_write("ventilation", MODE_OFF)
            return
        level = math.ceil(percentage_to_ranged_value(LEVEL_RANGE, percentage))
        await self.coordinator.async_write(
            "ventilation", max(1, min(5, int(level)))
        )

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        if preset_mode != PRESET_AUTO:
            raise ValueError(f"unsupported preset {preset_mode}")
        await self.coordinator.async_write("ventilation", MODE_AUTO)

    async def async_turn_on(
        self,
        percentage: int | None = None,
        preset_mode: str | None = None,
        **kwargs: Any,
    ) -> None:
        if preset_mode == PRESET_AUTO:
            await self.async_set_preset_mode(PRESET_AUTO)
        elif percentage:
            await self.async_set_percentage(percentage)
        else:
            await self.coordinator.async_write("ventilation", MODE_AUTO)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_write("ventilation", MODE_OFF)
