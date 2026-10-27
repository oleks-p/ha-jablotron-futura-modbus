/**
 * A faithful reproduction of the Futura app's air-quality screen.
 *
 * The whole schematic is one SVG on a fixed 923x660 viewBox, so every element
 * keeps the app's proportions at any card width: two duct columns carrying the
 * four readings, metallic collars where they meet the unit, block arrows for
 * flow direction, and two glowing ribbons crossing inside the body — each
 * shading from its source temperature colour to its destination.
 *
 * Because this is a deliberate copy of a dark mobile UI, the palette is fixed
 * rather than inherited from the active Home Assistant theme. Set
 * `theme_aware: true` to let it follow the theme's surfaces instead.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, svg, type TemplateResult } from 'lit';
import { type Hass, DEFAULT_PREFIX, cssVal, errorRow, num, sharedStyles, str } from './shared';
import { text } from './i18n';
import * as t from './tokens';

export interface FlowCardConfig {
  type: string;
  prefix?: string;
  temp_ambient?: string;
  temp_fresh?: string;
  temp_indoor?: string;
  temp_waste?: string;
  humidity_ambient?: string;
  humidity_fresh?: string;
  humidity_indoor?: string;
  humidity_waste?: string;
  air_flow?: string;
  heat_recovered?: string;
  filter_wear?: string;
  air_quality?: string;
  temp_outdoor?: string;
  show_filter?: boolean;
  show_outdoor?: boolean;
  theme_aware?: boolean;
}


const AUTO: Array<[keyof FlowCardConfig, string]> = [
  ['temp_ambient', 'outside_air_temperature'],
  ['temp_fresh', 'supply_air_temperature'],
  ['temp_indoor', 'extract_air_temperature'],
  ['temp_waste', 'exhaust_air_temperature'],
  ['humidity_ambient', 'outside_air_humidity'],
  ['humidity_fresh', 'supply_air_humidity'],
  ['humidity_indoor', 'extract_air_humidity'],
  ['humidity_waste', 'exhaust_air_humidity'],
  ['air_flow', 'air_flow'],
  ['heat_recovered', 'heat_recovered'],
  ['filter_wear', 'filter_clogging'],
  ['air_quality', 'air_quality'],
  ['temp_outdoor', 'outdoor_temperature'],
];

/* Geometry, in the SVG's own units. Taken from the app's proportions. */
const W = 923;
const H = 660;
const DUCT_W = 146;
const LEFT_X = 90;
const RIGHT_X = 252;
const LEFT_MID = LEFT_X + DUCT_W / 2;
const RIGHT_MID = RIGHT_X + DUCT_W / 2;
const BODY_TOP = 192;
const BODY_BOTTOM = 470;
const COLLAR_H = 16;
/* Arrow proportions; the ribbons are drawn to the same width as the
   arrow stem so a duct and its direction marker read as one shape. */
const ARROW_STEM = 13;
const ARROW_HEAD = 28;
const ARROW_HEAD_LEN = 36;
const RIBBON_W = ARROW_STEM * 2;

/* Vertical anchor for the outdoor block, chosen so the label and value sit
   centred in the empty band between the card top and the unit body. */
const OUTDOOR_Y = 52;

/* Both right-hand blocks share this centre line: the midpoint of the space
   between the ducts and the body's right edge. Centring them on the same axis
   is what keeps the outdoor reading and the air-quality panel visually aligned. */
const INFO_CX = 630;

/* The app's flow colours: gold out, green in, blue supplied, red extracted. */
/**
 * The four ducts, in the mobile app's own colours.
 *
 * Identity colours -- which duct -- rather than readings; the number printed
 * beside each one carries the temperature. They are the app's saturated set
 * rather than samples of the shared thermal ramp, because this card exists to
 * mirror that screen. See the note on DUCT in tokens.ts for what that costs.
 */
const WASTE = t.DUCT.waste;
const OUTSIDE = t.DUCT.outside;
const FRESH = t.DUCT.fresh;
const INSIDE = t.DUCT.inside;

interface Duct {
  label: string;
  tempKey: keyof FlowCardConfig;
  humidityKey: keyof FlowCardConfig;
  x: number;
  direction: 'up' | 'down';
  color: string;
  /** The app emphasises the incoming supply chain over the extract chain. */
  strong: boolean;
  row: 'top' | 'bottom';
}

const DUCTS: Duct[] = [
  { label: 'waste', tempKey: 'temp_waste', humidityKey: 'humidity_waste',
    x: LEFT_X, direction: 'up', color: WASTE, strong: false, row: 'top' },
  { label: 'outside', tempKey: 'temp_ambient', humidityKey: 'humidity_ambient',
    x: RIGHT_X, direction: 'down', color: OUTSIDE, strong: true, row: 'top' },
  { label: 'supply', tempKey: 'temp_fresh', humidityKey: 'humidity_fresh',
    x: LEFT_X, direction: 'down', color: FRESH, strong: true, row: 'bottom' },
  { label: 'inside', tempKey: 'temp_indoor', humidityKey: 'humidity_indoor',
    x: RIGHT_X, direction: 'up', color: INSIDE, strong: false, row: 'bottom' },
];

export class FuturaFlowCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: FlowCardConfig = { type: 'custom:futura-flow-card' };
  /**
   * Rendered width of the labels that sit beside an icon.
   *
   * SVG cannot centre an icon-plus-text pair on its own, and guessing from the
   * character count drifts with the theme's font. Measuring the real glyph run
   * and re-rendering once keeps the pair centred whatever font is in use.
   */
  private labelWidths: Record<string, number> = {};

  static override styles = [
    sharedStyles,
    css`
      :host {
        --app-bg: ${cssVal(t.GROUND)};
        --app-panel: ${cssVal(t.PANEL)};
        --app-body: ${cssVal(t.BODY)};
        --app-border: ${cssVal(t.BORDER)};
        --app-text: ${cssVal(t.INK)};
        --app-dim: ${cssVal(t.DIM)};
      }

      :host([theme-aware]) {
        --app-bg: transparent;
        --app-panel: var(--futura-panel);
        --app-body: var(--futura-panel);
        --app-border: color-mix(in srgb, var(--futura-text) 14%, transparent);
        --app-text: var(--futura-text);
        --app-dim: var(--futura-muted);
      }

      /* The host must carry the height too, or height:100% on the ha-card
         below resolves against an auto-height containing block and does
         nothing. */
      :host {
        display: block;
        height: 100%;
      }

      /* Two stacked panels with a gap, the way the app lays them out, so the
         host card itself carries no surface of its own.

         height: 100% so the card fills its grid row rather than shrinking to
         its content. Paired with margin-top:auto on the filter panel, that
         pins the filter to the bottom of the row, so it lines up with whatever
         sits beside it -- the control card, whose height moves with how many
         rows the function chips wrap into. */
      ha-card {
        background: var(--app-bg);
        border: none;
        box-shadow: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        height: 100%;
      }

      .schematic {
        background: var(--app-bg);
        border-radius: ${cssVal(t.RADIUS.canvas)};
        padding: 4px 0 0;
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
        font-family: inherit;
      }

      .filter {
        background: var(--app-panel);
        border-radius: ${cssVal(t.RADIUS.canvas)};
        padding: 20px 22px 26px;
        /* Takes up the slack, so the panel sits at the bottom of the card. */
        margin-top: auto;
      }

      .filter .head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 16px;
      }

      .filter .name {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--app-text);
      }

      .filter .pct {
        font-size: 1.05rem;
        color: var(--app-dim);
        font-variant-numeric: tabular-nums;
      }

      .bar {
        height: 12px;
        border-radius: 999px;
        background: ${cssVal(t.GREY.track)};
        overflow: hidden;
      }

      .bar > span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          ${cssVal(t.FILTER_GRADIENT[0])} 0%,
          ${cssVal(t.FILTER_GRADIENT[1])} 60%,
          ${cssVal(t.FILTER_GRADIENT[2])} 100%
        );
        transition: width 0.6s ease;
      }

      .sheen {
        animation: drift linear infinite;
      }

      @keyframes drift {
        to {
          stroke-dashoffset: -120;
        }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    // Glyph metrics change when the theme's font finishes loading, and the
    // first measurement can land before that. Dropping the cache forces one
    // re-measure so the icon-plus-label pairs settle on the centre line.
    document.fonts?.ready.then(() => {
      this.labelWidths = {};
      this.requestUpdate();
    });
  }

  protected override updated(): void {
    const measured = this.renderRoot.querySelectorAll<SVGTextElement>(
      'text[data-measure]',
    );
    let changed = false;
    measured.forEach((element) => {
      const key = element.dataset.measure;
      if (!key) return;
      const width = element.getComputedTextLength();
      if (width && Math.abs((this.labelWidths[key] ?? 0) - width) > 0.5) {
        this.labelWidths[key] = width;
        changed = true;
      }
    });
    if (changed) this.requestUpdate();
  }

  /** Left edge and text centre for an icon-plus-label pair centred on `cx`. */
  private pairLayout(key: string, iconWidth: number, gap = 12) {
    const textWidth = this.labelWidths[key] ?? 0;
    const total = iconWidth + gap + textWidth;
    const left = INFO_CX - total / 2;
    return { iconX: left, textCx: left + iconWidth + gap + textWidth / 2 };
  }

  setConfig(config: FlowCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    this.config = { show_filter: true, show_outdoor: true, ...config };
    this.toggleAttribute('theme-aware', !!this.config.theme_aware);
  }

  getCardSize(): number {
    return 7;
  }

  static getStubConfig(): FlowCardConfig {
    return { type: 'custom:futura-flow-card', prefix: DEFAULT_PREFIX };
  }

  private entity(key: keyof FlowCardConfig): string | undefined {
    const explicit = this.config[key];
    if (typeof explicit === 'string') return explicit;
    const suffix = AUTO.find(([name]) => name === key)?.[1];
    return suffix ? `${this.config.prefix ?? DEFAULT_PREFIX}_${suffix}` : undefined;
  }

  private value(key: keyof FlowCardConfig): number | undefined {
    return num(this.hass, this.entity(key));
  }

  /** The app writes decimals with a comma. */
  private static decimal(value: number | undefined, digits = 1): string {
    return value === undefined ? '--' : value.toFixed(digits).replace('.', ',');
  }

  /** A solid block arrow, drawn to the app's proportions. */
  private static arrow(cx: number, top: number, bottom: number, up: boolean): string {
    const stem = ARROW_STEM;
    const head = ARROW_HEAD;
    const headLen = ARROW_HEAD_LEN;
    if (up) {
      return `M ${cx - stem} ${bottom} L ${cx - stem} ${top + headLen} `
        + `L ${cx - head} ${top + headLen} L ${cx} ${top} `
        + `L ${cx + head} ${top + headLen} L ${cx + stem} ${top + headLen} `
        + `L ${cx + stem} ${bottom} Z`;
    }
    return `M ${cx - stem} ${top} L ${cx - stem} ${bottom - headLen} `
      + `L ${cx - head} ${bottom - headLen} L ${cx} ${bottom} `
      + `L ${cx + head} ${bottom - headLen} L ${cx + stem} ${bottom - headLen} `
      + `L ${cx + stem} ${top} Z`;
  }

  private cycle(): number {
    const flow = this.value('air_flow') ?? 0;
    if (flow <= 0) return 0;
    return Math.max(0.8, Math.min(3.5, 300 / flow));
  }

  private ductGroup(duct: Duct): TemplateResult {
    const temperature = this.value(duct.tempKey);
    const humidity = this.value(duct.humidityKey);
    const cx = duct.x + DUCT_W / 2;
    const top = duct.row === 'top';

    // Readings sit outside the body; the arrow sits between them and the collar.
    const tempY = top ? 46 : 596;
    const humidityY = top ? 88 : 638;
    const arrowTop = top ? 112 : 492;
    const arrowBottom = top ? 168 : 548;
    const panelY = top ? 0 : 484;
    const panelH = top ? BODY_TOP - 2 : H - 484;

    return svg`
      <g>
        <rect x=${duct.x} y=${panelY} width=${DUCT_W} height=${panelH}
              fill="var(--app-panel)" />
        <text x=${cx} y=${tempY} text-anchor="middle"
              font-size="40" font-weight=${duct.strong ? 600 : 400}
              fill=${duct.strong ? 'var(--app-text)' : t.GREY.mid}>
          ${FuturaFlowCard.decimal(temperature)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
        <text x=${cx} y=${humidityY} text-anchor="middle"
              font-size="27" fill="var(--app-dim)">
          ${humidity === undefined ? '--' : Math.round(humidity)} %
        </text>
        <path d=${FuturaFlowCard.arrow(cx, arrowTop, arrowBottom,
                                       duct.direction === 'up')}
              fill=${duct.color} />
      </g>
    `;
  }

  private collar(x: number, y: number): TemplateResult {
    return svg`<rect x=${x + 4} y=${y} width=${DUCT_W - 8} height=${COLLAR_H}
                     rx="5" fill="url(#metal)" />`;
  }

  private ribbons(): TemplateResult {
    const cycle = this.cycle();
    const animation = cycle
      ? `animation-duration:${cycle}s`
      : 'animation-play-state:paused';

    // Outside air enters top-right and leaves bottom-left as supply air; the
    // extract ribbon runs the other diagonal so the two visibly cross.
    // Straight runs at the collars with the bend confined to the middle third,
    // which is what gives the app's crossing its tight waist.
    const supply =
      `M ${RIGHT_MID} ${BODY_TOP - 6} L ${RIGHT_MID} 252 `
      + `C ${RIGHT_MID} 306, ${LEFT_MID} 336, ${LEFT_MID} 392 `
      + `L ${LEFT_MID} ${BODY_BOTTOM + 6}`;
    const extract =
      `M ${RIGHT_MID} ${BODY_BOTTOM + 6} L ${RIGHT_MID} 392 `
      + `C ${RIGHT_MID} 336, ${LEFT_MID} 306, ${LEFT_MID} 252 `
      + `L ${LEFT_MID} ${BODY_TOP - 6}`;

    const ribbon = (path: string, gradient: string, glow: string) => svg`
      <g>
        <path d=${path} stroke=${glow} stroke-width=${RIBBON_W + 7}
              fill="none" stroke-linecap="round" opacity="0.5"
              filter="url(#glow)" />
        <path d=${path} stroke=${`url(#${gradient})`} stroke-width=${RIBBON_W}
              fill="none" stroke-linecap="round" />
        <path class="sheen" d=${path} stroke="rgba(255,255,255,0.18)"
              stroke-width=${RIBBON_W} fill="none" stroke-linecap="butt"
              stroke-dasharray="8 40" style=${animation} />
      </g>
    `;

    return svg`
      ${ribbon(extract, 'extractGrad', WASTE)}
      ${ribbon(supply, 'supplyGrad', OUTSIDE)}
    `;
  }

  private info(): TemplateResult {
    const quality = str(this.hass, this.entity('air_quality'));
    const recovered = this.value('heat_recovered');
    const dot =
      quality === 'good' ? t.OK
      : quality === 'poor' ? t.BAD
      : quality === 'moderate' ? t.WARN
      : t.NO_DATA;
    const label = text(
      this.hass,
      quality === 'good' ? 'qualityGood'
      : quality === 'moderate' ? 'qualityModerate'
      : quality === 'poor' ? 'qualityPoor'
      : 'qualityUnknown',
    );
    const kw = recovered === undefined
      ? '--'
      : (recovered / 1000).toFixed(1).replace('.', ',');
    const quality_ = this.pairLayout('quality', 22);

    return svg`
      <g text-anchor="middle">
        <circle cx=${quality_.iconX + 11} cy="264" r="11" fill=${dot} />
        <text data-measure="quality" x=${quality_.textCx} y="274"
              font-size="35" font-weight="600"
              fill="var(--app-text)">${label}</text>
        <text x=${INFO_CX} y="310" font-size="27"
              fill="var(--app-dim)">${text(this.hass, 'airQuality')}</text>
        <text x=${INFO_CX} y="374" font-size="35" font-weight="600"
              fill="var(--app-text)">${kw} kW</text>
        <text x=${INFO_CX} y="410" font-size="27"
              fill="var(--app-dim)">${text(this.hass, 'recovered')}</text>
      </g>
    `;
  }

  /**
   * The outdoor probe on input register 38.
   *
   * This is a different measurement from the outside-air duct sensor: it reads
   * the actual outdoor temperature rather than the air arriving at the unit.
   * The register reads -99 degrees when no probe is wired up, which the
   * coordinator turns into no value at all, so the block simply disappears.
   */
  private outdoor(): TemplateResult | typeof nothing {
    if (this.config.show_outdoor === false) return nothing;
    const temperature = this.value('temp_outdoor');
    if (temperature === undefined || temperature === null) return nothing;
    const outdoor = this.pairLayout('outdoor', 22);
    return svg`
      <g>
        <path d=${FuturaFlowCard.thermometer(outdoor.iconX, OUTDOOR_Y - 10)}
              fill="none" stroke="var(--app-dim)" stroke-width=${t.OUTLINE_W}
              stroke-linecap="round" />
        <text data-measure="outdoor" x=${outdoor.textCx} y=${OUTDOOR_Y}
              text-anchor="middle" font-size="27"
              fill="var(--app-dim)">${text(this.hass, 'outdoor')}</text>
        <text x=${INFO_CX} y=${OUTDOOR_Y + 52} text-anchor="middle"
              font-size="40" font-weight="600" fill="var(--app-text)">
          ${FuturaFlowCard.decimal(temperature)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
      </g>
    `;
  }

  private static thermometer(x: number, y: number): string {
    return `M ${x + 5} ${y - 10} a 6 6 0 0 1 12 0 v 16 a 9 9 0 1 1 -12 0 Z`;
  }

  private glyphs(): TemplateResult {
    // The small marks the app prints inside the body: filter, air quality, home.
    return svg`
      <g stroke="var(--app-dim)" fill="none" stroke-width=${t.OUTLINE_W}
         stroke-linecap="round" opacity="0.85">
        <path d="M 100 222 h 22 M 104 222 v 20 a 3 3 0 0 0 3 3 h 8
                 a 3 3 0 0 0 3 -3 v -20 M 108 218 h 6" />
        <path d="M 390 220 c -18 1 -30 11 -30 24 c 0 8 5 13 12 13
                 c 14 0 24 -14 18 -37 Z" />
        <path d="M 386 226 c -10 6 -17 15 -21 25" />
        <path d="M 228 448 v -14 l 13 -11 l 13 11 v 14" />
      </g>
    `;
  }

  private filterBar(): TemplateResult | typeof nothing {
    if (this.config.show_filter === false) return nothing;
    const wear = this.value('filter_wear');
    if (wear === undefined) return nothing;
    const pct = Math.min(100, Math.max(0, wear));
    return html`
      <div class="filter">
        <div class="head">
          <span class="name">${text(this.hass, 'filterClogging')}</span>
          <span class="pct">${Math.round(wear)} %</span>
        </div>
        <div class="bar"><span style=${`width:${pct}%`}></span></div>
      </div>
    `;
  }

  override render(): TemplateResult {
    if (!this.hass) return html`<ha-card></ha-card>`;

    const ambient = this.entity('temp_ambient');
    if (ambient && !this.hass.states[ambient]) {
      return html`<ha-card>
        ${errorRow(
          `${text(this.hass, 'entityMissing', { entity: ambient })} `
          + text(this.hass, 'setPrefixHint'),
        )}
      </ha-card>`;
    }

    return html`
      <ha-card>
        <div class="schematic">
          <svg viewBox="0 0 ${W} ${H}" role="img"
               aria-label=${text(this.hass, 'ariaFlow')}>
            <defs>
              <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color=${t.GREY.darker} />
                <stop offset="22%" stop-color=${t.GREY.light} />
                <stop offset="48%" stop-color=${t.GREY.dim} />
                <stop offset="74%" stop-color=${t.GREY.bright} />
                <stop offset="100%" stop-color=${t.GREY.dark} />
              </linearGradient>
              <linearGradient id="supplyGrad" gradientUnits="userSpaceOnUse"
                x1=${RIGHT_MID} y1=${BODY_TOP} x2=${LEFT_MID} y2=${BODY_BOTTOM}>
                <stop offset="0%" stop-color=${t.RIBBON_SUPPLY[0]} />
                <stop offset="100%" stop-color=${t.RIBBON_SUPPLY[1]} />
              </linearGradient>
              <linearGradient id="extractGrad" gradientUnits="userSpaceOnUse"
                x1=${RIGHT_MID} y1=${BODY_BOTTOM} x2=${LEFT_MID} y2=${BODY_TOP}>
                <stop offset="0%" stop-color=${t.RIBBON_EXTRACT[0]} />
                <stop offset="50%" stop-color=${t.RIBBON_EXTRACT[1]} />
                <stop offset="100%" stop-color=${t.RIBBON_EXTRACT[2]} />
              </linearGradient>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              <clipPath id="bodyClip">
                <rect x="62" y=${BODY_TOP} width="800" height=${BODY_BOTTOM - BODY_TOP}
                      rx="16" />
              </clipPath>
            </defs>

            ${DUCTS.map((duct) => this.ductGroup(duct))}
            ${this.outdoor()}

            ${this.collar(LEFT_X, BODY_TOP - COLLAR_H)}
            ${this.collar(RIGHT_X, BODY_TOP - COLLAR_H)}
            ${this.collar(LEFT_X, BODY_BOTTOM)}
            ${this.collar(RIGHT_X, BODY_BOTTOM)}

            <rect x="62" y=${BODY_TOP} width="800" height=${BODY_BOTTOM - BODY_TOP}
                  rx="16" fill="var(--app-body)" stroke="var(--app-border)"
                  stroke-width=${t.FINE_W} />
            <g clip-path="url(#bodyClip)">${this.ribbons()}</g>
            ${this.glyphs()}
            ${this.info()}
          </svg>
        </div>
        ${this.filterBar()}
      </ha-card>
    `;
  }
}
