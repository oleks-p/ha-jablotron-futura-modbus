"""Serialised Modbus TCP transport for the Futura.

The unit advertises exactly one available socket, so every operation shares a
single long-lived connection guarded by a lock. Two device behaviours make this
mandatory rather than merely tidy:

* A second concurrent client steals the socket, so overlapping requests from
  within Home Assistant would fight each other.
* Addressing any unit id other than 1 on a live socket makes the Futura drop the
  connection outright, so the unit id is pinned and never taken from a request.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from collections.abc import Awaitable, Callable
from operator import methodcaller
from typing import Any, Final, NoReturn

from pymodbus.client import AsyncModbusTcpClient
from pymodbus.exceptions import ModbusIOException

from .const import SUPPORTED_UNIT_ID

_LOGGER = logging.getLogger(__name__)

CONNECT_TIMEOUT: Final = 5.0
BACKOFF_START: Final = 1.0
BACKOFF_MAX: Final = 60.0

#: pymodbus reconnects on its own by default, which is actively harmful here.
#: The unit accepts a single socket, so an abandoned client's background
#: reconnect loop holds that socket forever while the replacement client can
#: never connect -- the integration stays unavailable until Home Assistant is
#: restarted. Zero disables that loop and leaves reconnection to the coordinator.
NO_AUTO_RECONNECT: Final = 0

#: One attempt per call; the coordinator's own polling supplies the retries, and
#: three internal retries at the connect timeout would stall each poll for ages.
RETRIES: Final = 1

#: Requests in a row the unit may leave unanswered before the socket counts as
#: dead. One silence is the unit busy, not gone; see `_no_reply`.
MAX_SILENT_REQUESTS: Final = 3

#: The unit keeps only its newest connection, so another client connecting
#: resets ours. A request that loses its connection that way is sent again on a
#: new one this many times, after a pause that lets the other client finish the
#: request it connected for.
RECONNECTS: Final = 1
RECONNECT_DELAY: Final = 0.5


class FuturaConnectionError(Exception):
    """The unit could not be reached, or dropped the connection."""


class FuturaTimeoutError(FuturaConnectionError):
    """The unit left one request unanswered; the connection is still up."""


class FuturaModbusError(Exception):
    """The unit answered with a Modbus exception."""


class _ConnectionTaken(Exception):
    """The unit reset our connection, as it does when another client connects."""


class FuturaClient:
    """Single-socket Modbus TCP client with serialised access."""

    def __init__(self, host: str, port: int, unit_id: int = SUPPORTED_UNIT_ID) -> None:
        self._host = host
        self._port = port
        if unit_id != SUPPORTED_UNIT_ID:
            _LOGGER.warning(
                "Unit id %s requested, but the Futura only answers unit id %s; "
                "addressing another id makes it drop the connection",
                unit_id,
                SUPPORTED_UNIT_ID,
            )
        self._unit_id = unit_id
        self._client: AsyncModbusTcpClient | None = None
        self._lock = asyncio.Lock()
        self._backoff = BACKOFF_START
        self._silent = 0
        self._unit_kwarg: str | None = None

    @property
    def host(self) -> str:
        return self._host

    def _resolve_unit_kwarg(self) -> str:
        """pymodbus renamed the unit argument from `slave` to `device_id`."""
        if self._unit_kwarg is None:
            params = inspect.signature(
                AsyncModbusTcpClient.read_input_registers
            ).parameters
            self._unit_kwarg = "device_id" if "device_id" in params else "slave"
        return self._unit_kwarg

    async def _ensure_connected(self) -> AsyncModbusTcpClient:
        if self._client is None:
            self._client = AsyncModbusTcpClient(
                self._host,
                port=self._port,
                timeout=CONNECT_TIMEOUT,
                reconnect_delay=NO_AUTO_RECONNECT,
                reconnect_delay_max=NO_AUTO_RECONNECT,
                retries=RETRIES,
            )

        if getattr(self._client, "connected", False):
            return self._client

        try:
            accepted = await self._client.connect()
        except Exception as err:  # pymodbus raises a wide range here
            await self._drop()
            raise FuturaConnectionError(
                f"cannot connect to {self._host}:{self._port}: {err}"
            ) from err

        if not getattr(self._client, "connected", False):
            await self._drop()
            if accepted:
                # pymodbus waits a moment after connecting, and the unit reset
                # the connection within it: another client connected just after.
                raise _ConnectionTaken("the unit reset the connection as it opened")
            raise FuturaConnectionError(f"cannot connect to {self._host}:{self._port}")

        _LOGGER.debug("Connected to Futura at %s:%s", self._host, self._port)
        self._backoff = BACKOFF_START
        self._silent = 0
        return self._client

    async def _drop(self) -> None:
        """Close and forget the socket so the next call reconnects.

        The close has to actually land: a client left half-open would keep the
        unit's only socket and lock out every future connection.
        """
        client, self._client = self._client, None
        if client is None:
            return
        try:
            close = client.close()
            if inspect.isawaitable(close):
                await close
        except Exception:  # noqa: BLE001 - closing must never raise onward
            _LOGGER.debug("Ignoring error while closing the Futura socket",
                          exc_info=True)

    async def async_close(self) -> None:
        async with self._lock:
            await self._drop()

    async def _no_reply(
        self, client: AsyncModbusTcpClient, what: str, err: ModbusIOException
    ) -> NoReturn:
        """Classify a request the unit did not answer.

        pymodbus reports a timeout as a ModbusIOException, but a timeout is not
        a dead socket: the unit was busy, and it answers the next request as
        usual. Dropping the socket for it took every entity unavailable for a
        whole scan interval over one late block. So the socket stays up, and only
        a run of silences counts as the connection having gone.

        pymodbus raises the same exception when the connection was reset under
        the request, after waiting out the timeout for an answer that could
        never come. That is another client taking the socket, not a silence.
        """
        if isinstance(err.__cause__, asyncio.CancelledError):
            # pymodbus wraps a cancelled request in the same exception. The unit
            # did not go quiet, and the cancelled task still has to stop.
            raise err.__cause__
        if not getattr(client, "connected", False):
            await self._drop()
            raise _ConnectionTaken("the unit reset the connection") from err
        self._silent += 1
        if self._silent >= MAX_SILENT_REQUESTS:
            await self._drop()
            raise FuturaConnectionError(f"{what} failed: {err}") from err
        raise FuturaTimeoutError(f"{what}: no reply: {err}") from err

    def next_backoff(self) -> float:
        """Delay to wait before the next reconnect attempt."""
        delay = self._backoff
        self._backoff = min(self._backoff * 2, BACKOFF_MAX)
        return delay

    async def _request(
        self, what: str, send: Callable[[AsyncModbusTcpClient], Awaitable[Any]]
    ) -> Any:
        """Send one request, and again on a new connection if ours was taken.

        Another client connecting resets our connection, and a request caught
        by that failed the whole poll, about one in twelve where something else
        polls the unit every few seconds. That client's next connection is
        seconds away, so the request almost always gets through on a second
        connection. Every request here sets registers to absolute values, so
        sending a write again cannot apply it twice.
        """
        async with self._lock:
            for attempt in range(RECONNECTS + 1):
                if attempt:
                    await asyncio.sleep(RECONNECT_DELAY)
                try:
                    return await self._attempt(what, send)
                except _ConnectionTaken as err:
                    _LOGGER.debug("%s: %s", what, err)
                    taken = err
            raise FuturaConnectionError(
                f"{what} failed: {taken}, another client is using the unit"
            ) from taken

    async def _attempt(
        self, what: str, send: Callable[[AsyncModbusTcpClient], Awaitable[Any]]
    ) -> Any:
        client = await self._ensure_connected()
        try:
            result = await send(client)
        except ModbusIOException as err:
            await self._no_reply(client, what, err)
        except Exception as err:
            await self._drop()
            raise FuturaConnectionError(f"{what} failed: {err}") from err

        self._silent = 0
        if result.isError():
            # A Modbus exception means a bad address, not a bad socket, so
            # the connection stays up.
            raise FuturaModbusError(f"{what}: {result}")
        return result

    async def read(self, table: str, address: int, count: int) -> list[int]:
        """Read `count` registers from the input or holding table."""
        method = "read_input_registers" if table == "input" else "read_holding_registers"
        result = await self._request(
            f"read {table}[{address}..{address + count - 1}]",
            methodcaller(
                method, address, count=count, **{self._resolve_unit_kwarg(): self._unit_id}
            ),
        )
        return list(result.registers)

    async def write_single(self, address: int, value: int) -> None:
        """Write one holding register (FC6)."""
        await self._request(
            f"write holding[{address}]",
            methodcaller(
                "write_register",
                address,
                value=value & 0xFFFF,
                **{self._resolve_unit_kwarg(): self._unit_id},
            ),
        )

    async def write_multiple(self, address: int, values: list[int]) -> None:
        """Write consecutive holding registers (FC16).

        Composite values must go out in one FC16 request; writing half of a
        uint32 with FC6 is rejected with ILLEGAL_DATA_ADDRESS.
        """
        payload = [v & 0xFFFF for v in values]
        await self._request(
            f"write holding[{address}..{address + len(payload) - 1}]",
            methodcaller(
                "write_registers",
                address,
                values=payload,
                **{self._resolve_unit_kwarg(): self._unit_id},
            ),
        )
