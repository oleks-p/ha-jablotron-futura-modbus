"""Climate entity combining the temperature setpoint with ventilation control."""

from __future__ import annotations

from typing import Any

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityDescription,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    MODE_AUTO,
    MODE_OFF,
    TEMP_SETPOINT_MAX,
    TEMP_SETPOINT_MIN,
    TEMP_SETPOINT_STEP,
    VENTILATION_LEVELS,
)
from .coordinator import FuturaCoordinator
from .entity import FuturaEntity

FAN_AUTO = "auto"

# Holding register 0 carries the speed alone: 1-5 a preset level, 6 automatic.
# 0 means the unit is off, which is `hvac_mode` rather than a fan mode — a fan
# speed of "off" and an HVAC mode of "off" would be two controls writing the
# same register, each able to contradict the other.
FAN_MODES = [*(str(level) for level in VENTILATION_LEVELS), FAN_AUTO]

# The unit has no single mode register. What HA calls the mode is three holding
# registers read together: 0 (speed, where 0 is off), 15 (additional heating)
# and 16 (additional cooling). A heat-recovery ventilator always ventilates, so
# heating and cooling are things layered on top of that, not alternatives to it.
_AUX = {HVACMode.HEAT: "heating_enable", HVACMode.COOL: "cooling_enable"}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([FuturaClimate(coordinator)])


class FuturaClimate(FuturaEntity, ClimateEntity):
    """The unit's comfort target, mirroring the mobile app's main screen."""

    _attr_name = None
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_target_temperature_step = TEMP_SETPOINT_STEP
    _attr_min_temp = TEMP_SETPOINT_MIN
    _attr_max_temp = TEMP_SETPOINT_MAX
    _attr_fan_modes = FAN_MODES
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE | ClimateEntityFeature.FAN_MODE
    )

    def __init__(self, coordinator: FuturaCoordinator) -> None:
        super().__init__(coordinator, ClimateEntityDescription(key="climate"))
        # The speed to resume on when switching out of `off`. Register 0 keeps no
        # memory of it — writing 0 overwrites the level — so turning the unit
        # back on has to restore something, and silently jumping to automatic
        # would lose a hand-picked speed.
        self._last_level = MODE_AUTO

    @callback
    def _handle_coordinator_update(self) -> None:
        level = self.coordinator.data.get("ventilation")
        if level is not None and int(level) != MODE_OFF:
            self._last_level = int(level)
        super()._handle_coordinator_update()

    @property
    def current_temperature(self) -> float | None:
        # Match the app, which averages every connected room sensor rather than
        # reporting the extract-air duct probe.
        mean = self.coordinator.data.get("temp_mean_indoor")
        return mean if mean is not None else self.coordinator.data.get("temp_indoor")

    @property
    def current_humidity(self) -> int | None:
        value = self.coordinator.data.get("humidity_mean_indoor")
        if value is None:
            value = self.coordinator.data.get("humidity_indoor")
        return None if value is None else round(value)

    @property
    def target_temperature(self) -> float | None:
        return self.coordinator.data.get("temperature_setpoint")

    @property
    def hvac_modes(self) -> list[HVACMode]:
        """Off and fan-only always; heat and cool only where the unit has them.

        Gated on `fut_config`, so a unit without CoolBreeze never offers a mode
        whose register it would accept and then ignore.
        """
        present = self.coordinator.data.present
        modes = [HVACMode.OFF]
        if "has_heating" in present:
            modes.append(HVACMode.HEAT)
        if "has_cooling" in present:
            modes.append(HVACMode.COOL)
        modes.append(HVACMode.FAN_ONLY)
        return modes

    @property
    def hvac_mode(self) -> HVACMode | None:
        data = self.coordinator.data
        level = data.get("ventilation")
        if level is None:
            return None
        if int(level) == MODE_OFF:
            return HVACMode.OFF
        # Heating wins when both are enabled. The unit permits that combination
        # and decides for itself which way to move the air temperature, so there
        # is no third HA mode to report it as; the two switches remain the
        # faithful view of the pair.
        if data.get("heating_enable"):
            return HVACMode.HEAT
        if data.get("cooling_enable"):
            return HVACMode.COOL
        return HVACMode.FAN_ONLY

    @property
    def hvac_action(self) -> HVACAction | None:
        data = self.coordinator.data
        level = data.get("ventilation")
        if level is None:
            return None
        if int(level) == MODE_OFF or data.flags.get("mode_standby"):
            return HVACAction.OFF
        if (data.get("heating_power") or 0) > 0:
            return HVACAction.HEATING
        # Only the post-heater got us here. A unit heating via CoolBreeze falls
        # through, because that module's output reaches no register — see below.
        # Nothing to report: the unit is moving air and conditioning it in no way
        # we can observe. FAN would be accurate and was what this returned, but it
        # put a permanent "Fan" under the dial, restating what the fan-mode
        # control already says while crowding out the states that carry
        # information — OFF and HEATING both still reach the label above.
        #
        # COOLING is not an option here, even when the mode is COOL, and cannot
        # be: CoolBreeze runs off its own 230 V / 16 A supply, so neither
        # `power_consumption` nor `heating_power` sees it, and the register map
        # carries only its presence, capability and error bits. An earlier version
        # inferred cooling from an open bypass with cooler air outside, which
        # reported "Cooling" on a unit whose additional cooling was switched off.
        # That is worse than saying nothing: a bypass is free-cooling
        # *ventilation*, and it already has its own binary_sensor.
        return None

    @property
    def fan_mode(self) -> str | None:
        level = self.coordinator.data.get("ventilation")
        if level is None:
            return None
        if int(level) == MODE_OFF:
            # Off is a mode, not a speed. Reporting the remembered level here
            # would show a speed the fans are not running at.
            return None
        return FAN_AUTO if int(level) == MODE_AUTO else str(int(level))

    async def async_set_temperature(self, **kwargs: Any) -> None:
        temperature = kwargs.get(ATTR_TEMPERATURE)
        if temperature is not None:
            await self.coordinator.async_write("temperature_setpoint", temperature)

    async def async_set_fan_mode(self, fan_mode: str) -> None:
        """A preset level or automatic — one write either way."""
        level = MODE_AUTO if fan_mode == FAN_AUTO else int(fan_mode)
        self._last_level = level
        await self.coordinator.async_write("ventilation", level)

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Turn the unit off, or run it with heating, cooling, or neither."""
        if hvac_mode == HVACMode.OFF:
            await self.coordinator.async_write("ventilation", MODE_OFF)
            return

        # Set the aux registers before the speed. Coming out of `off` that means
        # the unit starts already configured, instead of running a moment in
        # whatever heating state it was left in.
        for mode, key in _AUX.items():
            if key in self.coordinator.data.values:
                await self.coordinator.async_write(key, 1 if mode == hvac_mode else 0)

        level = self.coordinator.data.get("ventilation")
        if level is None or int(level) == MODE_OFF:
            await self.coordinator.async_write("ventilation", self._last_level)
