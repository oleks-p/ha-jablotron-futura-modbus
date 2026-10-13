/**
 * The unit as the service view draws it: arrows in, arrows out, fans, filter.
 *
 * A third view of the same state, and the most technical of them. Where the flow
 * card shows movement and the unit card shows which duct is which, this one is
 * the commissioning picture: what each duct carries, which way it flows, how hard
 * each fan is working, and how clogged the filter is.
 *
 * Casing and flange geometry come from unit-shell, so all three cards draw the
 * same unit at the same proportions.
 *
 * Three things on the reference this deliberately leaves out, because the unit
 * does not publish them over Modbus: absolute humidity in g/m3 beside each duct,
 * volumetric flow and static pressure per fan, and the filter's service date. An
 * invented number in a commissioning view is worse than a missing one.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, svg, type TemplateResult } from 'lit';
import { type Hass, DEFAULT_PREFIX, cssVal, errorRow, num, sharedStyles } from './shared';
import * as t from './tokens';
import { type Shell, casing, collars, cubicLength, evenPitch, makeShell } from './unit-shell';

export interface SchematicCardConfig {
  type: string;
  prefix?: string;
  title?: string;
}


const W = 900;
/**
 * Labels, then arrows, then the unit.
 *
 * The two label rows take about 46 viewBox units at 12px, so the arrows start
 * just below them and finish on the collars' shoulders.
 */
const LABEL_Y = 14;
const ARROW = { top: 84, bottom: 162 };
const SHELL: Shell = makeShell(196);
const H = SHELL.body.y + SHELL.body.h + 18;

/**
 * Square marks, as the reference draws them, rather than the app's round dots.
 *
 * Sized off the casing, like every other dimension here: the reference's squares
 * are about 2.7% of its casing width, and sit roughly one and a bit of their own
 * width apart. Squares rather than dots means a butt linecap and a dash as long
 * as the stroke is wide -- a round cap with a zero-length dash is what draws the
 * unit card's circles.
 */
const MARK = Math.round(SHELL.body.w * 0.027);
const MARK_PITCH = Math.round(MARK * 2.2);

interface Duct {
  flange: 'A' | 'B' | 'C' | 'D';
  temp: string;
  humidity: string;
  colour: string;
  collar: number;
  /** Which way the air moves through this flange. */
  into: boolean;
}

const DUCTS: Duct[] = [
  {
    flange: 'A', temp: 'outside_air_temperature',
    humidity: 'outside_air_humidity', colour: t.DUCT.outside,
    collar: 0, into: true,
  },
  {
    flange: 'B', temp: 'exhaust_air_temperature',
    humidity: 'exhaust_air_humidity', colour: t.DUCT.waste,
    collar: 1, into: false,
  },
  {
    flange: 'C', temp: 'supply_air_temperature',
    humidity: 'supply_air_humidity', colour: t.DUCT.fresh,
    collar: 2, into: false,
  },
  {
    flange: 'D', temp: 'extract_air_temperature',
    humidity: 'extract_air_humidity', colour: t.DUCT.inside,
    collar: 3, into: true,
  },
];

interface Point { x: number; y: number }
interface Cubic { c1: Point; c2: Point; end: Point }
/** A run of cubics from one point -- a straight line is just a degenerate one. */
interface Leg { start: Point; segments: Cubic[] }

/** A straight segment, as a cubic, so one code path measures and emits everything. */
function line(from: Point, to: Point): Cubic {
  const at = (f: number) => ({
    x: from.x + (to.x - from.x) * f,
    y: from.y + (to.y - from.y) * f,
  });
  return { c1: at(1 / 3), c2: at(2 / 3), end: to };
}

function legPath(leg: Leg): string {
  return `M ${leg.start.x} ${leg.start.y}`
    + leg.segments
      .map((s) => ` C ${s.c1.x} ${s.c1.y}, ${s.c2.x} ${s.c2.y}, ${s.end.x} ${s.end.y}`)
      .join('');
}

function legLength(leg: Leg): number {
  let from = leg.start;
  let total = 0;
  for (const s of leg.segments) {
    total += cubicLength(from.x, from.y, s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.end.x, s.end.y);
    from = s.end;
  }
  return total;
}

export class FuturaSchematicCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: SchematicCardConfig = { type: 'custom:futura-schematic-card' };

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      ha-card {
        background: ${cssVal(t.GROUND)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${cssVal(t.RADIUS.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${cssVal(t.INK)};
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
        /*
         * Named rather than inherited. The SVG text here is the only type on the
         * card that is not an HTML pill, and an inherit that resolves to
         * nothing lands on the UA serif.
         */
        font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
      }

      .stage {
        position: relative;
        /* So the labels can size against the drawing rather than the viewport. */
        container-type: inline-size;
      }

      /*
       * The duct readings, in the readout pill's type but without the pill: the
       * reference sets these as bare text over the background, and a pill per
       * duct would crowd four of them across the top.
       *
       * 12px matches the pills on the other cards, but it cannot be a flat 12px:
       * these four sit over the flanges, which are 15.2% of the width apart, while
       * the label needs about 5.2em -- so below roughly 410px the neighbours
       * collide and the rightmost runs off the card. 2.9cqw is the width at which
       * a label exactly fills its flange's share, so the min() holds 12px wherever
       * there is room and scales the whole block down in proportion where there is
       * not. Everything inside is in em so it scales as one piece.
       */
      .reading {
        position: absolute;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 0.1em;
        font-size: min(12px, 2.9cqw);
        font-weight: 500;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.92);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        pointer-events: none;
      }

      .reading .row {
        display: flex;
        align-items: center;
        gap: 0.4em;
      }

      .reading ha-icon {
        --mdc-icon-size: 1.08em;
        opacity: 0.75;
        flex: none;
      }
    `,
  ];

  setConfig(config: SchematicCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    this.config = { ...config };
  }

  getCardSize(): number {
    return 7;
  }

  static getStubConfig(): SchematicCardConfig {
    return { type: 'custom:futura-schematic-card' };
  }

  private get entityPrefix(): string {
    return this.config.prefix ?? DEFAULT_PREFIX;
  }

  private reading(suffix: string): number | undefined {
    return num(this.hass, `${this.entityPrefix}_${suffix}`);
  }

  private static decimal(value: number | undefined, digits = 1): string {
    return value === undefined ? '--' : value.toFixed(digits).replace('.', ',');
  }

  /** Temperature and humidity above each flange. */
  private label(duct: Duct): TemplateResult {
    const cx = SHELL.collarX[duct.collar];
    return html`
      <div
        class="reading"
        style=${`left:${(cx / W) * 100}%; top:${(LABEL_Y / H) * 100}%`}
      >
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${duct.colour}`}></ha-icon>
          ${FuturaSchematicCard.decimal(this.reading(duct.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${FuturaSchematicCard.decimal(this.reading(duct.humidity), 0)} %
        </span>
      </div>
    `;
  }

  /** A thick block arrow, pointing into or out of the unit. */
  private static arrow(duct: Duct): TemplateResult {
    const cx = SHELL.collarX[duct.collar];
    // Proportioned off the reference: a stem about a third of the head's span.
    const stem = Math.round(SHELL.body.w * 0.019);
    const head = Math.round(SHELL.body.w * 0.047);
    const { top, bottom } = ARROW;
    // Into the unit points down, out of it points up.
    const tipY = duct.into ? bottom : top;
    const tailY = duct.into ? top : bottom;
    const shoulder = duct.into ? tipY - head : tipY + head;
    const d = `M ${cx - stem} ${tailY}`
      + ` L ${cx - stem} ${shoulder}`
      + ` L ${cx - head} ${shoulder}`
      + ` L ${cx} ${tipY}`
      + ` L ${cx + head} ${shoulder}`
      + ` L ${cx + stem} ${shoulder}`
      + ` L ${cx + stem} ${tailY} Z`;
    return svg`<path d=${d} fill=${duct.colour} />`;
  }

  /** The house mark, which the reference puts beside the two indoor ducts. */
  private static house(): TemplateResult {
    const cx = (SHELL.collarX[2] + SHELL.collarX[3]) / 2;
    const cy = ARROW.bottom - 26;
    const s = 26;
    return svg`
      <path d=${`M ${cx - s} ${cy} L ${cx} ${cy - s * 0.8} L ${cx + s} ${cy}`
        + ` M ${cx - s * 0.72} ${cy - 3} L ${cx - s * 0.72} ${cy + s * 0.62}`
        + ` L ${cx + s * 0.72} ${cy + s * 0.62} L ${cx + s * 0.72} ${cy - 3}`}
            fill="none" stroke=${t.DRAW.dim} stroke-width="3.4"
            stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  /**
   * The filter, as a panel on the hatch.
   *
   * The reference shows two panels, one per filter, each with its own percentage
   * and service date. The unit publishes a single combined wear figure over
   * Modbus and no date at all, so this is one panel carrying the one reading --
   * two panels showing the same number would imply two measurements.
   */
  private filter(): TemplateResult {
    const { x, y, w } = SHELL.body;
    const pw = Math.round(w * 0.4);
    const px = x + (w - pw) / 2;
    const py = y + 24;
    const ph = SHELL.lidH - 48;
    const wear = this.reading('filter_clogging');
    return svg`
      <rect x=${px} y=${py} width=${pw} height=${ph} rx="10"
            fill=${t.DRAW.panel} stroke=${t.DRAW.panelEdge} stroke-width=${t.OUTLINE_W} />
      <text x=${px + pw / 2} y=${py + ph * 0.44} text-anchor="middle"
            font-size="23" font-weight="700" fill=${t.DRAW.ink}>
        ${wear === undefined ? '--' : Math.round(wear)} %
      </text>
      <text x=${px + pw / 2} y=${py + ph * 0.82} text-anchor="middle"
            font-size="16" fill=${t.DRAW.dim}>Filter</text>
    `;
  }

  /**
   * The two air streams, each entering on one colour and leaving on another.
   *
   * Outdoor air comes in at A, crosses, and leaves as supply at C; extract comes
   * in at D and leaves as waste at B. So each stream is drawn in two halves that
   * meet on the floor of the casing, taking the colour of the flange at their own
   * end -- which is what makes the two cross, since A and C sit left of centre
   * and D and B straddle it the other way.
   */
  private static streams(): TemplateResult {
    const { x, y, w, h } = SHELL.body;
    const top = y + SHELL.lidH + 18;
    const floor = y + Math.round(h * 0.93);
    const centre = x + w / 2;

    /*
     * One path per stream, flange to flange: down the wall, along the floor, then
     * a long diagonal rising to the flange on the far side. Outdoor air enters at
     * A and leaves as supply at C; extract enters at D and leaves as waste at B --
     * so each run has to cross the casing, and the two diagonals cross each other
     * on the way. That crossing is the exchanger.
     *
     * Four separate legs converging on a shared point was the wrong model, and no
     * amount of tuning the control points fixed it: each stream stopped in the
     * middle of the casing instead of reaching the flange its air actually leaves
     * by, so the drawing showed two streams meeting rather than two streams
     * passing through each other.
     */
    const CORNER = Math.round(w * 0.055);
    const TURN = Math.round(w * 0.2);

    const stream = (from: number, to: number): Leg => {
      const fx = SHELL.collarX[from];
      const tx = SHELL.collarX[to];
      const s = Math.sign(tx - fx);
      const turn = fx + s * TURN;
      // 0.5523 is the circle constant: a cubic with its controls that far along
      // the tangents is a quarter circle to within a thousandth of the radius.
      const k = 0.5523 * CORNER;
      return {
        start: { x: fx, y: top },
        segments: [
          line({ x: fx, y: top }, { x: fx, y: floor - CORNER }),
          {
            c1: { x: fx, y: floor - CORNER + k },
            c2: { x: fx + s * (CORNER - k), y: floor },
            end: { x: fx + s * CORNER, y: floor },
          },
          line({ x: fx + s * CORNER, y: floor }, { x: turn, y: floor }),
          /*
           * The rise leaves the floor horizontally and arrives at the flange
           * vertically, so the diagonal is the middle of it. These two fractions
           * are what set where the exchanger ends up: the runs are mirror images
           * about the casing's centre line, so they meet at t = 0.5, and 0.22 out
           * along the floor against 0.40 down from the flange puts that at 71% of
           * the casing's height -- which is where the reference crosses.
           */
          {
            // No `s` here: (tx - turn) already carries the direction, and
            // multiplying by it again sent the extract run's control point back up
            // the floor the way it came.
            c1: { x: turn + (tx - turn) * 0.22, y: floor },
            c2: { x: tx, y: top + (floor - top) * 0.4 },
            end: { x: tx, y: top },
          },
        ],
      };
    };

    /*
     * A gradient per stream, from the flow card's ribbons, so a run reads as air
     * changing on its way through: outdoor green becoming supply blue, extract red
     * becoming waste gold.
     *
     * It spans a narrow band about the exchanger rather than the whole run. Laid
     * out flange to flange the blend is linear across the casing, so the outdoor
     * run is already half blue by the time it has crossed the floor -- changing
     * colour on its way to the exchanger instead of at it. Bounding the band and
     * letting the ends clamp keeps each wall and floor run its own colour and puts
     * the whole change where the heat actually moves.
     */
    const band = Math.round(w * 0.11);
    const gradient = (id: string, first: number, second: number, stops: readonly string[]) => svg`
      <linearGradient id=${id} gradientUnits="userSpaceOnUse"
                      x1=${first} y1="0" x2=${second} y2="0">
        ${stops.map((colour, i) => svg`
          <stop offset=${`${(i / (stops.length - 1)) * 100}%`} stop-color=${colour} />
        `)}
      </linearGradient>
    `;

    const runs = [
      { leg: stream(0, 2), stream: 'supply' },   // A -> C
      { leg: stream(3, 1), stream: 'extract' },  // D -> B
    ];

    return svg`
      <defs>
        <!-- outdoor air enters left of the exchanger, supply leaves to its right -->
        ${gradient('futura-stream-supply', centre - band, centre + band, t.RIBBON_SUPPLY)}
        <!-- extract enters right of it, waste leaves to its left -->
        ${gradient('futura-stream-extract', centre + band, centre - band, t.RIBBON_EXTRACT)}
      </defs>
      <g fill="none" stroke-width=${MARK} stroke-linecap="butt" opacity="0.82">
        ${runs.map(({ leg, stream: id }) => {
          const pitch = Number(evenPitch(legLength(leg), MARK_PITCH, MARK));
          return svg`
            <path d=${legPath(leg)} stroke=${`url(#futura-stream-${id})`}
                  stroke-dasharray=${`${MARK} ${pitch - MARK}`} />
          `;
        })}
      </g>
    `;
  }

  /**
   * Fan output and speed.
   *
   * Three short lines rather than the reference's two long ones: without flow and
   * pressure there is less to say, and a wide line here runs straight into the
   * dotted columns either side. This sits in the gap between the outer run and
   * the inner one, which is where the reference puts it too.
   */
  private fans(): TemplateResult {
    const { y, h } = SHELL.body;
    // Low in the casing, as the reference has them: its two lines sit at about
    // 77% and 82% of the casing's height, so a three-line block centred on the
    // same place starts at 73%. Lower than this and the bottom line runs into the
    // floor sweep; higher and it sits in the middle of the empty panel.
    const base = y + Math.round(h * 0.735);
    const block = (
      cx: number, anchor: 'start' | 'end', label: string,
      pct: number | undefined, rpm: number | undefined,
    ) => svg`
      <text x=${cx} y=${base} text-anchor=${anchor} font-size="17" fill=${t.DRAW.fainter}>
        ${label}
      </text>
      <text x=${cx} y=${base + 27} text-anchor=${anchor}
            font-size="24" font-weight="700" fill=${t.DRAW.ink}>
        ${pct === undefined ? '--' : Math.round(pct)} %
      </text>
      <text x=${cx} y=${base + 51} text-anchor=${anchor} font-size="18" fill=${t.DRAW.dim}>
        ${rpm === undefined ? '--' : Math.round(rpm)} rpm
      </text>
    `;
    return svg`
      ${block(SHELL.collarX[0] + 34, 'start', 'Supply',
              this.reading('supply_fan_output'), this.reading('supply_fan_speed'))}
      ${block(SHELL.collarX[3] - 34, 'end', 'Exhaust',
              this.reading('exhaust_fan_output'), this.reading('exhaust_fan_speed'))}
    `;
  }

  override render(): TemplateResult {
    if (!this.hass) return html`<ha-card></ha-card>`;
    const probe = `${this.entityPrefix}_outside_air_temperature`;
    if (!this.hass.states[probe]) {
      return html`<ha-card>${errorRow(`Entity ${probe} not found.`)}</ha-card>`;
    }

    return html`
      <ha-card>
        ${this.config.title
          ? html`<div class="title">${this.config.title}</div>`
          : nothing}
        <div class="stage">
          <svg viewBox="0 0 ${W} ${H}" role="img"
               aria-label="Ventilation unit: duct readings, fans and filter">
            ${DUCTS.map((duct) => FuturaSchematicCard.arrow(duct))}
            ${FuturaSchematicCard.house()}
            ${collars(SHELL)}
            ${casing(SHELL, t.OUTLINE_W)}
            ${FuturaSchematicCard.streams()}
            ${this.filter()}
            ${this.fans()}
          </svg>
          ${DUCTS.map((duct) => this.label(duct))}
        </div>
      </ha-card>
    `;
  }
}
