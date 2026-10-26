"""Buttons for the Futura's timed comfort functions."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity


@dataclass(frozen=True, kw_only=True)
class FuturaButtonDescription(ButtonEntityDescription):
    """A one-shot write. `register` is None for the stop-everything button."""

    register: str | None = None
    seconds: int = 0


DESCRIPTIONS: tuple[FuturaButtonDescription, ...] = (
    FuturaButtonDescription(
        key="boost_30",

        translation_key="boost_30", name="Boost 30 minutes", icon="mdi:fan-plus",
        register="boost_timer", seconds=30 * 60,
    ),
    FuturaButtonDescription(
        key="boost_60",

        translation_key="boost_60", name="Boost 60 minutes", icon="mdi:fan-plus",
        register="boost_timer", seconds=60 * 60,
    ),
    FuturaButtonDescription(
        key="circulation_30",

        translation_key="circulation_30", name="Circulation 30 minutes", icon="mdi:autorenew",
        register="circulation_timer", seconds=30 * 60,
    ),
    FuturaButtonDescription(
        key="circulation_60",

        translation_key="circulation_60", name="Circulation 60 minutes", icon="mdi:autorenew",
        register="circulation_timer", seconds=60 * 60,
    ),
    FuturaButtonDescription(
        key="overpressure_15",

        translation_key="overpressure_15", name="Overpressure 15 minutes",
        icon="mdi:weather-windy", register="overpressure_timer", seconds=15 * 60,
    ),
    FuturaButtonDescription(
        key="party_4h",

        translation_key="party_4h", name="Party 4 hours", icon="mdi:glass-cocktail",
        register="party_timer", seconds=4 * 3600,
    ),
    FuturaButtonDescription(
        key="night_8h",

        translation_key="night_8h", name="Night mode 8 hours", icon="mdi:weather-night",
        register="night_timer", seconds=8 * 3600,
    ),
    FuturaButtonDescription(
        key="stop_all",

        translation_key="stop_all", name="Stop all functions", icon="mdi:stop-circle-outline",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        FuturaButton(coordinator, description) for description in DESCRIPTIONS
    )


class FuturaButton(FuturaEntity, ButtonEntity):
    """Starts a timed function, or clears every timer at once."""

    entity_description: FuturaButtonDescription

    async def async_press(self) -> None:
        description = self.entity_description
        if description.register is None:
            # Registers 1-5 are contiguous, so one FC16 write clears them all
            # rather than racing five separate writes over a single socket.
            await self.coordinator.async_stop_all_functions()
            return
        await self.coordinator.async_write(description.register, description.seconds)
