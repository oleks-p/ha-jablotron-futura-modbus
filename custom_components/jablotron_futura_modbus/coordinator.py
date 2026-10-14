"""Polling coordinator: reads planned blocks and decodes them into values."""

from __future__ import annotations

import datetime as dt
import logging
import time
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as ha_dt

from .block_planner import Block, plan_blocks
from .const import (
    CONF_ENABLE_CORRECTIONS,
    CONF_SCAN_INTERVAL,
    CONF_SLOW_INTERVAL,
    DEFAULT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_SLOW_INTERVAL,
    DOMAIN,
    MIN_FIRMWARE,
    NTC_DISCONNECTED_RAW,
    WRITE_REFRESH_COOLDOWN,
)
from .modbus_client import (
    FuturaClient,
    FuturaConnectionError,
    FuturaModbusError,
    FuturaTimeoutError,
)
from .registers import (
    BY_KEY,
    CONFIG_BITS,
    DIGITAL_INPUT_BITS,
    ERROR_BITS,
    EXT_SENSOR_INVALID_BITS,
    MODE_BITS,
    REGISTERS,
    WARNING_BITS,
    Kind,
    Reg,
    Table,
    Tier,
    decode_valve_topology,
)

_LOGGER = logging.getLogger(__name__)

#: Room-sensor families and how many slots each can hold. External sensors are
#: room readings too, just written into the unit rather than measured by it.
PERIPHERAL_FAMILIES: tuple[tuple[str, int], ...] = (
    ("wall_ui", 3),
    ("wall_sensor", 8),
    ("alfa", 8),
    ("ext_sensor", 8),
)

#: External slots, each declaring itself in use in its own first register.
EXTERNAL_SLOTS: tuple[str, ...] = ("ext_sensor", "ext_button")


def decode_u32(words: list[int], offset: int) -> int:
    """Futura uint32: the first register holds the low 16 bits."""
    return (words[offset + 1] << 16) | words[offset]


def decode_i16(word: int) -> int:
    return word - 0x10000 if word & 0x8000 else word


def decode_mac(words: list[int]) -> str:
    """Futura MAC array: the two bytes inside each register are swapped."""
    octets: list[int] = []
    for word in words:
        octets.append(word & 0xFF)
        octets.append(word >> 8)
    return ":".join(f"{octet:02x}" for octet in octets)


def decode_firmware(words: list[int]) -> str:
    """Futura firmware: the low register packs major and minor as bytes."""
    return f"FUA.P.{words[0] >> 8:02d}.{words[0] & 0xFF:02d}"


def firmware_tuple(words: list[int]) -> tuple[int, int]:
    return (words[0] >> 8, words[0] & 0xFF)


def encode_u32(value: int) -> list[int]:
    """Split a uint32 into [low, high] for an FC16 write."""
    return [value & 0xFFFF, (value >> 16) & 0xFFFF]


def decode_register(reg: Reg, words: list[int], offset: int) -> Any:
    """Turn the raw words at `offset` into the register's logical value."""
    if reg.kind is Kind.MAC:
        return decode_mac(words[offset : offset + 3])
    if reg.kind is Kind.FIRMWARE:
        return decode_firmware(words[offset : offset + 2])
    if reg.kind in (Kind.U32, Kind.BITS32):
        raw: int = decode_u32(words, offset)
    elif reg.kind is Kind.I16:
        raw = decode_i16(words[offset])
    else:
        raw = words[offset]

    if reg.kind in (Kind.BITS16, Kind.BITS32):
        return raw
    if reg.scale != 1.0:
        return round(raw * reg.scale, 3)
    return raw


def bits_to_flags(value: int, table: dict[int, str], prefix: str) -> dict[str, bool]:
    return {f"{prefix}{name}": bool(value >> bit & 1) for bit, name in table.items()}


@dataclass
class FuturaData:
    """One poll's worth of decoded state."""

    values: dict[str, Any] = field(default_factory=dict)
    flags: dict[str, bool] = field(default_factory=dict)
    present: set[str] = field(default_factory=set)
    topology: dict[str, list[dict[str, int]]] = field(default_factory=dict)
    raw: dict[str, list[int]] = field(default_factory=dict)
    stale_blocks: list[str] = field(default_factory=list)

    def get(self, key: str, default: Any = None) -> Any:
        return self.values.get(key, default)


class FuturaCoordinator(DataUpdateCoordinator[FuturaData]):
    """Reads the Futura on two cadences and decodes the register map."""

    def __init__(
        self,
        hass: HomeAssistant,
        client: FuturaClient,
        options: dict[str, Any] | None = None,
        device_name: str = DEFAULT_NAME,
    ) -> None:
        opts = options or {}
        self._fast_interval = int(opts.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
        self._slow_interval = max(
            int(opts.get(CONF_SLOW_INTERVAL, DEFAULT_SLOW_INTERVAL)),
            self._fast_interval,
        )
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=self._fast_interval),
            # immediate=False so a run of writes settles into one refresh once
            # the user stops, rather than reading the unit on every keypress.
            request_refresh_debouncer=Debouncer(
                hass,
                _LOGGER,
                cooldown=WRITE_REFRESH_COOLDOWN,
                immediate=False,
            ),
        )
        self.client = client
        self.device_name = device_name
        self._options = opts
        self._blocks = plan_blocks(self._active_registers(opts))
        self._last_slow: float = 0.0
        self._cache: dict[str, list[int]] = {}
        self._stale: list[str] = []
        self._primed = False
        self.data = FuturaData()

    @staticmethod
    def _active_registers(options: dict[str, Any]) -> tuple[Reg, ...]:
        """Drop the correction registers unless asked for.

        They are strided with gaps, so each costs a request of its own, and they
        are set once at commissioning. The external sensor and button slots are
        strided the same way -- sixteen requests -- but they are read on every
        slow poll regardless: whether anything feeds them is exactly what the
        integration has to find out.
        """
        if options.get(CONF_ENABLE_CORRECTIONS, False):
            return REGISTERS
        return tuple(
            reg for reg in REGISTERS if not reg.key.endswith("_temp_correction")
        )

    @property
    def blocks(self) -> tuple[Block, ...]:
        return self._blocks

    # -- polling ---------------------------------------------------------

    async def _async_update_data(self) -> FuturaData:
        now = time.monotonic()
        include_slow = (now - self._last_slow) >= self._slow_interval

        # Presence gating needs the peripheral bitfields, which live in a slow
        # tier block. Reuse what the last cycle learned so a fast poll still
        # knows which peripherals to read.
        present = self.data.present if self.data else set()

        self._stale.clear()
        deferred: list[Block] = []
        for block in self._blocks:
            if block.tier is Tier.SLOW and not include_slow:
                continue
            gates = block.gate_keys()
            if gates and not (gates & present):
                deferred.append(block)
                continue
            await self._fetch(block)

        # Decode from the whole cache, not just this cycle's reads: slow-tier
        # values must survive the fast polls in between, or every peripheral
        # would drop out one interval after setup.
        data = self._build()

        if deferred:
            newly = [b for b in deferred if b.gate_keys() & data.present]
            for block in newly:
                await self._fetch(block)
            if newly:
                data = self._build()

        if include_slow:
            self._last_slow = now

        self._primed = True
        self._check_firmware(data)
        return data

    async def _fetch(self, block: Block) -> None:
        """Read one block into the cache, keeping prior words if it fails."""
        key = self._cache_key(block)
        try:
            words = await self.client.read(
                block.table.value, block.address, block.count
            )
        except FuturaTimeoutError as err:
            # The unit was busy and the socket is fine, so one late block
            # must not take every entity unavailable: it keeps its last
            # reading until the next poll. The first poll has none to keep,
            # and setup should retry rather than start with holes in it.
            if not self._primed:
                raise UpdateFailed(str(err)) from err
            _LOGGER.debug("Keeping the last reading of %s: %s", block, err)
            self._stale.append(str(block))
            return
        except FuturaConnectionError as err:
            raise UpdateFailed(str(err)) from err
        except FuturaModbusError as err:
            # A rejected address is a map problem, not a dead socket, so keep
            # the rest of the entities alive.
            _LOGGER.warning("Skipping %s: %s", block, err)
            self._stale.append(str(block))
            return
        self._cache[key] = words

    @staticmethod
    def _cache_key(block: Block) -> str:
        return f"{block.table.value}:{block.address}"

    def _build(self) -> FuturaData:
        """Decode every block currently held in the cache."""
        data = FuturaData(stale_blocks=list(self._stale))
        for block in self._blocks:
            words = self._cache.get(self._cache_key(block))
            if words is None:
                continue
            data.raw[self._cache_key(block)] = words
            for reg in block.registers:
                offset = reg.address - block.address
                if offset + reg.words <= len(words):
                    data.values[reg.key] = decode_register(reg, words, offset)
        self._decode(data)
        return data

    # -- decoding --------------------------------------------------------

    def _decode(self, data: FuturaData) -> None:
        self._decode_flags(data)
        self._decode_presence(data)
        self._decode_derived(data)

    @staticmethod
    def _decode_flags(data: FuturaData) -> None:
        for key, table, prefix in (
            ("mode_bits", MODE_BITS, "mode_"),
            ("error_bits", ERROR_BITS, "error_"),
            ("warning_bits", WARNING_BITS, "warning_"),
            ("config_bits", CONFIG_BITS, "config_"),
            ("digital_inputs", DIGITAL_INPUT_BITS, "input_"),
        ):
            value = data.values.get(key)
            if value is not None:
                data.flags.update(bits_to_flags(int(value), table, prefix))

        data.flags["any_error"] = bool(data.values.get("error_bits") or 0)
        data.flags["any_warning"] = bool(data.values.get("warning_bits") or 0)

    @staticmethod
    def _decode_presence(data: FuturaData) -> None:
        """Work out which peripherals exist and which features are available.

        A set bit maps to slot ``bit + 1``; the slots are not densely packed, so
        a unit with five sensors can occupy slots 2 to 6 and leave slot 1 empty.
        """
        def slots(mask: int | None, count: int, prefix: str) -> None:
            if mask is None:
                return
            for slot in range(1, count + 1):
                if int(mask) >> (slot - 1) & 1:
                    data.present.add(f"{prefix}_{slot}")

        slots(data.values.get("connected_wall_ui"), 3, "wall_ui_present")
        slots(data.values.get("connected_wall_sensors"), 8, "wall_sensor_present")
        slots(data.values.get("connected_alfa"), 8, "alfa_present")
        slots(data.values.get("connected_buttons"), 16, "button_present")

        for family in EXTERNAL_SLOTS:
            for slot in range(1, 9):
                if data.values.get(f"{family}_{slot}_present"):
                    data.present.add(f"{family}_present_{slot}")

        if data.flags.get("config_bypass"):
            data.present.add("has_bypass")
        if data.flags.get("config_internal_heating") or data.flags.get(
            "config_coolbreeze_heating"
        ):
            data.present.add("has_heating")
        if data.flags.get("config_coolbreeze_cooling"):
            data.present.add("has_cooling")

        supply = data.values.get("connected_valve_supply")
        exhaust = data.values.get("connected_valve_exhaust")
        if supply is not None:
            data.topology["supply"] = decode_valve_topology(int(supply), exhaust=False)
        if exhaust is not None:
            data.topology["exhaust"] = decode_valve_topology(int(exhaust), exhaust=True)

    @staticmethod
    def _decode_derived(data: FuturaData) -> None:  # noqa: C901
        values = data.values

        # The external NTC reports -99 C when nothing is plugged in. The `is not
        # None` has to come first: the comparison would raise on a missing reading.
        if (
            values.get("temp_outdoor_ntc") is not None
            and round(values["temp_outdoor_ntc"] * 10) == NTC_DISCONNECTED_RAW
        ):
            values["temp_outdoor_ntc"] = None

        # Whatever feeds an external sensor marks the values it has no reading
        # for, and the register then holds a meaningless number -- usually 0.
        for slot in range(1, 9):
            invalid = int(values.get(f"ext_sensor_{slot}_invalid") or 0)
            for bit, flag in EXT_SENSOR_INVALID_BITS.items():
                if invalid >> bit & 1:
                    values[f"ext_sensor_{slot}_{flag.removesuffix('_invalid')}"] = None

        power = values.get("power_consumption")
        recovered = values.get("heat_recovered")
        if power and recovered is not None:
            values["performance_factor"] = round(recovered / power, 2)
        elif recovered is not None:
            values["performance_factor"] = None

        # The app's headline indoor figures are the mean across the connected
        # room sensors, not the extract-air duct probe. Only present slots may be
        # counted: an unpopulated slot reads 0 and would drag the mean down, and
        # the ALFA's optional NTC probe reads 0 when nothing is wired to it.
        def peripheral_readings(metric: str) -> list[float]:
            found: list[float] = []
            for family, slots in PERIPHERAL_FAMILIES:
                for slot in range(1, slots + 1):
                    if f"{family}_present_{slot}" not in data.present:
                        continue
                    value = values.get(f"{family}_{slot}_{metric}")
                    if isinstance(value, (int, float)):
                        found.append(float(value))
            return found

        for metric, key in (("temperature", "temp_mean_indoor"),
                            ("humidity", "humidity_mean_indoor")):
            readings = peripheral_readings(metric)
            values[key] = (
                round(sum(readings) / len(readings), 1) if readings else None
            )

        co2_readings = peripheral_readings("co2")
        if co2_readings:
            worst = max(co2_readings)
            values["co2_max"] = worst
            values["air_quality"] = (
                "good" if worst < 800 else "moderate" if worst < 1200 else "poor"
            )

        ventilation = values.get("ventilation")
        if ventilation is not None:
            values["ventilation_text"] = (
                "off" if ventilation == 0
                else "auto" if ventilation == 6
                else str(ventilation)
            )

        variant = values.get("variant")
        if variant is not None:
            values["model"] = "Futura M" if variant == 2 else "Futura L"

        for key in ("away_begin", "away_end"):
            raw = values.get(key)
            if raw is None:
                continue
            values[f"{key}_set"] = bool(raw)
            # The unit stores local wall-clock seconds, so the offset has to come
            # back off before this is a real instant. 0 means "not set".
            if not raw:
                values[f"{key}_at"] = None
                continue
            naive = dt.datetime.fromtimestamp(int(raw), dt.UTC).replace(tzinfo=None)
            values[f"{key}_at"] = naive.replace(
                tzinfo=ha_dt.DEFAULT_TIME_ZONE
            )

    def _check_firmware(self, data: FuturaData) -> None:
        raw = data.raw.get("input:0")
        if not raw or len(raw) < 10:
            return
        version = firmware_tuple(raw[8:10])
        if version < MIN_FIRMWARE and not getattr(self, "_warned_firmware", False):
            self._warned_firmware = True
            _LOGGER.warning(
                "Futura firmware FUA.P.%02d.%02d is older than FUA.P.%02d.%02d; "
                "parts of the register map may be missing",
                version[0], version[1], MIN_FIRMWARE[0], MIN_FIRMWARE[1],
            )

    # -- writing ---------------------------------------------------------

    def _patch_cache(self, address: int, words: list[int]) -> None:
        """Fold a completed write into the cached block it belongs to.

        `_build()` decodes from the cache and nothing else, so a write that is
        not folded in here survives only until the next rebuild. For a fast-tier
        register that is invisible: the refresh the write triggers re-reads its
        block, so the cache carries the new value anyway. A slow-tier register
        has no such luck — the triggered refresh reads only the fast blocks, the
        stale slow block is re-decoded alongside them, and the setting snaps back
        to its old value until the slow tier next comes round, up to a minute
        later. That is what "switching to temperature switches back to CO2" was:
        the unit had accepted the write the whole time.
        """
        for block in self._blocks:
            if block.table is not Table.HOLDING:
                continue
            cached = self._cache.get(self._cache_key(block))
            if cached is None:
                continue
            offset = address - block.address
            if offset >= 0 and offset + len(words) <= len(cached):
                cached[offset : offset + len(words)] = words

    async def async_write(self, key: str, value: float) -> None:
        """Write a register by key, scaling and encoding as its type requires."""
        reg = BY_KEY[key]
        if not reg.writable or reg.table is not Table.HOLDING:
            raise ValueError(f"{key} is not writable")

        if reg.kind is Kind.U32:
            words = encode_u32(int(value))
            await self.client.write_multiple(reg.address, words)
        else:
            raw = int(round(value / reg.scale)) if reg.scale != 1.0 else int(value)
            words = [raw & 0xFFFF]
            await self.client.write_single(reg.address, words[0])

        # Reflect the change immediately rather than waiting for the next poll.
        self._patch_cache(reg.address, words)
        self.async_set_updated_data(self._build())
        await self.async_request_refresh()

    async def async_write_raw(self, table: str, address: int, value: int) -> None:
        """Escape hatch for registers the map does not model."""
        if table != Table.HOLDING.value:
            raise ValueError("only holding registers are writable")
        await self.client.write_single(address, value)
        self._patch_cache(address, [value & 0xFFFF])
        self.async_set_updated_data(self._build())
        await self.async_request_refresh()

    async def async_stop_all_functions(self) -> None:
        """Clear boost, circulation, overpressure, night and party at once."""
        zeros = [0, 0, 0, 0, 0]
        await self.client.write_multiple(1, zeros)
        self._patch_cache(1, zeros)
        self.async_set_updated_data(self._build())
        await self.async_request_refresh()
