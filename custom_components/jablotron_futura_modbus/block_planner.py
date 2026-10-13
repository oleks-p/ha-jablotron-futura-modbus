"""Group registers into Modbus read requests the Futura will actually accept.

Two device rules constrain every block, and violating either returns
ILLEGAL_DATA_ADDRESS rather than partial data:

1. A block may not span an undefined address. Input 22-29, 39, 53-59, 76-79 and
   holding 19 are gaps, so ``input 14..44`` and ``holding 0..23`` both fail.
2. A block may not begin or end in the middle of a composite value. Scanning
   accepted read counts at input 0 yields exactly
   ``[1, 3, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22]`` -- the boundary set of the
   declared u16/u32/mac layout. Because a shorter read can fail where a longer
   one succeeds, block sizing must never be binary-searched.

Since blocks are assembled from whole ``Reg`` entries and only ever extended at
register boundaries, rule 2 holds by construction.
"""

from __future__ import annotations

from dataclasses import dataclass

from .registers import REGISTERS, Reg, Table, Tier

#: Modbus caps a single read at 125 registers; stay a little under it.
MAX_BLOCK_REGISTERS = 120

#: How urgently each tier needs re-reading. A block inherits the most urgent
#: tier among its registers, so a slow-changing bus address that happens to sit
#: next to a live CO2 reading is simply carried along in the same request.
_URGENCY: dict[Tier, int] = {Tier.FAST: 0, Tier.SLOW: 1, Tier.ONCE: 2}


@dataclass(frozen=True, slots=True)
class Block:
    """One Modbus read request covering a contiguous run of registers."""

    table: Table
    address: int
    count: int
    tier: Tier
    registers: tuple[Reg, ...]

    @property
    def end(self) -> int:
        return self.address + self.count - 1

    def gate_keys(self) -> frozenset[str]:
        """Presence flags this block depends on, with *any*-of semantics.

        Empty when some register in the block is unconditional, because then the
        block must always be read. Otherwise the block is worth reading as soon
        as at least one of its gates is satisfied -- a single request covering
        eight peripheral slots is issued if any one of them is connected.
        """
        gates = set()
        for reg in self.registers:
            if reg.available_if is None:
                return frozenset()
            gates.add(reg.available_if)
        return frozenset(gates)

    def __str__(self) -> str:
        return f"{self.table}[{self.address}..{self.end}] ({self.count}w, {self.tier})"


def plan_blocks(
    registers: tuple[Reg, ...] = REGISTERS,
    *,
    max_registers: int = MAX_BLOCK_REGISTERS,
) -> tuple[Block, ...]:
    """Build the minimal set of accepted read requests for `registers`.

    Registers are grouped by table and tier, then split wherever the address
    run breaks. Mixing tiers inside one request would force slow-changing
    configuration to be re-read at the fast interval, so tiers stay separate.
    """
    blocks: list[Block] = []

    for table in (Table.INPUT, Table.HOLDING):
        group = sorted(
            (r for r in registers if r.table is table), key=lambda r: r.address
        )
        blocks.extend(_split_run(group, table, max_registers))

    return tuple(blocks)


def _split_run(group: list[Reg], table: Table, max_registers: int) -> list[Block]:
    """Cut a sorted register list into contiguous, size-capped blocks."""
    blocks: list[Block] = []
    current: list[Reg] = []

    def flush() -> None:
        if not current:
            return
        start = current[0].address
        count = current[-1].end - start + 1
        tier = min((r.tier for r in current), key=lambda t: _URGENCY[t])
        blocks.append(Block(table, start, count, tier, tuple(current)))
        current.clear()

    for reg in group:
        if not current:
            current.append(reg)
            continue

        previous = current[-1]
        contiguous = reg.address == previous.end + 1
        would_span = reg.end - current[0].address + 1

        if not contiguous or would_span > max_registers:
            flush()
        current.append(reg)

    flush()
    return blocks


def describe(blocks: tuple[Block, ...]) -> str:
    """Human-readable plan, used by diagnostics and the probe."""
    lines = []
    for tier in (Tier.FAST, Tier.SLOW, Tier.ONCE):
        subset = [b for b in blocks if b.tier is tier]
        if not subset:
            continue
        words = sum(b.count for b in subset)
        lines.append(f"{tier}: {len(subset)} requests, {words} registers")
        for block in subset:
            gates = block.gate_keys()
            suffix = f"  [needs {', '.join(sorted(gates))}]" if gates else ""
            lines.append(f"    {block}{suffix}")
    return "\n".join(lines)
