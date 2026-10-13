"""Selects for the Futura's enumerated settings."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.select import SelectEntity, SelectEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, HUMIDITY_PRESETS, MODE_AUTO, MODE_OFF
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity, add_present_entities
from .registers import REGISTERS, Reg


@dataclass(frozen=True, kw_only=True)
class FuturaSelectDescription(SelectEntityDescription):
    """Maps option labels onto the raw register value."""

    register: str
    mapping: dict[str, float]


VENTILATION_OPTIONS = {
    "off": MODE_OFF,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "auto": MODE_AUTO,
}

#: Register 11 stores tenths of a percent, so the presets are 25/50/75 percent.
#: Labels follow the app: dry, comfort, wet.
HUMIDITY_OPTIONS = {name: raw / 10 for name, raw in HUMIDITY_PRESETS.items()}

DESCRIPTIONS: tuple[FuturaSelectDescription, ...] = (
    FuturaSelectDescription(
        key="ventilation_select",
        # translation_key carries both the entity name and the option labels.
        # The names match what `name=` produced, so entity IDs do not move.
        translation_key="ventilation_mode",
        icon="mdi:fan",
        options=list(VENTILATION_OPTIONS),
        register="ventilation",
        mapping=VENTILATION_OPTIONS,
    ),
    FuturaSelectDescription(
        key="humidity_mode",
        translation_key="humidity_mode",
        icon="mdi:water-percent",
        options=list(HUMIDITY_OPTIONS),
        register="humidity_setpoint",
        mapping=HUMIDITY_OPTIONS,
    ),
    FuturaSelectDescription(
        key="zone_priority_select",
        # Its "CO2" label is deliberately plain ASCII. A subscript ₂ descends
        # below the baseline and the tile card clips its state line, so the
        # character came out cut in half.
        translation_key="zone_priority",
        icon="mdi:priority-high",
        entity_category=EntityCategory.CONFIG,
        options=["temperature", "co2"],
        register="zone_priority",
        mapping={"temperature": 0, "co2": 1},
    ),
)


#: What an external button does when pressed, as its mode register encodes it.
EXTERNAL_BUTTON_MODES = {"boost": 0, "kitchen_hood": 1}


def external_button_mode(reg: Reg) -> FuturaSelectDescription:
    """The mode select for one external button slot."""
    slot = reg.key.removeprefix("ext_button_").removesuffix("_mode")
    return FuturaSelectDescription(
        key=reg.key,
        translation_key="external_button_mode",
        translation_placeholders={"slot": slot},
        icon="mdi:gesture-tap-button",
        entity_category=EntityCategory.CONFIG,
        options=list(EXTERNAL_BUTTON_MODES),
        register=reg.key,
        mapping=EXTERNAL_BUTTON_MODES,
    )


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        FuturaSelect(coordinator, description) for description in DESCRIPTIONS
    )
    # One per external button slot, once whatever feeds it marks it in use.
    add_present_entities(
        entry,
        coordinator,
        async_add_entities,
        [
            reg for reg in REGISTERS
            if reg.key.startswith("ext_button_") and reg.key.endswith("_mode")
        ],
        lambda reg: FuturaSelect(
            coordinator, external_button_mode(reg), gate=reg.available_if
        ),
    )


class FuturaSelect(FuturaEntity, SelectEntity):
    """An enumerated holding register."""

    entity_description: FuturaSelectDescription

    @property
    def current_option(self) -> str | None:
        value = self.coordinator.data.get(self.entity_description.register)
        if value is None:
            return None
        for label, raw in self.entity_description.mapping.items():
            if abs(float(raw) - float(value)) < 0.05:
                return label
        return None

    async def async_select_option(self, option: str) -> None:
        raw = self.entity_description.mapping[option]
        await self.coordinator.async_write(self.entity_description.register, raw)
