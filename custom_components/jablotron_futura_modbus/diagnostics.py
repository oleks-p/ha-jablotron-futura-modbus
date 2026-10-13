"""Diagnostics dump: raw registers plus the decoded view, for bug reports."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant

from .block_planner import describe
from .const import DOMAIN
from .coordinator import FuturaCoordinator

TO_REDACT = {CONF_HOST, "mac_address", "serial_number", "user_password", "access_code"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    coordinator: FuturaCoordinator = hass.data[DOMAIN][entry.entry_id]
    data = coordinator.data
    return {
        "entry": {
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": dict(entry.options),
        },
        "block_plan": describe(coordinator.blocks).splitlines(),
        "values": async_redact_data(dict(data.values), TO_REDACT),
        "flags": dict(data.flags),
        "present": sorted(data.present),
        "topology": data.topology,
        "stale_blocks": data.stale_blocks,
        # Raw words are the most useful thing in a bug report: they let a
        # decoding problem be reproduced without access to the hardware.
        "raw_registers": {key: words for key, words in sorted(data.raw.items())},
    }
