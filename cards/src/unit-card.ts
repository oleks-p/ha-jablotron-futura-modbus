/**
 * The unit as a schematic: four ducts, four readings.
 *
 * A second view of the same state the flow card shows, after the Jablotron app's
 * "Device information / Ventilation" screen. The flow card is about *movement* --
 * ribbons crossing an exchanger, animated by air flow. This is about *plumbing*:
 * which duct is which and what each one carries right now.
 *
 * Everything is drawn from the installation manual's numbers. The casing is
 * 835 x 995 x 522 mm with four EPP flanges of 150 mm, and Annex 11 chains the
 * flange row as 133 + 3 x 243 + 73 = 935 across a top face inset 30 mm each side
 * of the 995 width -- so the centres land 163, 406, 649 and 892 mm from the left
 * edge, and the last sits 103 mm from the right. The chain is asymmetric because
 * the flanges are: 73 + 30 is exactly that 103.
 *
 * Only the body width is picked in SVG units. The height, the duct bore and all
 * four centres scale from the millimetres, so the drawing cannot drift out of
 * proportion: it renders at aspect 1.191 against the real 1.192.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, svg, type TemplateResult } from 'lit';
import { type Hass, DEFAULT_PREFIX, cssVal, errorRow, num, sharedStyles } from './shared';
import { text, type StringKey } from './i18n';
import * as t from './tokens';
import { evenPitch, hatchSeam, makeShell } from './unit-shell';

export interface UnitCardConfig {
  type: string;
  prefix?: string;
  title?: string;
}


/* ── geometry, derived from the unit's real dimensions ────────────────────── */

const W = 900;
const H = 1140;

/**
 * The visible window into the drawing.
 *
 * Moving the pills down toward the unit -- they sat too far above it, with an
 * over-long run between -- would otherwise leave the same gap as empty space at
 * the top, so the viewBox starts below it and the card gets shorter instead.
 */
const VIEW = { y: 110, h: H - 110 };

/**
 * The casing, its flange centres and its collars, from the shared shell.
 *
 * This card had its own copy of all of it -- the millimetres, the scale factor,
 * the collar width derived from the pitch, the flange chain -- written before
 * unit-shell existed and identical to it value for value. Two copies of a
 * measurement is one that can drift.
 */
const SHELL = makeShell(650, 560, 170);
const BODY = SHELL.body;
const COLLAR_X = SHELL.collarX;

/**
 * The runs, dotted, measured off the app's screen.
 *
 * Its dots are 3.61% of the casing's width with centres 1.95 diameters apart, so
 * both are expressed against the body rather than in absolute units and stay
 * right whatever the casing width becomes.
 *
 * The body is the reference to measure against, not the screenshot. Sizing these
 * from the dot's share of the *image* width made them nearly twice too big: that
 * screenshot is a phone screen and most of its width is margin, so the same dot
 * is a much smaller fraction of it than of the drawing.
 *
 * A zero-length dash with a round cap is a dot, so `0 gap` spaces them along any
 * path. The gap IS the pitch -- dot centres land that far apart -- so it has to
 * exceed the diameter or consecutive dots overlap into a beaded tube.
 */
const DOT_D = Math.round(BODY.w * 0.0361);
const DOT_GAP = Math.round(DOT_D * 1.95);

/**
 * The status LED, measured off a photograph of the unit.
 *
 * A thin bright strip down the centre of the lower panel: 1.6% of the casing
 * width, from 48% to 97% of its height. Its colour is DRAW.led, sampled off
 * the same photograph -- named there so this comment cannot drift from it.
 */
const LED = {
  x: BODY.x + Math.round(BODY.w * 0.501),
  top: BODY.y + Math.round(BODY.h * 0.481),
  bottom: BODY.y + Math.round(BODY.h * 0.967),
  w: Math.max(4, Math.round(BODY.w * 0.016)),
  colour: t.DRAW.led,
};

/**
 * The wordmarks, also measured off the photograph rather than guessed.
 *
 * JABLOTRON sits high on the lower panel, at 35% of the casing height, its cap
 * height 2.7% of that -- much smaller and much higher than the earlier guess,
 * which had it near the bottom at half again the size. FUTURA is bottom right.
 */
const MARK = {
  // The photo puts this at 35% of the casing height, which is where the
  // exchanger arcs run; 42% clears them and still sits high on the panel.
  jablotronY: BODY.y + Math.round(BODY.h * 0.42),
  jablotronSize: Math.round(BODY.h * 0.0267 / 0.72),
  futuraY: BODY.y + Math.round(BODY.h * 0.9),
  futuraSize: Math.round(BODY.h * 0.024 / 0.72),
};

/**
 * How far into its pill a run starts.
 *
 * The pills are HTML, so their height depends on font metrics this code cannot
 * measure. Starting each run above the pill's bottom edge and letting the opaque
 * pill cover it avoids needing to know that height: the duct emerges from under
 * the pill wherever the pill happens to end.
 */
const RUN_START_INSET = 20;

interface Duct {
  /** Flange letter from the installation manual. */
  flange: 'A' | 'B' | 'C' | 'D';
  /** Looked up at render time, so the pill follows the frontend's language. */
  label: StringKey;
  temp: string;
  humidity: string;
  colour: string;
  /** Which flange it lands on. */
  collar: number;
  /** Which row its pill sits in. Each pill is centred on its own flange. */
  row: 0 | 1;
}

/**
 * The same colours the flow card gives each reading, so the two cards agree.
 *
 * An earlier version sampled the app's device screen instead, which uses one
 * blue for both outdoor-facing ducts. Two cards on one dashboard colouring the
 * same reading differently is worse than either palette being slightly off.
 */
const DUCTS: Duct[] = [
  {
    flange: 'A', label: 'ductOutside',
    temp: 'outside_air_temperature', humidity: 'outside_air_humidity',
    colour: t.DUCT.outside, collar: 0, row: 0,
  },
  {
    flange: 'B', label: 'ductWaste',
    temp: 'exhaust_air_temperature', humidity: 'exhaust_air_humidity',
    colour: t.DUCT.waste, collar: 1, row: 1,
  },
  {
    flange: 'C', label: 'ductFresh',
    temp: 'supply_air_temperature', humidity: 'supply_air_humidity',
    colour: t.DUCT.fresh, collar: 2, row: 0,
  },
  {
    flange: 'D', label: 'ductInside',
    temp: 'extract_air_temperature', humidity: 'extract_air_humidity',
    colour: t.DUCT.inside, collar: 3, row: 1,
  },
];

/**
 * Pill row tops. Every run is straight, so a pill sits over its own flange.
 *
 * The rows are closer together than the gap they leave above the casing, and
 * deliberately: pushed further down, the lower row's run shrank to two dots and
 * stopped reading as a duct at all.
 */
const ROW_Y = [150, 330];

export class FuturaUnitCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: UnitCardConfig = { type: 'custom:futura-unit-card' };

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
        font-family: inherit;
      }

      /* The drawing and the pills share one box, so a pill can be placed by
         percentage and stay put: the SVG's viewBox fixes the aspect, so the
         box's height always tracks its width. */
      .stage {
        position: relative;
      }

      /*
       * HTML rather than SVG: 13px radius, a 1px hairline at 20% white,
       * 12px/500 text at 92%, a 13px icon. As HTML these are the same size on
       * screen as the other cards' pills, whatever width the card is given.
       *
       * The ground is opaque: over a duct, a translucent pill let the run
       * behind the label show through.
       */
      .pill {
        position: absolute;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 10px 7px;
        border-radius: 13px;
        background: rgb(12, 14, 18);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.92);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        pointer-events: none;
      }

      .pill .name {
        color: rgba(255, 255, 255, 0.6);
      }

      .pill .row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .pill ha-icon {
        --mdc-icon-size: 13px;
        opacity: 0.75;
        flex: none;
      }
    `,
  ];

  setConfig(config: UnitCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    this.config = { ...config };
  }

  getCardSize(): number {
    return 8;
  }

  static getStubConfig(): UnitCardConfig {
    return { type: 'custom:futura-unit-card' };
  }

  /**
   * Not `prefix`: Element already has one, and a private member of that name
   * makes the class incompatible with CustomElementConstructor -- the same trap
   * a private `title` getter set in the history card.
   */
  private get entityPrefix(): string {
    return this.config.prefix ?? DEFAULT_PREFIX;
  }

  private reading(suffix: string): number | undefined {
    return num(this.hass, `${this.entityPrefix}_${suffix}`);
  }

  /** The app writes decimals with a comma, and so does the flow card. */
  private static decimal(value: number | undefined, digits = 1): string {
    return value === undefined ? '--' : value.toFixed(digits).replace('.', ',');
  }

  /** One reading pill, centred over the duct that leaves it. */
  private ductPill(duct: Duct): TemplateResult {
    const cx = COLLAR_X[duct.collar];
    return html`
      <div
        class="pill"
        style=${`left:${(cx / W) * 100}%;`
          + `top:${((ROW_Y[duct.row] - VIEW.y) / VIEW.h) * 100}%`}
      >
        <span class="name">${text(this.hass, duct.label)}</span>
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${duct.colour}`}></ha-icon>
          ${FuturaUnitCard.decimal(this.reading(duct.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${FuturaUnitCard.decimal(this.reading(duct.humidity), 0)} %
        </span>
      </div>
    `;
  }

  /**
   * Pill down to its flange: straight, at full bore.
   *
   * Every run is straight. The waste pill used to sit out to the left and dogleg
   * across to its flange, crossing the outdoor run on the way; moving it over its
   * own flange removed both the dogleg and the crossing.
   */
  private static duct(duct: Duct): TemplateResult {
    const cx = COLLAR_X[duct.collar];
    const startY = ROW_Y[duct.row] + RUN_START_INSET;
    const end = BODY.y + 10;
    return svg`
      <path d=${`M ${cx} ${startY} L ${cx} ${end}`}
            fill="none" stroke=${duct.colour} stroke-width=${DOT_D}
            stroke-linecap="round"
            stroke-dasharray=${`0 ${evenPitch(end - startY, DOT_GAP)}`} />
    `;
  }

  /**
   * The exchanger, as two semicircles inside the casing.
   *
   * A to C is the intake stream and D to B the exhaust stream -- the manual's
   * flange letters -- so the two cross, which is what a counterflow exchanger
   * does and what the app draws.
   *
   * Each is a true semicircle: radius exactly half the chord between its two
   * flanges, drawn with an `A` command whose rx and ry are equal, so it cannot
   * come out elliptical however the geometry is later retuned. Cubic beziers
   * were tried first and read as flattened ovals.
   *
   * Two flags matter and both bit once. `large-arc` must stay 0, or the arc takes
   * the long way round the same circle; and sweep 1 is clockwise, which from a
   * left point to a right one passes *over* the chord, arcing up out of the
   * casing entirely. Downwards is counter-clockwise rightwards.
   */
  private static interior(): TemplateResult {
    const top = BODY.y + DOT_D / 2;
    const arc = (from: number, to: number) => {
      const r = Math.abs(COLLAR_X[to] - COLLAR_X[from]) / 2;
      const sweep = COLLAR_X[to] > COLLAR_X[from] ? 0 : 1;
      return `M ${COLLAR_X[from]} ${top}`
        + ` A ${r} ${r} 0 0 ${sweep} ${COLLAR_X[to]} ${top}`;
    };
    // A semicircle is pi*r long, which is what sets the pitch that reaches the
    // flange each arc finishes on.
    const pitch = (from: number, to: number) => evenPitch(
      Math.PI * Math.abs(COLLAR_X[to] - COLLAR_X[from]) / 2,
      DOT_GAP,
    );
    return svg`
      <g stroke-width=${DOT_D} fill="none" opacity="0.34" stroke-linecap="round">
        <path d=${arc(0, 2)} stroke=${DUCTS[0].colour}
              stroke-dasharray=${`0 ${pitch(0, 2)}`} />
        <path d=${arc(3, 1)} stroke=${DUCTS[3].colour}
              stroke-dasharray=${`0 ${pitch(3, 1)}`} />
      </g>
    `;
  }

  override render(): TemplateResult {
    if (!this.hass) return html`<ha-card></ha-card>`;
    const probe = `${this.entityPrefix}_outside_air_temperature`;
    if (!this.hass.states[probe]) {
      return html`<ha-card>
        ${errorRow(text(this.hass, 'entityMissing', { entity: probe }))}
      </ha-card>`;
    }

    return html`
      <ha-card>
        ${this.config.title
          ? html`<div class="title">${this.config.title}</div>`
          : nothing}
        <div class="stage">
          <svg viewBox="0 ${VIEW.y} ${W} ${VIEW.h}" role="img"
               aria-label=${text(this.hass, 'ariaUnit')}>
            <!-- collars first, then the runs over them: the dots land on the
                 collar as they do on the app's screen. The casing comes after
                 both and hides whatever crosses its edge. -->
            ${COLLAR_X.map((cx) => svg`
              <rect x=${cx - SHELL.collarW / 2} y=${BODY.y - SHELL.collarH}
                    width=${SHELL.collarW} height=${SHELL.collarH * 2} rx="8"
                    fill=${t.DRAW.collar} />
            `)}
            ${DUCTS.map((duct) => FuturaUnitCard.duct(duct))}

            <rect x=${BODY.x} y=${BODY.y} width=${BODY.w} height=${BODY.h}
                  rx=${BODY.r} fill=${t.DRAW.casing} />
            <!-- the filter hatch, a fifth of the way down the casing -->
            ${hatchSeam(BODY, BODY.y + BODY.h * 0.2, t.OUTLINE_W)}
            ${FuturaUnitCard.interior()}
            <text x=${BODY.x + BODY.w / 2} y=${MARK.jablotronY}
                  text-anchor="middle" font-size=${MARK.jablotronSize}
                  font-weight="700" letter-spacing="1.6"
                  fill=${t.DRAW.wordmark}>JABLOTRON</text>
            <text x=${BODY.x + BODY.w - 28} y=${MARK.futuraY}
                  text-anchor="end" font-size=${MARK.futuraSize}
                  letter-spacing="1.4" fill=${t.DRAW.wordmarkDim}>FUTURA</text>
            <!-- the status LED down the centre of the lower panel -->
            <rect x=${LED.x - LED.w / 2} y=${LED.top} width=${LED.w}
                  height=${LED.bottom - LED.top} rx=${LED.w / 2}
                  fill=${LED.colour} />
          </svg>
          ${DUCTS.map((duct) => this.ductPill(duct))}
        </div>
      </ha-card>
    `;
  }
}
