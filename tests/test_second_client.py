"""Another client on the unit: it keeps only its newest connection."""

from __future__ import annotations

import pytest
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from pymodbus.exceptions import ModbusIOException

from custom_components.jablotron_futura_modbus.const import DOMAIN
from custom_components.jablotron_futura_modbus.modbus_client import (
    FuturaClient,
    FuturaConnectionError,
    FuturaTimeoutError,
)
from custom_components.jablotron_futura_modbus.registers import Table


def _once(table: Table, address: int):
    """Catch the next request to one block, and only that one."""
    pending = {(table, address)}

    def caught(t: Table, a: int) -> bool:
        if (t, a) in pending:
            pending.discard((t, a))
            return True
        return False

    return caught


def _unavailable(hass: HomeAssistant) -> list[str]:
    return sorted(
        state.entity_id for state in hass.states.async_all()
        if ".jablotron_futura" in state.entity_id and state.state == STATE_UNAVAILABLE
    )


class TestClient:
    async def test_a_connection_reset_as_it_opens_is_opened_again(self, mock_client):
        mock_client.taken_on_connect = 1
        client = FuturaClient("192.0.2.10", 502)

        assert (await client.read("input", 0, 15))[0] == 39
        assert mock_client.connects == 2

    async def test_a_request_whose_connection_is_reset_is_sent_again(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        await client.read("input", 0, 15)
        mock_client.taken = _once(Table.INPUT, 0)

        assert (await client.read("input", 0, 15))[0] == 39
        assert mock_client.connects == 2

    async def test_it_gives_up_after_one_more_connection(self, mock_client):
        mock_client.taken = lambda *_: True
        client = FuturaClient("192.0.2.10", 502)

        with pytest.raises(FuturaConnectionError, match="another client") as raised:
            await client.read("input", 0, 15)

        assert not isinstance(raised.value, FuturaTimeoutError)
        assert mock_client.connects == 2

    async def test_a_refused_connection_is_not_tried_again(self, mock_client):
        """A unit that is off has to fail fast, not cost a second connect timeout."""
        attempts = []

        async def refused() -> bool:
            attempts.append(1)
            return False

        mock_client.connect = refused
        client = FuturaClient("192.0.2.10", 502)

        with pytest.raises(FuturaConnectionError):
            await client.read("input", 0, 15)
        assert len(attempts) == 1

    async def test_a_write_whose_connection_is_reset_is_sent_again(self, mock_client):
        client = FuturaClient("192.0.2.10", 502)
        await client.read("input", 0, 15)
        write = mock_client.write_register
        caught = [True]

        async def reset_once(address, value=0, **kwargs):
            if caught.pop() if caught else False:
                mock_client.connected = False
                raise ModbusIOException("No response received after 1 retries")
            return await write(address, value=value, **kwargs)

        mock_client.write_register = reset_once
        await client.write_single(0, 2)

        assert mock_client.peek(Table.HOLDING, 0) == 2
        assert mock_client.writes == [(0, [2])]


class TestPolling:
    async def test_a_request_caught_mid_poll_keeps_every_entity_available(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        already = _unavailable(hass)
        fake_futura.poke(Table.INPUT, 44, 321)
        fake_futura.taken = _once(Table.INPUT, 40)

        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert coordinator.last_update_success
        assert coordinator.data.get("air_flow") == 321
        assert coordinator.data.stale_blocks == []
        assert _unavailable(hass) == already

    async def test_a_poll_whose_new_connection_is_reset_still_reads(
        self, hass: HomeAssistant, setup_integration, fake_futura
    ):
        """The other client took the socket between polls, then again as we
        opened ours: the usual way a poll was lost."""
        coordinator = hass.data[DOMAIN][setup_integration.entry_id]
        already = _unavailable(hass)
        fake_futura.connected = False
        fake_futura.taken_on_connect = 1

        await coordinator.async_refresh()
        await hass.async_block_till_done()

        assert coordinator.last_update_success
        assert _unavailable(hass) == already
