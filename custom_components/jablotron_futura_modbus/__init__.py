"""The Jablotron Futura (Modbus TCP) integration."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_DEVICE_ID, CONF_HOST, CONF_NAME, CONF_PORT
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ConfigEntryNotReady, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util

from .const import (
    CONF_UNIT_ID,
    DEFAULT_NAME,
    DEFAULT_PORT,
    DEFAULT_UNIT_ID,
    DOMAIN,
    PLATFORMS,
    SERVICE_CLEAR_AWAY,
    SERVICE_SET_AWAY,
    SERVICE_SET_EXTERNAL_SENSOR,
    SERVICE_SET_FUNCTION,
    SERVICE_UNLOCK_SERVICE,
    SERVICE_WRITE_REGISTER,
    TIMER_LIMITS,
)
from .coordinator import FuturaCoordinator, encode_u32
from .modbus_client import FuturaClient, FuturaConnectionError

_LOGGER = logging.getLogger(__name__)

CARD_FILENAME = "futura-cards.js"
CARD_PATH = f"/{DOMAIN}/{CARD_FILENAME}"
# The version query busts the browser cache when the bundle changes, and makes
# the resource URL easy to spot and replace on upgrade.
CARD_URL = f"{CARD_PATH}?v={{version}}"

SERVICE_TARGET = vol.Schema({vol.Optional(ATTR_DEVICE_ID): cv.string})

SET_AWAY_SCHEMA = SERVICE_TARGET.extend(
    {vol.Optional("begin"): cv.datetime, vol.Optional("end"): cv.datetime}
)
# The outer bound is the loosest of any function; each one's own ceiling is
# then enforced in the handler, so raising a limit in one place is enough.
_MAX_DURATION = max(high for _, high in TIMER_LIMITS.values())

SET_FUNCTION_SCHEMA = SERVICE_TARGET.extend(
    {
        vol.Required("function"): vol.In(sorted(TIMER_LIMITS)),
        vol.Required("duration"): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=_MAX_DURATION)
        ),
    }
)
SET_EXTERNAL_SENSOR_SCHEMA = SERVICE_TARGET.extend(
    {
        vol.Required("index"): vol.All(vol.Coerce(int), vol.Range(min=1, max=8)),
        vol.Optional("temperature"): vol.Coerce(float),
        vol.Optional("humidity"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional("co2"): vol.All(vol.Coerce(int), vol.Range(min=0, max=10000)),
        vol.Optional("floor_temperature"): vol.Coerce(float),
    }
)
UNLOCK_SCHEMA = SERVICE_TARGET.extend(
    {vol.Required("code"): vol.All(vol.Coerce(int), vol.Range(min=0, max=65535))}
)
WRITE_REGISTER_SCHEMA = SERVICE_TARGET.extend(
    {
        vol.Required("address"): vol.All(vol.Coerce(int), vol.Range(min=0, max=65535)),
        vol.Required("value"): vol.All(vol.Coerce(int), vol.Range(min=0, max=65535)),
    }
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one Futura from a config entry."""
    client = FuturaClient(
        entry.data[CONF_HOST],
        entry.data.get(CONF_PORT, DEFAULT_PORT),
        entry.data.get(CONF_UNIT_ID, DEFAULT_UNIT_ID),
    )
    # Entries made before units were named fall back to the name they had then.
    coordinator = FuturaCoordinator(
        hass,
        client,
        dict(entry.options),
        device_name=entry.data.get(CONF_NAME, DEFAULT_NAME),
    )

    try:
        await coordinator.async_config_entry_first_refresh()
    except FuturaConnectionError as err:
        await client.async_close()
        raise ConfigEntryNotReady(str(err)) from err

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await _async_register_cards(hass, _integration_version(hass, entry))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    _async_register_services(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Tear down a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        coordinator: FuturaCoordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.client.async_close()
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)
    return unloaded


async def _async_reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_cards(hass: HomeAssistant, version: str) -> None:
    """Serve the bundled Lovelace cards and register them with the frontend.

    Registration goes through Lovelace *resources* rather than
    `frontend.add_extra_js_url`. An extra module URL is injected into the
    document head and runs before the frontend finishes booting, and Home
    Assistant then installs a scoped custom-element registry that replaces
    `window.customElements` -- silently discarding anything registered up to
    that point. The module loads, logs, and defines nothing, so the cards vanish
    from the dashboard with no error anywhere. Lovelace resources are fetched
    after the frontend is up, which is how HACS-installed cards avoid this.
    """
    if hass.data.get(f"{DOMAIN}_cards_registered"):
        return

    source = Path(__file__).parent / "www" / CARD_FILENAME
    if not source.is_file():
        _LOGGER.debug("Bundled cards not found at %s; skipping registration", source)
        return

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_PATH, str(source), cache_headers=False)]
        )
    except Exception:  # noqa: BLE001 - never fail setup over a dashboard card
        _LOGGER.warning(
            "Could not serve the bundled Futura cards; the integration works "
            "normally but the custom cards will be unavailable",
            exc_info=True,
        )
        return

    hass.data[f"{DOMAIN}_cards_registered"] = True
    await _async_register_resource(hass, CARD_URL.format(version=version))


async def _async_register_resource(hass: HomeAssistant, url: str) -> None:
    """Add the card bundle to Lovelace's resource list, if we can."""
    try:
        from homeassistant.components.lovelace import LOVELACE_DATA
    except ImportError:
        _LOGGER.debug("Lovelace is not available; skipping resource registration")
        return

    lovelace = hass.data.get(LOVELACE_DATA)
    resources = getattr(lovelace, "resources", None)
    if resources is None:
        _LOGGER.debug("Lovelace resources are not ready; skipping registration")
        return

    if getattr(lovelace, "resource_mode", None) != "storage":
        # In YAML mode the resource list is owned by the user's configuration.
        _LOGGER.info(
            "Lovelace is in YAML mode, so add the Futura cards yourself:\n"
            "lovelace:\n  resources:\n    - url: %s\n      type: module",
            url,
        )
        return

    try:
        if hasattr(resources, "async_load") and not resources.loaded:
            await resources.async_load()

        base = url.split("?")[0]
        for item in resources.async_items():
            existing = str(item.get("url", ""))
            if existing.split("?")[0] != base:
                continue
            if existing == url:
                _LOGGER.debug("Futura card resource already registered")
                return
            # Same file, stale version query: point it at the current bundle.
            await resources.async_update_item(
                item["id"], {"url": url, "res_type": "module"}
            )
            _LOGGER.info("Updated the Futura card resource to %s", url)
            return

        await resources.async_create_item({"url": url, "res_type": "module"})
        _LOGGER.info("Registered the Futura card resource at %s", url)
    except Exception:  # noqa: BLE001 - a dashboard card must not break setup
        _LOGGER.warning(
            "Could not add the Futura cards to Lovelace resources. Add this "
            "manually under Settings > Dashboards > Resources: %s (type: module)",
            url,
            exc_info=True,
        )


def _integration_version(hass: HomeAssistant, entry: ConfigEntry) -> str:
    """Manifest version, used to cache-bust the card bundle."""
    try:
        from homeassistant.loader import async_get_loaded_integration

        return async_get_loaded_integration(hass, entry.domain).version or "0"
    except Exception:  # noqa: BLE001 - only affects the cache-busting query
        return "0"


def _resolve(hass: HomeAssistant, call: ServiceCall) -> FuturaCoordinator:
    """Pick the coordinator a service call targets."""
    entries: dict[str, FuturaCoordinator] = hass.data.get(DOMAIN, {})
    if not entries:
        raise ServiceValidationError("No Jablotron Futura is configured")

    device_id = call.data.get(ATTR_DEVICE_ID)
    if device_id:
        device = dr.async_get(hass).async_get(device_id)
        for entry_id in device.config_entries if device else ():
            if entry_id in entries:
                return entries[entry_id]
        raise ServiceValidationError(f"Device {device_id} is not a configured Futura")
    if len(entries) > 1:
        raise ServiceValidationError(
            "Several Futura units are configured; pass device_id to choose one"
        )
    return next(iter(entries.values()))


def _async_register_services(hass: HomeAssistant) -> None:
    """Register the domain services once."""
    if hass.services.has_service(DOMAIN, SERVICE_SET_AWAY):
        return

    def local_timestamp(value) -> int:
        """The unit stores away times as a LOCAL-time unix timestamp.

        Home Assistant hands us an aware datetime, so the offset is added back
        to produce the wall-clock seconds the Futura expects.
        """
        aware = dt_util.as_local(value)
        return int(aware.timestamp() + (aware.utcoffset().total_seconds() or 0))

    async def set_away(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        begin = call.data.get("begin") or dt_util.now()
        end = call.data.get("end")
        begin_ts = local_timestamp(begin)
        end_ts = local_timestamp(end) if end else begin_ts + 7 * 24 * 3600
        if end_ts <= begin_ts:
            raise ServiceValidationError("The away period must end after it begins")
        # One FC16 across all four registers, not two writes of two. Holding 6-9
        # is one structure to the unit, so writing it in one request is the
        # closer reading of the spec's composite-register rule.
        #
        # This does NOT make the function arm. Both forms store the timestamps
        # and report them back exactly; neither gets fut_mode bit 4 set, even
        # with the unit's clock inside the period. Tested with the begin in the
        # past, and with the begin in the future and the clock left to cross it.
        # A period set from the mobile app does arm, and re-writing that same
        # period from here keeps it armed -- so the registers and the bit are
        # both right, and what the unit will not do is *enter* away because of a
        # Modbus write.
        #
        # The remaining suspicion is the unit's own clock: the app writes
        # timestamps in the unit's time base, we write them in Home Assistant's,
        # and the register map exposes no clock to compare against -- only the
        # RTC battery voltage. Left as one request because it is the better
        # reading of the spec, not because it fixed anything.
        await coordinator.client.write_multiple(
            6, encode_u32(begin_ts) + encode_u32(end_ts)
        )
        await coordinator.async_request_refresh()

    async def clear_away(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        await coordinator.client.write_multiple(6, [0, 0])
        await coordinator.client.write_multiple(8, [0, 0])
        await coordinator.async_request_refresh()

    async def set_function(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        function = call.data["function"]
        duration = call.data["duration"]
        low, high = TIMER_LIMITS[function]
        if not low <= duration <= high:
            raise ServiceValidationError(
                f"{function} accepts {low}-{high} seconds, got {duration}"
            )
        await coordinator.async_write(f"{function}_timer", duration)

    async def set_external_sensor(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        index = call.data["index"]
        base = 300 + (index - 1) * 10
        # Through the coordinator, so the slot's entities appear and show the
        # values straight away rather than at the next slow poll.
        await coordinator.async_write_raw("holding", base, 1)
        for offset, key, scale in (
            (2, "temperature", 10),
            (3, "humidity", 1),
            (4, "co2", 1),
            (5, "floor_temperature", 10),
        ):
            if key in call.data:
                raw = int(round(float(call.data[key]) * scale))
                await coordinator.async_write_raw("holding", base + offset, raw & 0xFFFF)

    async def unlock_service(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        try:
            await coordinator.client.write_single(900, call.data["code"])
        except Exception as err:  # noqa: BLE001 - reported, not fatal
            raise ServiceValidationError(
                "The unit refused the service code; registers at 900 and above "
                f"stay locked on consumer firmware ({err})"
            ) from err
        await coordinator.async_request_refresh()

    async def write_register(call: ServiceCall) -> None:
        coordinator = _resolve(hass, call)
        await coordinator.async_write_raw(
            "holding", call.data["address"], call.data["value"]
        )

    for name, handler, schema in (
        (SERVICE_SET_AWAY, set_away, SET_AWAY_SCHEMA),
        (SERVICE_CLEAR_AWAY, clear_away, SERVICE_TARGET),
        (SERVICE_SET_FUNCTION, set_function, SET_FUNCTION_SCHEMA),
        (SERVICE_SET_EXTERNAL_SENSOR, set_external_sensor, SET_EXTERNAL_SENSOR_SCHEMA),
        (SERVICE_UNLOCK_SERVICE, unlock_service, UNLOCK_SCHEMA),
        (SERVICE_WRITE_REGISTER, write_register, WRITE_REGISTER_SCHEMA),
    ):
        hass.services.async_register(DOMAIN, name, handler, schema=schema)
