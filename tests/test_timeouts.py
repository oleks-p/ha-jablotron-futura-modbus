"""A request the unit leaves unanswered is a busy unit, not a lost connection."""

from __future__ import annotations

import asyncio

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from pymodbus.exceptions import ModbusIOException

from custom_components.jablotron_futura_modbus.const import DOMAIN
from custom_components.jablotron_futura_modbus.modbus_client import (
    MAX_SILENT_REQUESTS,
    FuturaClient,
    FuturaConnectionError,
    FuturaTimeoutError,
)
from custom_components.jablotron_futura_modbus.registers import Table

AIR_FLOW = "sensor.jablotron_futura_air_flow"


def _unavailable(hass: HomeAssistant) -> list[str]:
    return sorted(
        state.entity_id for state in hass.states.async_all()
        if ".jablotron_futura" in state.entity_id and state.state == STATE_UNAVAILABLE
    )


def _silent_once(table: Table, address: int):
    """Leave the next read of one block unanswered, then answer again."""
    pending = {(table, address)}

    def silent(t: Table, a: int) -> bool:
        if (t, a) in pending:
            pending.discard((t, a))
            return True
        return False

    return silent


class TestClient:
    async def test_a_timeout_keeps_the_socket(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        await client.read("input", 0, 15)
        mock_client.silent = _silent_once(Table.INPUT, 0)

        with pytest.raises(FuturaTimeoutError):
            await client.read("input", 0, 15)

        assert mock_client.connected
        assert (await client.read("input", 0, 15))[0] == 39
        assert mock_client.connects == 1

    async def test_a_run_of_timeouts_drops_it(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        mock_client.silent = lambda *_: True

        for _ in range(MAX_SILENT_REQUESTS - 1):
            with pytest.raises(FuturaTimeoutError):
                await client.read("input", 0, 15)
        with pytest.raises(FuturaConnectionError) as raised:
            await client.read("input", 0, 15)

        assert not isinstance(raised.value, FuturaTimeoutError)
        assert not mock_client.connected

    async def test_an_answer_ends_the_run(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        for _ in range(3 * MAX_SILENT_REQUESTS):
            mock_client.silent = lambda *_: True
            for _ in range(MAX_SILENT_REQUESTS - 1):
                with pytest.raises(FuturaTimeoutError):
                    await client.read("input", 0, 15)
            mock_client.silent = lambda *_: False
            await client.read("input", 0, 15)

        assert mock_client.connects == 1

    async def test_a_timeout_that_closed_the_transport_is_a_lost_connection(
        self, mock_client
    ):
        """pymodbus gives up on a socket by itself after enough silences."""
        client = FuturaClient("192.0.2.10", 502)
        await client.read("input", 0, 15)

        async def closing(*args, **kwargs):
            mock_client.connected = False
            raise ModbusIOException("No response received, CLOSING CONNECTION.")

        mock_client.read_input_registers = closing
        with pytest.raises(FuturaConnectionError) as raised:
            await client.read("input", 0, 15)
        assert not isinstance(raised.value, FuturaTimeoutError)

    async def test_a_cancelled_read_is_still_cancelled(self, mock_client):
        """pymodbus wraps a cancellation in the same exception as a timeout."""
        client = FuturaClient("192.0.2.10", 502)

        async def cancelled(*args, **kwargs):
            try:
                raise asyncio.CancelledError
            except asyncio.CancelledError as exc:
                raise ModbusIOException("Request cancelled outside library.") from exc

        mock_client.read_input_registers = cancelled
        with pytest.raises(asyncio.CancelledError):
            await client.read("input", 0, 15)

    async def test_an_unanswered_write_keeps_the_socket(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        await client.read("input", 0, 15)

        async def unanswered(*args, **kwargs):
            raise ModbusIOException("No response received after 1 retries")

        mock_client.write_register = unanswered
        with pytest.raises(FuturaTimeoutError):
            await client.write_single(0, 2)
        assert mock_client.connected
        assert mock_client.connects == 1


class TestPolling:
    async def test_one_late_block_keeps_every_entity_available(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        already = _unavailable(hass)
        before = hass.states.get(AIR_FLOW).state
        fake_futura.poke(Table.INPUT, 44, int(float(before)) + 50)
        fake_futura.poke(Table.INPUT, 30, 333)
        fake_futura.silent = _silent_once(Table.INPUT, 40)

        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert coordinator.last_update_success
        assert hass.states.get(AIR_FLOW).state == before
        assert coordinator.data.stale_blocks == ["input[40..52] (13w, fast)"]
        assert coordinator.data.get("temp_ambient") == 33.3
        assert _unavailable(hass) == already
        assert fake_futura.connects == 1

        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert float(hass.states.get(AIR_FLOW).state) == float(before) + 50
        assert coordinator.data.stale_blocks == []

    async def test_a_unit_gone_quiet_goes_unavailable(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        reads = fake_futura.reads
        fake_futura.silent = lambda *_: True

        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert not coordinator.last_update_success
        assert hass.states.get(AIR_FLOW).state == STATE_UNAVAILABLE
        # The poll gives up at the run's end rather than waiting out every block.
        assert fake_futura.reads - reads == MAX_SILENT_REQUESTS
        assert not fake_futura.connected

    async def test_a_timeout_during_setup_retries_with_the_socket_freed(
        self, hass: HomeAssistant, config_entry, mock_client
    ):
        """The retry builds a new client, which needs the unit's one socket."""
        mock_client.silent = _silent_once(Table.INPUT, 30)
        config_entry.add_to_hass(hass)
        await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()

        assert config_entry.state is ConfigEntryState.SETUP_RETRY
        assert not mock_client.connected
