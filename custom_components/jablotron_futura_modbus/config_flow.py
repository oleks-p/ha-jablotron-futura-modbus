"""Config and options flow for the Jablotron Futura integration."""

from __future__ import annotations

from itertools import count
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_HOST, CONF_NAME, CONF_PORT
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.util import slugify

from .const import (
    CONF_ENABLE_CORRECTIONS,
    CONF_ENABLE_EXTERNAL_BUTTONS,
    CONF_ENABLE_EXTERNAL_SENSORS,
    CONF_SCAN_INTERVAL,
    CONF_SLOW_INTERVAL,
    CONF_UNIT_ID,
    DEFAULT_NAME,
    DEFAULT_PORT,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_SLOW_INTERVAL,
    DEFAULT_UNIT_ID,
    DEVICE_ID_FUTURA,
    DOMAIN,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
)
from .coordinator import decode_firmware, decode_u32
from .modbus_client import FuturaClient, FuturaConnectionError, FuturaModbusError


def _user_schema(name: str) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_HOST): cv.string,
            vol.Optional(CONF_NAME, default=name): vol.All(
                cv.string, vol.Strip, vol.Length(min=1)
            ),
            vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
            vol.Optional(CONF_UNIT_ID, default=DEFAULT_UNIT_ID): vol.All(
                vol.Coerce(int), vol.Range(min=1, max=247)
            ),
        }
    )


async def _probe(host: str, port: int, unit_id: int) -> dict[str, Any]:
    """Read the identity block to confirm this really is a Futura."""
    client = FuturaClient(host, port, unit_id)
    try:
        # 15 registers reaches sys_options at address 14, and 15 is one of the
        # counts the unit accepts -- a read ending mid-composite is rejected.
        words = await client.read("input", 0, 15)
    finally:
        await client.async_close()

    if words[0] != DEVICE_ID_FUTURA:
        raise NotAFutura(words[0])

    return {
        "serial_number": decode_u32(words, 1),
        "firmware": decode_firmware(words[8:10]),
        "model": "Futura M" if words[14] == 2 else "Futura L",
    }


class NotAFutura(Exception):
    """The device answered but is not a Futura."""

    def __init__(self, device_id: int) -> None:
        super().__init__(device_id)
        self.device_id = device_id


class FuturaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            host = user_input[CONF_HOST]
            port = user_input.get(CONF_PORT, DEFAULT_PORT)
            unit_id = user_input.get(CONF_UNIT_ID, DEFAULT_UNIT_ID)
            name = user_input.get(CONF_NAME, DEFAULT_NAME)
            if self._name_taken(name):
                errors[CONF_NAME] = "name_taken"
                return self.async_show_form(
                    step_id="user", data_schema=_user_schema(name), errors=errors
                )
            try:
                info = await _probe(host, port, unit_id)
            except NotAFutura:
                errors["base"] = "not_a_futura"
            except FuturaConnectionError:
                errors["base"] = "cannot_connect"
            except FuturaModbusError:
                errors["base"] = "invalid_response"
            except Exception:  # noqa: BLE001 - surfaced to the user as unknown
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(str(info["serial_number"]))
                # A unit already set up has moved address: follow it, but keep
                # the name its entity ids were built from.
                self._abort_if_unique_id_configured(
                    updates={CONF_HOST: host, CONF_PORT: port}
                )
                return self.async_create_entry(
                    title=name, data={**user_input, CONF_NAME: name}
                )

        return self.async_show_form(
            step_id="user", data_schema=_user_schema(self._free_name()), errors=errors
        )

    def _name_taken(self, name: str) -> bool:
        """Whether a unit already answers to this name, or holds its entity ids.

        Entity ids are built from the device name. Two units under one name
        collide, and Home Assistant settles that by putting `_2` on the *end*
        of each of the second unit's ids --
        `sensor.jablotron_futura_supply_air_temperature_2` -- so no prefix
        finds them and no card can be pointed at that unit. A name of its own
        keeps every id under `<domain>.<name>_`.

        The climate entity is the unit's one id that is the bare name, so its
        registration also catches a device renamed while its ids were kept.
        """
        names = {
            entry.data.get(CONF_NAME, DEFAULT_NAME)
            for entry in self._async_current_entries(include_ignore=False)
        }
        if name in names:
            return True
        return er.async_get(self.hass).async_is_registered(f"climate.{slugify(name)}")

    def _free_name(self) -> str:
        """DEFAULT_NAME, numbered past any unit that already uses it."""
        names = (DEFAULT_NAME if n == 1 else f"{DEFAULT_NAME} {n}" for n in count(1))
        return next(name for name in names if not self._name_taken(name))

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> FuturaOptionsFlow:
        return FuturaOptionsFlow()


class FuturaOptionsFlow(OptionsFlow):
    """Polling cadence and opt-in register groups."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        options = self.config_entry.options
        interval = vol.All(
            vol.Coerce(int), vol.Range(min=MIN_SCAN_INTERVAL, max=MAX_SCAN_INTERVAL)
        )
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SCAN_INTERVAL,
                    default=options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                ): interval,
                vol.Optional(
                    CONF_SLOW_INTERVAL,
                    default=options.get(CONF_SLOW_INTERVAL, DEFAULT_SLOW_INTERVAL),
                ): interval,
                vol.Optional(
                    CONF_ENABLE_CORRECTIONS,
                    default=options.get(CONF_ENABLE_CORRECTIONS, False),
                ): cv.boolean,
                vol.Optional(
                    CONF_ENABLE_EXTERNAL_SENSORS,
                    default=options.get(CONF_ENABLE_EXTERNAL_SENSORS, False),
                ): cv.boolean,
                vol.Optional(
                    CONF_ENABLE_EXTERNAL_BUTTONS,
                    default=options.get(CONF_ENABLE_EXTERNAL_BUTTONS, False),
                ): cv.boolean,
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
