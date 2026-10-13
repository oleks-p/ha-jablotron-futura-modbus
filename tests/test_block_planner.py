"""Every block the planner emits must be one the device would accept."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from custom_components.jablotron_futura_modbus.block_planner import (
    MAX_BLOCK_REGISTERS,
    plan_blocks,
)
from custom_components.jablotron_futura_modbus.registers import (
    REGISTERS,
    Table,
    Tier,
)

FIXTURE = Path(__file__).parent / "fixtures" / "futura_l_fw0720.json"


@pytest.fixture(scope="module")
def blocks():
    return plan_blocks()


class TestBlockIntegrity:
    def test_no_block_splits_a_composite(self, blocks):
        """A read starting or ending mid-uint32 is rejected by the unit."""
        composites = {
            (reg.table, reg.address, reg.words)
            for reg in REGISTERS
            if reg.words > 1
        }
        for block in blocks:
            for table, start, words in composites:
                if table is not block.table:
                    continue
                assert not start < block.address < start + words, (
                    f"{block} starts inside the composite at {table}[{start}]"
                )
                assert not start < block.address + block.count < start + words, (
                    f"{block} ends inside the composite at {table}[{start}]"
                )

    def test_every_address_in_a_block_is_declared(self, blocks):
        """No block may span a gap, so every address it covers must exist."""
        declared = {Table.INPUT: set(), Table.HOLDING: set()}
        for reg in REGISTERS:
            for address in range(reg.address, reg.address + reg.words):
                declared[reg.table].add(address)

        for block in blocks:
            for address in range(block.address, block.end + 1):
                assert address in declared[block.table], (
                    f"{block} covers undeclared {block.table}[{address}]"
                )

    def test_blocks_never_overlap_within_a_table(self, blocks):
        for table in (Table.INPUT, Table.HOLDING):
            spans = sorted(
                (b.address, b.end) for b in blocks if b.table is table
            )
            for (_, prev_end), (next_start, _) in zip(spans, spans[1:], strict=False):
                assert next_start > prev_end

    def test_every_register_is_covered_exactly_once(self, blocks):
        seen: list[str] = []
        for block in blocks:
            seen.extend(reg.key for reg in block.registers)
        assert len(seen) == len(set(seen))
        assert set(seen) == {reg.key for reg in REGISTERS}

    def test_blocks_respect_the_size_cap(self, blocks):
        for block in blocks:
            assert 1 <= block.count <= MAX_BLOCK_REGISTERS


class TestObservedBehaviour:
    """Cross-check the plan against what the real unit actually did."""

    @pytest.fixture(scope="class")
    def observed(self):
        return json.loads(FIXTURE.read_text())

    def test_known_bad_reads_are_never_planned(self, blocks, observed):
        """holding 0..23, input 14..44 and a 10-wide ALFA read all fail."""
        forbidden = {
            (Table.HOLDING, 0, 24),
            (Table.INPUT, 14, 31),
            (Table.INPUT, 160, 10),
        }
        planned = {(b.table, b.address, b.count) for b in blocks}
        assert not (planned & forbidden)

    def test_the_negative_controls_really_did_fail(self, observed):
        for entry in observed["negative_blocks"].values():
            assert entry["status"] != "OK", (
                "a read expected to fail succeeded; the register map assumptions "
                "behind the block planner need revisiting"
            )

    def test_accepted_counts_match_the_composite_layout(self, observed):
        """The unit accepts exactly the counts that land on a boundary."""
        accepted = observed["accepted_counts"]["input@0"]
        boundaries = []
        cursor = 0
        for reg in sorted(
            (r for r in REGISTERS if r.table is Table.INPUT and r.address < 22),
            key=lambda r: r.address,
        ):
            cursor = reg.address + reg.words
            boundaries.append(cursor)
        assert accepted == boundaries

    def test_planned_input_blocks_sit_inside_probed_territory(
        self, blocks, observed
    ):
        """Each planned input block must lie within addresses the unit served.

        The probe records candidate spans, and the planner is free to merge
        adjacent ones -- 100..114 and 115..154 become a single 55-register read,
        which the unit also accepts. So the check is containment, not equality.
        """
        served: set[int] = set()
        for key, entry in observed["input_blocks"].items():
            if entry["status"] != "OK":
                continue
            start = int(key.split("..")[0])
            served.update(range(start, start + len(entry["words"])))

        for block in blocks:
            if block.table is not Table.INPUT:
                continue
            covered = set(range(block.address, block.end + 1))
            # ALFA slots beyond the first were not probed on this unit.
            if not covered & served:
                continue
            missing = covered - served
            assert not missing, f"{block} reaches unprobed addresses {sorted(missing)}"


class TestTiering:
    def test_a_block_takes_the_most_urgent_tier_it_contains(self, blocks):
        for block in blocks:
            tiers = {reg.tier for reg in block.registers}
            if Tier.FAST in tiers:
                assert block.tier is Tier.FAST

    def test_live_readings_are_in_the_fast_tier(self, blocks):
        fast_keys = {
            reg.key for b in blocks if b.tier is Tier.FAST for reg in b.registers
        }
        for key in (
            "temp_indoor", "humidity_indoor", "air_flow", "filter_wear",
            "power_consumption", "ventilation", "temperature_setpoint",
        ):
            assert key in fast_keys

    def test_peripheral_readings_share_one_request(self, blocks):
        """Wall controllers and CO2 sensors are contiguous, so one read covers
        all eleven slots rather than eleven separate round trips."""
        covering = [
            b for b in blocks
            if b.table is Table.INPUT and b.address <= 100 and b.end >= 154
        ]
        assert len(covering) == 1
        assert covering[0].count == 55

    def test_opt_in_groups_can_be_excluded(self):
        lean = plan_blocks(
            tuple(
                reg for reg in REGISTERS
                if not reg.key.startswith(("ext_sensor_", "ext_button_"))
                and not reg.key.endswith("_temp_correction")
            )
        )
        addresses = {b.address for b in lean if b.table is Table.HOLDING}
        # The external sensor and button blocks live at 300-473; the service
        # registers at 900 and above are a separate group and stay.
        assert not any(300 <= address <= 473 for address in addresses)
        assert 900 in addresses
        assert len(lean) < len(plan_blocks())


class TestGating:
    def test_a_mixed_block_is_read_when_any_slot_is_present(self, blocks):
        block = next(
            b for b in blocks
            if b.table is Table.INPUT and b.address == 100 and b.end == 154
        )
        gates = block.gate_keys()
        assert "wall_sensor_present_2" in gates
        assert gates & {"wall_sensor_present_2"}

    def test_unconditional_blocks_have_no_gates(self, blocks):
        block = next(b for b in blocks if b.table is Table.INPUT and b.address == 30)
        assert block.gate_keys() == frozenset()

    def test_all_eight_wall_sensor_slots_are_addressable(self):
        """Slots are not densely packed: a five-sensor unit can use slots 2-6."""
        keys = {reg.key for reg in REGISTERS}
        for slot in range(1, 9):
            assert f"wall_sensor_{slot}_co2" in keys
        gates = {
            reg.available_if for reg in REGISTERS
            if reg.key.startswith("wall_sensor_") and reg.available_if
        }
        assert gates == {f"wall_sensor_present_{s}" for s in range(1, 9)}
