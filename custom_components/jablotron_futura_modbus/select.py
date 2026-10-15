"""Selects for the Futura's enumerated settings."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.select import SelectEntity, SelectEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

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


#: Which drawing `custom:futura-schematics-card` shows. The options are the
#: card's own variant KEYS, so the card matches a state against them directly;
#: the words a person reads come from `translation_key`, which is how every
#: other select here is labelled too.
#:
#: This replaced `dashboards/futura_helpers.yaml`, an `input_select` the user
#: had to install as a package and restart for. Asking somebody to create a
#: helper so that this integration's own card can be switched was an install
#: step that existed only because the integration did not offer the entity -
#: and it coupled the card to a string a person could edit, which is why the
#: card still matches option labels case- and space-insensitively.
SCHEMATIC_OPTIONS = ("flow", "unit", "service", "diagram")
DEFAULT_SCHEMATIC = "flow"

SCHEMATIC_DESCRIPTION = SelectEntityDescription(
    key="schematic",
    translation_key="schematic",
    icon="mdi:vector-square",
    # A view preference, not a setting on the unit: filed under config so it
    # does not sit among the controls that actually change how the unit runs.
    entity_category=EntityCategory.CONFIG,
    options=list(SCHEMATIC_OPTIONS),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        FuturaSelect(coordinator, description) for description in DESCRIPTIONS
    )
    async_add_entities([FuturaSchematicSelect(coordinator, SCHEMATIC_DESCRIPTION)])
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


class FuturaSchematicSelect(FuturaEntity, SelectEntity, RestoreEntity):
    """Which schematic the card draws. Local state, nothing on the bus.

    Deliberately NOT a register. It holds a dashboard preference, so:

    * it is always available. Every other entity here follows the coordinator,
      because a reading from a unit that is not answering is a lie. This one
      reads nothing, and taking the picker away the moment the Modbus link
      blinks would leave the card stuck on whichever drawing was showing.
    * it restores its last option, so the choice survives a restart. That was
      the point of the `input_select` this replaces - it carried no `initial:`
      for exactly this reason.
    """

    _attr_should_poll = False

    def __init__(self, coordinator: FuturaCoordinator, description) -> None:
        super().__init__(coordinator, description)
        self._option = DEFAULT_SCHEMATIC

    @property
    def available(self) -> bool:
        return True

    @property
    def current_option(self) -> str:
        return self._option

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        # Only an option this entity still offers: the set could have changed
        # with the card, and restoring a word it no longer draws would leave
        # the card reporting an unknown variant at the user.
        if last is not None and last.state in SCHEMATIC_OPTIONS:
            self._option = last.state

    async def async_select_option(self, option: str) -> None:
        self._option = option
        self.async_write_ha_state()
