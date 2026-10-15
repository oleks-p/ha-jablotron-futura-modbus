"""The simulator must behave like the capture says the unit behaves.

Driven from `registers_observed.json` rather than from a list written here, so
the simulator cannot drift from the thing it stands in for: a block the probe
recorded as answered must be answered, and one it recorded as refused must be
refused, whatever is added to the capture later.
"""
from __future__ import annotations

import json
import pathlib
import socket
import struct
import threading
import time

import pytest

from tools.sim_futura import Server, Unit

CAPTURE = json.loads(
    (pathlib.Path(__file__).resolve().parent.parent / "registers_observed.json")
    .read_text()
)

READ_HOLDING, READ_INPUT = 3, 4


def _span(text: str) -> tuple[int, int]:
    start, _, end = text.partition("..")
    return int(start), int(end) - int(start) + 1


@pytest.fixture
def served(socket_enabled):
    """A simulator on an ephemeral port, serving the reference capture.

    `socket_enabled` because the Home Assistant test harness blocks real
    sockets by default, and the point of this simulator is that the bytes go
    over a real one - a stand-in that short-circuits the socket would not
    exercise framing, eviction or silence.
    """
    server = Server(("127.0.0.1", 0), Unit.from_capture(CAPTURE))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield server
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)


def ask(sock, function: int, address: int, count: int, *, txn: int = 1,
        timeout: float = 2.0):
    """One request, with the whole response drained.

    Draining matters: a reader that takes only the 7-byte header leaves the
    payload in the buffer, and the NEXT call reads those leftovers as a header
    and reports a reply that never arrived. That mistake made a broken
    eviction look like a working one.
    """
    pdu = struct.pack(">BHH", function, address, count)
    sock.sendall(struct.pack(">HHHB", txn, 0, len(pdu) + 1, 1) + pdu)
    sock.settimeout(timeout)
    try:
        head = b""
        while len(head) < 7:
            chunk = sock.recv(7 - len(head))
            if not chunk:
                return None
            head += chunk
    except TimeoutError:
        return None
    _txn, _proto, length, _unit = struct.unpack(">HHHB", head)
    body = b""
    while len(body) < length - 1:
        chunk = sock.recv(length - 1 - len(body))
        if not chunk:
            return None
        body += chunk
    if body[0] & 0x80:
        return ("EXCEPTION", body[1])
    return ("OK", list(struct.unpack(f">{body[1] // 2}H", body[2:2 + body[1]])))


def connect(server):
    return socket.create_connection(server.server_address, timeout=5)


@pytest.mark.parametrize("table,function", [("input_blocks", READ_INPUT),
                                            ("holding_blocks", READ_HOLDING)])
def test_every_captured_block_is_served_word_for_word(served, table, function):
    with connect(served) as sock:
        for span, block in CAPTURE[table].items():
            if block.get("words") is None:
                continue
            address, count = _span(span)
            got = ask(sock, function, address, count)
            assert got is not None, f"{table} {span}: no reply"
            assert got[0] == "OK", f"{table} {span}: {got}"
            assert got[1] == [w & 0xFFFF for w in block["words"]], span


def test_a_read_that_spans_a_gap_is_refused_like_the_unit_refuses_it(served):
    """The map has holes, and a read crossing one fails WHOLE.

    The probe recorded each of these with the reason. A simulator that padded
    the hole instead would let a wrong block size pass here and come apart
    against the real unit, which is the one thing a stand-in must not do.
    """
    checked = 0
    with connect(served) as sock:
        for key, record in CAPTURE["negative_blocks"].items():
            if not record.get("expected_failure"):
                continue
            kind, _, span = key.partition(":")
            address, count = _span(span)
            function = READ_INPUT if kind == "input" else READ_HOLDING
            got = ask(sock, function, address, count)
            assert got == ("EXCEPTION", 2), f"{key} ({record.get('why')}): {got}"
            checked += 1
    assert checked, "the capture recorded no expected failures to check"


def test_an_unfitted_optional_range_is_refused(served):
    """Addresses that only answer when the peripheral exists."""
    with connect(served) as sock:
        for key, record in CAPTURE["optional_ranges"].items():
            if record.get("words") is not None:
                continue
            kind, _, span = key.partition(":")
            address, count = _span(span)
            function = READ_INPUT if kind == "input" else READ_HOLDING
            assert ask(sock, function, address, count) == ("EXCEPTION", 2), key


def test_a_second_client_takes_the_socket_and_the_first_goes_quiet(served):
    """The unit has ONE socket, and a second client does not queue for it.

    Months of "the integration goes unavailable at random" was this, with an
    i3 bridge as the other client. The evicted side keeps an OPEN socket that
    is simply never answered again - which is why it presents as a timeout
    rather than as a disconnection, and why a simulator that refused the
    second connection instead would reproduce the wrong symptom entirely.
    """
    first = connect(served)
    assert ask(first, READ_INPUT, 0, 4, txn=1) is not None

    second = connect(served)
    assert ask(second, READ_INPUT, 0, 4, txn=2) is not None, "the newcomer must win"
    assert ask(first, READ_INPUT, 0, 4, txn=3) is None, "the first must go quiet"

    second.close()
    time.sleep(0.2)
    third = connect(served)
    assert ask(third, READ_INPUT, 0, 4, txn=4) is not None
    assert ask(first, READ_INPUT, 0, 4, txn=5) is None, "eviction is not undone"
    first.close()
    third.close()


def test_a_request_can_be_left_unanswered_on_demand(socket_enabled):
    """`--drop-every` makes the silence reproducible.

    A request the unit does not answer is what the reconnect path exists for,
    and it cannot be provoked on real hardware at a chosen moment.
    """
    server = Server(("127.0.0.1", 0), Unit.from_capture(CAPTURE), drop_every=2)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with connect(server) as sock:
            assert ask(sock, READ_INPUT, 0, 4, txn=1) is not None
            assert ask(sock, READ_INPUT, 0, 4, txn=2) is None, "every 2nd is dropped"
            assert ask(sock, READ_INPUT, 0, 4, txn=3) is not None
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def test_a_write_is_echoed_and_read_back(served):
    """FC6 echoes the request and the new value stands."""
    with connect(served) as sock:
        address = next(iter(sorted(Unit.from_capture(CAPTURE).holding)))
        before = ask(sock, READ_HOLDING, address, 1, txn=1)
        assert before[0] == "OK"
        new = (before[1][0] + 1) & 0xFFFF
        pdu = struct.pack(">BHH", 6, address, new)
        sock.sendall(struct.pack(">HHHB", 9, 0, len(pdu) + 1, 1) + pdu)
        sock.settimeout(2)
        echo = sock.recv(12)
        assert echo[-4:] == struct.pack(">HH", address, new)
        assert ask(sock, READ_HOLDING, address, 1, txn=2) == ("OK", [new])


async def test_the_integration_sets_up_against_the_simulator(hass, served,
                                                             socket_enabled):
    """A clean install, end to end, over a real socket.

    Every other test here patches `AsyncModbusTcpClient` with an in-process
    fake, so none of them exercise framing, the real pymodbus stack, or the
    register blocks the integration actually asks for. This one does: the
    config entry points at the simulator, nothing is patched, and the entities
    have to come up with the captured values.

    This is the question that previously needed the real unit - and therefore
    needed evicting a household's ventilation from its own controller to ask.
    """
    from homeassistant.const import CONF_HOST, CONF_PORT
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    from custom_components.jablotron_futura_modbus.const import CONF_UNIT_ID, DOMAIN

    host, port = served.server_address
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Futura (simulated)",
        data={CONF_HOST: host, CONF_PORT: port, CONF_UNIT_ID: 1},
        options={},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id), (
        "the integration did not set up against the simulator"
    )
    await hass.async_block_till_done()

    entities = [s for s in hass.states.async_all()
                if s.entity_id.split(".")[1].startswith("futura")
                or "futura" in s.entity_id]
    assert entities, "no entities were created"

    # A value that can only have come off the wire. Looked up BY ADDRESS, not
    # by an index into a block: input 30 is the outside-air duct sensor, in
    # tenths of a degree, and counting words into "0..21" to find it is how
    # this assertion was wrong the first time.
    expected = Unit.from_capture(CAPTURE).input[30] / 10
    outside = [s for s in entities
               if s.entity_id.endswith("_outside_air_temperature")]
    assert outside, f"no outside air temperature among {len(entities)} entities"
    assert float(outside[0].state) == pytest.approx(expected, abs=0.05)

    assert served.unit.reads > 0, "the integration never read anything"
