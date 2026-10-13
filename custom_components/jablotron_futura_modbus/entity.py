"""Shared entity base for the Jablotron Futura integration."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import callback
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC, format_mac
from homeassistant.helpers.entity import Entity, EntityDescription
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER
from .coordinator import FuturaCoordinator
from .registers import Reg


class FuturaEntity(CoordinatorEntity[FuturaCoordinator]):
    """Base class wiring every entity to the shared device and coordinator."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: FuturaCoordinator,
        description: EntityDescription,
        *,
        gate: str | None = None,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._gate = gate
        serial = coordinator.data.get("serial_number")
        self._serial = str(serial) if serial else coordinator.client.host
        self._attr_unique_id = f"{self._serial}_{description.key}"

    @property
    def device_info(self) -> dict[str, Any]:
        data = self.coordinator.data
        mac = data.get("mac_address")
        info: dict[str, Any] = {
            "identifiers": {(DOMAIN, self._serial)},
            "manufacturer": MANUFACTURER,
            "model": data.get("model") or "Futura",
            "name": self.coordinator.device_name,
            "sw_version": data.get("firmware"),
            "hw_version": (
                str(data.get("hw_revision")) if data.get("hw_revision") else None
            ),
            "serial_number": self._serial,
            "configuration_url": f"http://{self.coordinator.client.host}",
        }
        if mac:
            info["connections"] = {(CONNECTION_NETWORK_MAC, format_mac(mac))}
        return info

    @property
    def available(self) -> bool:
        if not self.coordinator.last_update_success:
            return False
        if self._gate and self._gate not in self.coordinator.data.present:
            return False
        return True


def add_present_entities(
    entry: ConfigEntry,
    coordinator: FuturaCoordinator,
    async_add_entities: AddEntitiesCallback,
    regs: Iterable[Reg],
    factory: Callable[[Reg], Entity],
) -> None:
    """Add each register's entity once its presence gate is satisfied.

    Peripheral entities are gated on presence so a unit with no ALFA and no wall
    sensors does not acquire dozens of permanently unavailable entities. Deciding
    that once, at platform setup, made the whole entity set depend on a single
    Modbus read: presence is decoded from a slow-tier block, and if that block
    was missed on the first poll -- a socket still held by the previous run, a
    slow first response on a device that serves exactly one client -- then those
    entities were never created at all. Home Assistant then reports the ones it
    remembers as "no longer being provided by the integration", and they stay
    that way until the next restart. On real hardware that was five CO2 sensors
    and an ALFA going unavailable at a restart, with their history simply
    stopping.

    So the gate is re-checked on every coordinator update instead of once.
    Anything newly present is added then. That makes a missed first poll heal
    itself on the next one, and it also means plugging a sensor into the unit
    shows up without reloading the integration -- which the previous code had a
    comment conceding it could not do.

    Entities are only ever added, never removed: a peripheral that stops
    answering should go unavailable, which `FuturaEntity.available` already does
    from the same presence set. Removing it would throw away its history.
    """
    added: set[str] = set()

    @callback
    def sync() -> None:
        present = coordinator.data.present
        pending = [
            reg
            for reg in regs
            if reg.key not in added
            and (reg.available_if is None or reg.available_if in present)
        ]
        if not pending:
            return
        added.update(reg.key for reg in pending)
        async_add_entities([factory(reg) for reg in pending])

    sync()
    entry.async_on_unload(coordinator.async_add_listener(sync))
