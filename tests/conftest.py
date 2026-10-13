"""Fixtures backed by a fake Futura that enforces the real device's rules."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

import pytest
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.jablotron_futura_modbus.const import CONF_UNIT_ID, DOMAIN
from custom_components.jablotron_futura_modbus.registers import REGISTERS, Table

FIXTURE = Path(__file__).parent / "fixtures" / "futura_l_fw0720.json"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _composite_starts() -> dict[Table, set[int]]:
    """Addresses that begin a multi-register value, and the words they span."""
    return {
        table: {
            reg.address: reg.words
            for reg in REGISTERS
            if reg.table is table and reg.words > 1
        }
        for table in (Table.INPUT, Table.HOLDING)
    }


class ModbusExceptionResponse:
    """Stands in for a pymodbus exception response."""

    def __init__(self, code: int = 2) -> None:
        self.exception_code = code
        self.registers: list[int] = []

    def isError(self) -> bool:  # noqa: N802 - pymodbus spelling
        return True

    def __str__(self) -> str:
        return f"ModbusException(code={self.exception_code})"


class ModbusOkResponse:
    def __init__(self, registers: list[int]) -> None:
        self.registers = registers

    def isError(self) -> bool:  # noqa: N802 - pymodbus spelling
        return False


class FakeFutura:
    """A model of the unit, not just a stub.

    It reproduces the two behaviours that shape the whole integration:
    reading across an undefined address fails, and so does a read that starts or
    ends inside a uint32 or array. Anything the planner emits must satisfy both.
    """

    def __init__(self, observed: dict) -> None:
        self.connected = False
        self.writes: list[tuple[int, list[int]]] = []
        #: Counts read requests, so tests can assert refreshes are coalesced.
        self.reads = 0
        self._composites = _composite_starts()
        self._store: dict[Table, dict[int, int]] = {
            Table.INPUT: {},
            Table.HOLDING: {},
        }
        self._load(observed)

    def _load(self, observed: dict) -> None:
        for section in ("input_blocks", "holding_blocks", "optional_ranges"):
            for label, entry in (observed.get(section) or {}).items():
                if entry.get("status") != "OK" or not entry.get("words"):
                    continue
                spec = label.split(":")[-1]
                table = Table.HOLDING if "holding" in (
                    label if ":" in label else section
                ) else Table.INPUT
                start = int(spec.split("..")[0])
                for offset, word in enumerate(entry["words"]):
                    self._store[table][start + offset] = word
        # Corrections were captured individually.
        for values in (observed.get("corrections") or {}).values():
            for address, value in values.items():
                raw = int(value)
                self._store[Table.HOLDING][int(address)] = raw & 0xFFFF
        # Every declared address must answer, even if the probe never saw it.
        for reg in REGISTERS:
            for address in range(reg.address, reg.address + reg.words):
                self._store[reg.table].setdefault(address, 0)

    # -- the device's rules ---------------------------------------------

    def _check(self, table: Table, address: int, count: int):
        store = self._store[table]
        for candidate in range(address, address + count):
            if candidate not in store:
                return ModbusExceptionResponse()  # gap
        composites = self._composites[table]
        for start, words in composites.items():
            spans_start = start < address < start + words
            spans_end = start < address + count < start + words
            if spans_start or spans_end:
                return ModbusExceptionResponse()  # split composite
        return None

    def _read(self, table: Table, address: int, count: int):
        if not self.connected:
            raise ConnectionError("not connected")
        self.reads += 1
        error = self._check(table, address, count)
        if error is not None:
            return error
        store = self._store[table]
        return ModbusOkResponse([store[a] for a in range(address, address + count)])

    # -- pymodbus surface ------------------------------------------------

    async def connect(self) -> bool:
        self.connected = True
        return True

    def close(self) -> None:
        self.connected = False

    async def read_input_registers(self, address, count=1, **kwargs):
        return self._read(Table.INPUT, address, count)

    async def read_holding_registers(self, address, count=1, **kwargs):
        return self._read(Table.HOLDING, address, count)

    async def write_register(self, address, value=0, **kwargs):
        if not self.connected:
            raise ConnectionError("not connected")
        if address not in self._store[Table.HOLDING]:
            return ModbusExceptionResponse()
        self._store[Table.HOLDING][address] = value & 0xFFFF
        self.writes.append((address, [value & 0xFFFF]))
        return ModbusOkResponse([])

    async def write_registers(self, address, values=(), **kwargs):
        if not self.connected:
            raise ConnectionError("not connected")
        payload = list(values)
        error = self._check(Table.HOLDING, address, len(payload))
        if error is not None:
            return error
        for offset, value in enumerate(payload):
            self._store[Table.HOLDING][address + offset] = value & 0xFFFF
        self.writes.append((address, payload))
        return ModbusOkResponse([])

    # -- helpers for assertions -----------------------------------------

    def peek(self, table: Table, address: int) -> int:
        return self._store[table][address]

    def poke(self, table: Table, address: int, value: int) -> None:
        self._store[table][address] = value & 0xFFFF


@pytest.fixture
def observed() -> dict:
    return json.loads(FIXTURE.read_text())


@pytest.fixture
def fake_futura(observed):
    return FakeFutura(observed)


@pytest.fixture
def mock_client(fake_futura):
    """Patch the pymodbus client the integration constructs."""
    with patch(
        "custom_components.jablotron_futura_modbus.modbus_client."
        "AsyncModbusTcpClient",
        return_value=fake_futura,
    ):
        yield fake_futura


@pytest.fixture
def config_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        title="Futura L (test)",
        unique_id="4200000000",
        data={CONF_HOST: "192.0.2.10", CONF_PORT: 502, CONF_UNIT_ID: 1},
        options={},
    )


@pytest.fixture
async def setup_integration(
    hass: HomeAssistant, config_entry: MockConfigEntry, mock_client
):
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    return config_entry
