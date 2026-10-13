# Jablotron Futura — Home Assistant integration (Modbus TCP)

Local control and full monitoring of a **Jablotron Futura** heat-recovery
ventilation unit over Modbus TCP. No cloud account, no polling of Jablotron's
servers — the integration talks straight to the unit on your own network.

Covers the complete documented register map (`FU_DOC_TCP_CS40.pdf`, map v4.00),
and ships a set of Lovelace cards, one of which reproduces the mobile app's layout.

## What you get

- **Every documented register** — 278 declared values across the input and
  holding tables: duct temperatures and humidity, power, recovered heat, airflow,
  fan output and speed, filter wear, all peripheral CO₂/temperature/humidity
  sensors, and the full status/error/warning/capability bitfields.
- **Full control** — ventilation level, temperature and humidity targets, the
  five timed functions, the away period, schedule, radon protection, bypass,
  heating, cooling, comfort control and the zone-ventilation settings.
- **A `fan` and a `climate` entity**, so the unit works with standard HA
  dashboards, voice assistants and automations.
- **Eight custom cards**, served by the integration itself — one HACS install,
  no separate frontend repository and no manual resource registration.
- **Only what your unit has.** Peripherals are discovered from the presence
  bitfields, so a unit with five wall sensors gets five sets of entities, not
  twenty-four placeholders.
- **External sensors and buttons** — the eight sensor and eight button slots
  another system can write into the unit (holding 300–375 and 400–473). All
  sixteen are read on every slow poll. A slot in use gets its own entities, and
  diagnostic counts show how many slots of each kind are in use, alongside the
  boost buttons wired to the unit's bus.

### External sensors and buttons

These are not devices on the unit's bus. They are slots that a third party — a
building controller, or Home Assistant itself — fills in, and the unit then uses
them like its own: an external sensor's readings feed the automatic mode, and an
external button starts a boost or the kitchen-hood function. Each slot declares
itself in use in its first register.

| Slot in use | Entities |
| --- | --- |
| External sensor *n* | Temperature, humidity, CO₂ and floor temperature sensors. A value the feeding system marks invalid shows as unknown, not as the 0 the register holds. The readings count towards the indoor averages and the highest-CO₂ figure, like any other room sensor |
| External button *n* | Mode (boost or kitchen hood), timer (0–10800 s), and an active switch. The unit limits activation to three hours |

`sensor.…_external_sensors` and `sensor.…_external_buttons` show how many slots
are in use, and which. `sensor.…_boost_buttons` does the same for the boost
buttons wired to the bus, which the map reports only by presence.

To feed a slot from Home Assistant, call `set_external_sensor` — it marks the
slot in use and its entities appear immediately. A slot can also be claimed by
hand through its *present* switch, which is disabled by default.

## Install

### HACS

1. HACS → three-dot menu → **Custom repositories**.
2. Add this repository with category **Integration**.
3. Install **Jablotron Futura (Modbus TCP)**, then restart Home Assistant.
4. **Settings → Devices & services → Add integration → Jablotron Futura**.
5. Enter the unit's IP address. Leave the name as offered, the port at `502` and
   the unit ID at `1`.

### Manual

Copy `custom_components/jablotron_futura_modbus` into your `config/custom_components`
directory and restart Home Assistant.

## Dashboard

Copy [`dashboards/futura.yaml`](dashboards/futura.yaml) into a new dashboard via
**Edit dashboard → Raw configuration editor**. It uses only the bundled cards and
built-in cards.

The cards are also available in the "Add card" picker:

| Card | What it shows |
| --- | --- |
| `custom:futura-schematics-card` | A picker, not a drawing: shows any one of the four views below. Set `variant` to fix it, or point `variant_entity` at an `input_select` to switch it from the dashboard without editing anything — see `dashboards/futura_helpers.yaml`. The only card here with a GUI editor. Every other option is passed through to the chosen card, so its own options keep working |
| `custom:futura-flow-card` | A close reproduction of the mobile app's air-quality screen: duct columns with the four readings, metallic collars, flow arrows, two glowing ribbons crossing through the exchanger, the air-quality and recovered-power panel, and the filter bar. The leaf/fan toggle switches to the ventilation controls. Flow animation speed tracks measured airflow. |
| `custom:futura-unit-card` | The same state as a plumbing schematic: the casing drawn from the installation manual's dimensions with its four flanges in the manual's A–D order, a full-bore duct per flange coloured as the flow card colours that reading, a pill of temperature and humidity over each one, and the exchanger as two crossing semicircles inside the casing |
| `custom:futura-schematic-card` | The service view of the same unit: an arrow per flange showing which way that duct flows, temperature and humidity above each, filter wear on the hatch, both fan outputs and speeds, and the two air streams as square-dotted runs that cross where the exchanger hands one stream to the other. Shares its casing and flange geometry with the unit card. Absolute humidity, volumetric flow, static pressure and the filter service date appear in the app's version of this screen but not here — the unit does not publish them over Modbus |
| `custom:futura-diagram-card` | The same unit as a line drawing — thin lines, no fills, no gradients, a near-white for everything that contains air and each duct's own flat colour for what carries it. Combines the manual's front elevation (outline, collars, hatch) with its process diagram (a run per flange, the bypass damper, both fans and the cross-flow exchanger), and is the only view that shows the bypass. Draws the same casing at the same size as the unit and service schematics |
| `custom:futura-control-card` | Ventilation level 0–5/A, temperature stepper, timed-function chips with live countdowns, and a vacancy chip with a date/time dialog |
| `custom:futura-sensor-grid-card` | Peripheral tiles for `co2`, `temperature` or `humidity` |
| `custom:futura-history-card` | A trend chart of `co2`, `temperature` or `humidity` across every connected peripheral, from 5-minute statistics by default. `period: hour` smooths harder; `raw: true` plots state history instead |

Every card finds its entities from a `prefix:` (default `sensor.jablotron_futura`),
so a renamed device only needs that one option changed.

`futura-flow-card` copies the app's dark palette on purpose, so it looks the same
wherever it is placed. Set `theme_aware: true` to have it follow the active Home
Assistant theme instead, and `show_toggle`, `show_legend` or `show_filter` to
`false` to trim it down.

## Multiple units

Add each unit through **Add integration** in turn. Each one is its own device
with its own Modbus connection, so the single-socket limit below is per unit.

The name asked for at setup becomes the start of every entity ID. The first unit
is offered `Jablotron Futura`, the next `Jablotron Futura 2`, and so on, giving
`sensor.jablotron_futura_…` and `sensor.jablotron_futura_2_…`. Any name works
as long as it is unique; setup refuses one that another unit already uses,
because Home Assistant would otherwise put `_2` on the *end* of each colliding
ID, where no prefix can find it.

- **Cards** — set `prefix: sensor.jablotron_futura_2` (or whatever the unit is
  called) on each card. The cards only ever match entities directly after their
  prefix, so the first unit's cards do not pick up the second unit's sensors.
- **Dashboard** — copy `dashboards/futura.yaml` and replace `jablotron_futura`
  with the unit's prefix throughout. Both copies share the
  `input_select.futura_schematic` helper unless you give the second its own.
- **Services** — pass `device_id` to pick the unit. With one unit configured it
  can be left out. The control card passes it itself.

## Services

Every service takes an optional `device_id`, needed only when more than one unit
is configured.

| Service | Purpose |
| --- | --- |
| `set_away` / `clear_away` | Set or clear the holiday period. Stored on the unit as local wall-clock time. |
| `set_function` | Start boost, circulation, overpressure, night or party for a given number of seconds. |
| `set_external_sensor` | Push a Home Assistant reading into one of the unit's eight external sensor slots, so its automatic mode can use your own sensors. |
| `unlock_service` | Attempt to unlock the service register range. Consumer firmware normally refuses. |
| `write_register` | Escape hatch for holding registers this integration does not model. |

## Options

**Settings → Devices & services → Jablotron Futura → Configure**

- **Poll interval** (default 15 s) and **configuration poll interval** (default 60 s).
- **Sensor temperature offsets** — off by default. The offsets are strided across
  the register map, so enabling them adds Modbus requests to every slow poll.

## How it talks to the unit

The Futura's Modbus server has three quirks that shape the whole design. All three
were confirmed against real hardware (firmware FUA.P.07.20), and each has a
regression test.

**One socket, unit ID 1 only.** The unit accepts a single TCP connection, so every
read and write is serialised behind one lock. Addressing any unit ID other than 1
on a live socket makes it *drop the connection*, so the unit ID is pinned. If
something else on your network polls the unit, the two will fight over the socket.

**Composite values are atomic.** A read that starts or ends inside a `uint32` is
rejected with `ILLEGAL_DATA_ADDRESS`, as is any read spanning an undefined address.
Scanning which read lengths the unit accepts at input 0 returns
`1, 3, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22` — exactly the boundaries of the
declared layout. So block sizing can never be binary-searched, and the planner only
ever cuts at register boundaries.

**The cards register as a Lovelace resource, not an extra JS module.** This is
worth knowing if you fork the card code. `frontend.add_extra_js_url` injects the
module into the document head, where it runs *before* the frontend finishes
booting — and Home Assistant then installs a scoped custom-element registry that
replaces `window.customElements`, silently discarding everything registered up to
that point. The module loads, logs its banner, and defines nothing: the cards
vanish from the dashboard with no error in the console and no error in the log.
Lovelace resources are fetched after the frontend is up, which is why
HACS-installed cards do not hit this. The integration adds the resource itself on
setup (with a `?v=` query so browsers pick up new builds).

**The card bundle does not use decorators.** esbuild's minifier tree-shakes the
`__decorateClass` calls that Lit's `@customElement` and `@property` compile to,
which unregisters every element and strips reactivity while leaving a bundle that
loads without complaint. The cards use `static properties` and an explicit
`customElements.define` instead, so minification cannot break them.

**Three different encodings in one register block.** `uint32` puts the **low** word
first; the MAC array swaps the two bytes **inside** each register; and the firmware
version is not a `uint32` at all, but major/minor packed as two bytes of the low
register. Getting the first one backwards — as every earlier community integration
did — silently shifts every status bit by 16 places.

On a unit with one ALFA controller and five wall sensors, a full live poll is six
Modbus requests. The external slots add sixteen requests to each slow poll, once
a minute by default: they are strided too, and every slot has to be read to learn
whether it is in use.

## Design tokens

Every colour, radius and stroke weight the cards use is decided once, in
[`cards/src/tokens.ts`](cards/src/tokens.ts), so every card draws from one palette.

Three rules the table encodes:

- **Status, duct and decorative colours are separate groups.** `RUNNING` (a fan
  is turning) is not `OK` (a reading is in band), and neither is a duct colour.
  One green previously served as both the active-control accent and the
  room-temperature duct, which made a switched-on control and that duct the same
  colour.
- **`NO_DATA` is grey and `FAULT` is red.** An absent reading is not a fault.
- **Stroke weights are viewBox units here**, and the flow card renders a 923-wide
  viewBox at roughly 500 px. `OUTLINE_W` is derived so the rendered outline lands
  on 1.4 px. Comparing raw stroke numbers between viewBoxes is meaningless —
  measure the page.

Surfaces have one source of truth each, by role: card backgrounds follow the HA
theme (`var(--ha-card-background, …)`) so a custom theme works, while the flow
diagram pins fixed tokens because it has to match its own artwork.

### The duct colours are an exception, on purpose

`DUCT` is not a temperature scale. Those four values are the Jablotron mobile
app's own colour language for *which duct*, sampled from a reference screenshot rather than
eyeballed — the app fills each arrow with a gradient, so each token is the
brightest saturated pixel in its arrow. Verified by sampling the rendered card
back: all four match to the digit.

## Known limitations

- **VarioBreeze damper positions are not available over Modbus TCP.** The valves
  are real Modbus slaves on the unit's internal RS-485 bus (unit IDs 64–119, with
  position in holding register 102), but the Futura does not bridge them: every
  peripheral unit ID times out over TCP while unit ID 1 keeps answering. The
  integration does expose the *topology* — how many valves, in which zones, and
  each one's RS-485 unit ID — as attributes on the valve-count sensors, so an
  external bus sniffer can be lined up with the right zone. See
  [`juzis28/futura-bus-sniffer-esphome`](https://github.com/juzis28/futura-bus-sniffer-esphome)
  for a passive ESP32 sniffer, or
  [`danielkucera/gofutura`](https://github.com/danielkucera/gofutura) for an active
  RS-485 gateway that can also command the dampers.
- **jablonet.net is not an alternative.** The service view that shows valve
  positions needs a service-organisation account; an owner account is told device
  detail is available only in the MyJABLOTRON app.
- **The away (vacancy) period can be read and written, but not armed.** Holding
  6-9 accepts a begin/end pair and reports it back exactly, and a period set from
  the mobile app reads correctly and shows as active. What the unit will not do is
  *enter* the away state because of a Modbus write: `fut_mode` bit 4 stays clear
  even with the clock inside the period. Verified with the begin in the past, with
  the begin in the future and the clock left to cross it, as two FC16 writes and
  as one across all four registers. Re-writing an app-set period from here keeps
  it armed, so the encoding, the registers and the bit are all correct.

  The leading suspicion is the unit's clock. The app writes timestamps in the
  unit's own time base; we write them in Home Assistant's, and the map exposes no
  clock register to compare against — only the RTC battery voltage. So the card's
  vacancy chip is dependable for *reading* the period and useless for starting
  one; set vacancy in the app.
- **CoolBreeze activity is invisible over Modbus.** The optional CoolBreeze
  enthalpy heating/cooling module is a heat pump on its own electrical supply
  ("230 V / 50 Hz with separate 16 A fuse", per the system design guide), drawing
  460 W cooling and 660 W heating. None of that reaches the unit's own registers.
  What the map carries about it is presence (input 69), the `fut_config`
  capability bits, two error bits, and the enable switch (holding 16) — no output,
  no running state. Which sets what the heating and cooling entities can mean:

  | Entity | Source | Observable? |
  |---|---|---|
  | `sensor.…_post_heater_power` (input 43) | the unit's built-in electric post-heater, rated 0–350 W continuously regulated | yes |
  | `switch.…_additional_cooling` (holding 16) | CoolBreeze only — the sole cooling capability in the map | no, separate circuit |
  | `switch.…_additional_heating` (holding 15) | the post-heater and/or CoolBreeze heating; one switch, and a unit can have both (`fut_config` bits 0 and 2) | only the post-heater's share |

  Two consequences worth knowing. `sensor.…_power_consumption` (input 41) is fans
  plus post-heater and nothing else, so its ceiling is the design guide's "maximum
  input incl. electrical post-heater" — 580 W on a Futura M, 670 W on an L. And
  the climate entity reports `hvac_action` only where the unit gives grounds for
  it: `off` when the fans are stopped, `heating` while the post-heater draws
  power, and **no action at all** otherwise. A unit heating via CoolBreeze
  therefore reports nothing, and `cooling` is never reported under any
  circumstances, because nothing observable distinguishes it. Inferring it from an
  open bypass was tried and produced "Cooling" on a unit with cooling switched
  off — the bypass is free-cooling *ventilation*, and has its own binary_sensor.

  Reporting no action is also what keeps the thermostat dial legible. Home
  Assistant labels the dial's centre with the action when there is one and falls
  back to the mode name otherwise, so a permanent `fan` printed "Fan" under the
  dial even in `cool` mode, contradicting both the ring colour and the mode
  picker. With no action, the label follows the mode.

  A useful field check, and a falsifiable one: `post_heater_power` should never
  exceed 350 W. If it does, the reading above is wrong. In winter, heating enabled
  with supply air warming while that sensor stays at 0 means CoolBreeze is doing
  the work.
- **Registers at 900 and above stay locked** on consumer firmware. Roughly 30% of
  the parameters a service technician sees reach Modbus TCP.
- **Whether the unit acts on external slots written over Modbus TCP is not yet
  confirmed.** The registers read back and accept writes, but community reports
  say the unit ignored them. The entities show what each slot holds either way.
- Requires firmware **FUA.P.05.00** or newer; the integration warns if the unit
  reports less.

## Development

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements_test.txt
.venv/bin/pytest -q

npm --prefix cards install
npm --prefix cards run typecheck
npm --prefix cards run build             # rebuilds the committed bundle

docker compose up                        # a throwaway HA at :8123
```

### Probing your own unit

`tools/probe_futura.py` has no dependencies and reads the unit directly. It is the
fastest way to produce a useful bug report:

```bash
python3 tools/probe_futura.py --host 192.0.2.10
python3 tools/probe_futura.py --host 192.0.2.10 --explore 320   # hunt for undocumented registers
python3 tools/probe_futura.py --host 192.0.2.10 --scan-bus-units # check RS-485 bridging
python3 tools/probe_futura.py --host 192.0.2.10 --verify-writes  # reversible write tests
```

Reads are safe. `--verify-writes` snapshots and restores every register it
touches, but the fans will audibly ramp up during the boost-timer test.
The resulting `registers_observed.json` is what `tests/fixtures/` is built from.

## Credits

Built on prior community work:
[`tomas-kulhanek/ha-jablotron-futura`](https://github.com/tomas-kulhanek/ha-jablotron-futura)
for the original Modbus integration;
[`materko`](https://github.com/materko/ha-jablotron-futura) for identifying the
`uint32` word order and the wall-sensor blocks;
[`xkuba`](https://github.com/xkuba/ha-jablotron-futura-kulhanek) for the wall CO₂
sensor addressing; [`danielkucera/gofutura`](https://github.com/danielkucera/gofutura)
and [`juzis28/futura-bus-sniffer-esphome`](https://github.com/juzis28/futura-bus-sniffer-esphome)
for mapping the internal RS-485 bus; and the
[homeassistant-cz.cz thread](https://www.homeassistant-cz.cz/viewtopic.php?t=538)
for the original register findings.

Not affiliated with or endorsed by Jablotron.

## License

MIT — see [LICENSE](LICENSE).
