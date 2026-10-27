/**
 * The unit as a line drawing: the manual's airflow diagram.
 *
 * Two manual figures combined. The casing comes from the dimensional drawing's
 * front elevation -- outline, four flange collars and the filter hatch -- and the
 * airflow from the process diagram: a run per flange, the bypass damper, both fans,
 * and the cross-flow exchanger they meet in. The elevation's door detail, its two
 * shallow arcs and centre seam, is left out: it belongs to a drawing with nothing
 * over it, and here it crossed the diagram it sits behind.
 *
 * Drawn plainer than the other cards: thin lines, no fills, no gradients, and a
 * near-white for everything that contains air. What carries air is the exception -- each run takes its duct's flat colour,
 * so a glance says which is which without a legend. The hierarchy is then colour
 * over neutral as well as weight over weight: the runs read first, the casing
 * second.
 *
 * The readings are the shared `.readout-pill`, so they match the other cards'
 * to the pixel.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, svg, type TemplateResult } from 'lit';
import { type Hass, DEFAULT_PREFIX, cssVal, errorRow, num, sharedStyles } from './shared';
import { text } from './i18n';
import * as t from './tokens';
import { type Shell, hatchSeam, makeShell } from './unit-shell';

export interface DiagramCardConfig {
  type: string;
  prefix?: string;
  title?: string;
}


const W = 900;

/**
 * The same 560-wide casing at the same place as the unit and service schematics,
 * so the four views of this unit are the same size on the dashboard. It was drawn
 * wider while the diagram was being laid out, which made this card noticeably the
 * biggest of them.
 */
const SHELL: Shell = makeShell(124, 560, 170);
const BODY = SHELL.body;
const H = BODY.y + BODY.h + 22;

/**
 * Everything inside the casing is a fraction of it, read off the manual's process
 * diagram: run tops, the leg into the exchanger, the fans, the bypass and the
 * exchanger itself. Fractions rather than units so the drawing keeps the
 * reference's proportions at whatever size the casing is set to -- which is what
 * made resizing this card a one-line change.
 */
const RUN_TOP = BODY.y + Math.round(BODY.h * 0.047);
const LEG_Y = BODY.y + Math.round(BODY.h * 0.905);
const FAN = {
  y: BODY.y + Math.round(BODY.h * 0.147),
  r: Math.round(BODY.w * 0.042),
};
const BYPASS_Y = BODY.y + Math.round(BODY.h * 0.347);

/** Collars, and the arrows above them. */
const COLLAR_H = Math.round(BODY.h * 0.084);
const ARROW = { top: 22, bottom: 78 };

/**
 * The near-white equipment is drawn in, and its opacities.
 *
 * Equipment is drawn in this; the air runs carry their duct's colour instead, so
 * the hierarchy is now colour against neutral as well as weight against weight.
 */
const LINE = t.DRAW.line;
const OP = { flow: 0.95, shell: 0.8, detail: 0.3, label: 0.75 } as const;

/**
 * The cross-flow exchanger, symmetric about the casing's centre line.
 *
 * Narrower than the span of the two flanges whose runs leave it, so those runs
 * land on its upper slanted edges rather than on its corners -- which is what the
 * manual's figure does, and it reads better than a corner join because the slant
 * shows the air turning.
 */
const EXCH = {
  top: BODY.y + Math.round(BODY.h * 0.711),
  mid: BODY.y + Math.round(BODY.h * 0.821),
  bottom: BODY.y + Math.round(BODY.h * 0.937),
  point: Math.round(BODY.w * 0.145),
  shoulder: Math.round(BODY.w * 0.073),
};

/**
 * The three heights at which direction chevrons appear, as fractions of the
 * casing.
 *
 * Rows rather than a fraction along each run, because the manual lines its
 * chevrons up across the runs -- they read as three ranks, not as four
 * independent ladders. A run is marked at every row it passes through, and that
 * one rule gives the reference's uneven counts for free: three on the long
 * outdoor run, two each on waste and extract, one on supply, without a number
 * tuned per duct.
 */
const CHEVRON_ROWS = [0.13, 0.532, 0.764].map(
  (f) => BODY.y + Math.round(BODY.h * f),
);

/**
 * How far short of the exchanger each run stops.
 *
 * All four stand off it rather than touching, which is what the manual's figure
 * does and the usual convention for a schematic: an arrow points *at* a block, it
 * does not join it. Ending them on the outline instead makes the run and the
 * slanted edge read as one line.
 */
const EXCH_STANDOFF = Math.round(BODY.w * 0.027);

/**
 * The crossing inside it, as half-extents from the exchanger's centre.
 *
 * A wide, flat X: about 28.5% of the block's width either side of centre and a
 * quarter of its height, which is the reference's. Spanning between the flat top
 * and bottom edges instead gives a narrow steep X that reads as a cross-out
 * rather than as two paths trading heat.
 */
const CROSS = {
  dx: Math.round(BODY.w * 0.082),
  dy: Math.round(BODY.h * 0.056),
  wing: Math.round(BODY.w * 0.025),
};

/** Where the arrows, between the labels above and the collars below. */
const LABEL_INSET = `${((SHELL.collarX[0] - (SHELL.collarX[1] - SHELL.collarX[0]) / 2) / W) * 100}%`;

interface Duct {
  flange: 'A' | 'B' | 'C' | 'D';
  temp: string;
  humidity: string;
  collar: number;
  /** Which way the air moves through this flange. */
  into: boolean;
  /** The duct's own colour, shared with every other card. */
  colour: string;
}

const DUCTS: Duct[] = [
  {
    flange: 'A', collar: 0, into: true, colour: t.DUCT.outside,
    temp: 'outside_air_temperature', humidity: 'outside_air_humidity',
  },
  {
    flange: 'B', collar: 1, into: false, colour: t.DUCT.waste,
    temp: 'exhaust_air_temperature', humidity: 'exhaust_air_humidity',
  },
  {
    flange: 'C', collar: 2, into: false, colour: t.DUCT.fresh,
    temp: 'supply_air_temperature', humidity: 'supply_air_humidity',
  },
  {
    flange: 'D', collar: 3, into: true, colour: t.DUCT.inside,
    temp: 'extract_air_temperature', humidity: 'extract_air_humidity',
  },
];

export class FuturaDiagramCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: DiagramCardConfig = { type: 'custom:futura-diagram-card' };

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
      }

      .stage {
        /* So the pills can size against the drawing rather than the viewport. */
        container-type: inline-size;
      }

      .labels {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 14px ${cssVal(LABEL_INSET)} 8px;
      }

      /*
       * One pill per flange, centred in its column. 12px matches every other
       * readout, but it cannot be a flat 12px: a column is 19% of the width and a
       * pill needs about 6.1em, so below roughly 415px the neighbours would touch
       * and the grid would push them off their flanges. 2.9cqw is the width at
       * which a pill fits its column with a little slack, so the min() holds 12px
       * wherever there is room and scales in proportion where there is not.
       */
      .pill {
        justify-self: center;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.15em;
        font-size: min(12px, 2.9cqw);
        line-height: 1.25;
        white-space: nowrap;
        pointer-events: none;
      }

      .pill .row {
        gap: 0.42em;
      }

      .pill ha-icon {
        --mdc-icon-size: 1.08em;
      }
    `,
  ];

  setConfig(config: DiagramCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    this.config = { ...config };
  }

  getCardSize(): number {
    return 8;
  }

  static getStubConfig(): DiagramCardConfig {
    return { type: 'custom:futura-diagram-card' };
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

  /** Temperature and humidity over each flange, in the shared pill. */
  private pill(duct: Duct): TemplateResult {
    return html`
      <div class="pill readout-pill">
        <span class="row">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          ${FuturaDiagramCard.decimal(this.reading(duct.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${FuturaDiagramCard.decimal(this.reading(duct.humidity), 0)} %
        </span>
      </div>
    `;
  }

  /** A stroked arrow, drawn as a line and two strokes rather than a filled head. */
  private static arrow(duct: Duct): TemplateResult {
    const cx = SHELL.collarX[duct.collar];
    const { top, bottom } = ARROW;
    const tip = duct.into ? bottom : top;
    const tail = duct.into ? top : bottom;
    const back = duct.into ? -1 : 1;
    const wing = Math.round(BODY.w * 0.022);
    return svg`
      <path d=${`M ${cx} ${tail} L ${cx} ${tip}`
        + ` M ${cx - wing} ${tip + back * wing * 1.3} L ${cx} ${tip}`
        + ` L ${cx + wing} ${tip + back * wing * 1.3}`}
            fill="none" stroke=${duct.colour} stroke-width=${t.PIPE_W}
            stroke-opacity=${OP.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  /**
   * The casing: outline, collars and hatch.
   *
   * Only what contains the air. The front elevation also carries the doors' own
   * detail -- a shallow arc on the hatch, another near the foot, and the seam
   * between the two lower doors -- and all three are left out: they crossed the
   * diagram, and the centre seam ran straight through the exchanger's cross. The
   * hinges stay, being the one detail that sits clear of everything.
   */
  private static casing(): TemplateResult {
    const { x, y, w, h } = BODY;
    const seam = y + SHELL.lidH;
    return svg`
      <g fill="none" stroke=${LINE} stroke-linecap="round" stroke-linejoin="round">
        ${SHELL.collarX.map((cx) => svg`
          <rect x=${cx - SHELL.collarW / 2} y=${y - COLLAR_H}
                width=${SHELL.collarW} height=${COLLAR_H}
                stroke-width=${t.DETAIL_W} stroke-opacity=${OP.shell} />
        `)}
        <rect x=${x} y=${y} width=${w} height=${h} rx=${BODY.r}
              stroke-width=${t.OUTLINE_W} stroke-opacity=${OP.shell} />
        <path d=${`M ${x + 9} ${y + 20} L ${x + 9} ${y + 44}`
          + ` M ${x + w - 9} ${y + 20} L ${x + w - 9} ${y + 44}`}
              stroke-width=${t.FINE_W} stroke-opacity=${OP.detail} />
        ${hatchSeam(BODY, seam, t.DETAIL_W)}
      </g>
    `;
  }

  /** A fan: a circle with a triangle pointing the way the air goes. */
  private static fan(cx: number, up: boolean, colour: string): TemplateResult {
    const { r } = FAN;
    const s = r * 0.62;
    const tip = up ? FAN.y - s : FAN.y + s;
    const base = up ? FAN.y + s * 0.72 : FAN.y - s * 0.72;
    return svg`
      <circle cx=${cx} cy=${FAN.y} r=${r} fill=${t.GROUND}
              stroke=${LINE} stroke-width=${t.DETAIL_W} stroke-opacity=${OP.shell} />
      <path d=${`M ${cx - s} ${base} L ${cx + s} ${base} L ${cx} ${tip} Z`}
            fill=${colour} fill-opacity=${OP.flow} />
    `;
  }

  /**
   * An open arrowhead at (x, y), its wings trailing back along (dx, dy).
   *
   * (dx, dy) only has to point the right way; it is normalised here, so callers
   * can hand it the difference between two path points.
   */
  private static head(
    x: number, y: number, dx: number, dy: number, colour: string,
    wing = Math.round(BODY.w * 0.019), width = t.PIPE_W,
  ): TemplateResult {
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    // Back along the direction of travel, then out to either side of it.
    const bx = x - ux * wing * 1.3;
    const by = y - uy * wing * 1.3;
    return svg`
      <path d=${`M ${bx - uy * wing} ${by + ux * wing} L ${x} ${y}`
        + ` L ${bx + uy * wing} ${by - ux * wing}`}
            fill="none" stroke=${colour} stroke-width=${width}
            stroke-opacity=${OP.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  /**
   * Direction chevrons on one run: one at each row the run passes through.
   *
   * `from` and `to` are the run's ends in the direction the air travels, which is
   * what points the chevrons. A row within a wing of either end is skipped, so a
   * mark never lands on a terminus.
   */
  private static chevrons(
    cx: number, from: number, to: number, colour: string,
  ): TemplateResult {
    const down = to > from;
    const wing = Math.round(BODY.w * 0.02);
    const low = Math.min(from, to) + wing;
    const high = Math.max(from, to) - wing;
    const rows = CHEVRON_ROWS.filter((y) => y >= low && y <= high);
    return svg`
      <path d=${rows.map((cy) => `M ${cx - wing} ${cy - (down ? wing : -wing)}`
        + ` L ${cx} ${cy} L ${cx + wing} ${cy - (down ? wing : -wing)}`).join(' ')}
            fill="none" stroke=${colour} stroke-width=${t.PIPE_W}
            stroke-opacity=${OP.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  /**
   * The airflow: four runs, the bypass, the fans and the exchanger.
   *
   * Outdoor air comes down A and enters the exchanger from the left; it leaves by
   * the upper-right slant and rises through the supply fan to C. Extract comes
   * down D through the exhaust fan, enters from the right, and leaves by the
   * upper-left slant to B. So each stream crosses the unit and the two cross each
   * other inside the exchanger, which is what the X in it means.
   *
   * Each run carries its own duct's colour, flat -- no gradient. The exchanger and
   * the fan bodies stay neutral, because they contain air rather than carry it.
   */
  private static flow(hass: Hass | undefined): TemplateResult {
    const [xa, xb, xc, xd] = SHELL.collarX;
    const { top, mid, bottom, point, shoulder } = EXCH;
    const centre = BODY.x + BODY.w / 2;
    const left = centre - point;
    const right = centre + point;
    const shoulderL = centre - shoulder;
    const shoulderR = centre + shoulder;
    /** Where a vertical at `cx` meets one of the exchanger's slanted edges. */
    const onSlant = (cx: number, fromX: number, fromY: number, toX: number, toY: number) =>
      fromY + ((cx - fromX) / (toX - fromX)) * (toY - fromY);
    /** Where a horizontal at LEG_Y meets a lower slant. */
    const legX = (fromX: number, toX: number) =>
      fromX + ((toX - fromX) * (LEG_Y - mid)) / (bottom - mid);

    // Each terminus pulled back off the exchanger, along its own direction.
    const bTop = onSlant(xb, left, mid, shoulderL, top) - EXCH_STANDOFF;
    const cTop = onSlant(xc, right, mid, shoulderR, top) - EXCH_STANDOFF;
    const aLeg = legX(left, shoulderL) - EXCH_STANDOFF;
    const dLeg = legX(right, shoulderR) + EXCH_STANDOFF;

    /*
     * The damper gap sits midway between the waste and supply runs. Centring it on
     * the bypass line instead puts it exactly on the waste run -- the two dots and
     * the label land on top of it -- because the bypass spans A to C and B is
     * halfway along.
     */
    const gap = Math.round(BODY.w * 0.026);
    const damper = (xb + xc) / 2;
    const dot = (cx: number, colour: string) => svg`
      <circle cx=${cx} cy=${BYPASS_Y} r=${t.PIPE_W * 1.4}
              fill=${colour} fill-opacity=${OP.flow} />
    `;
    const run = (d: string, colour: string) => svg`
      <path d=${d} fill="none" stroke=${colour} stroke-width=${t.PIPE_W}
            stroke-opacity=${OP.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `;
    const [A, B, C, D] = DUCTS;

    return svg`
      <!-- A: outdoor air down and into the exchanger -->
      ${run(`M ${xa} ${RUN_TOP} L ${xa} ${LEG_Y} L ${aLeg} ${LEG_Y}`, A.colour)}
      <!-- B: waste up from the exchanger's upper-left slant -->
      ${run(`M ${xb} ${bTop} L ${xb} ${RUN_TOP}`, B.colour)}
      <!-- C: supply up through its fan -->
      ${run(`M ${xc} ${cTop} L ${xc} ${FAN.y + FAN.r}`, C.colour)}
      ${run(`M ${xc} ${FAN.y - FAN.r} L ${xc} ${RUN_TOP}`, C.colour)}
      <!-- D: extract down through its fan and into the exchanger -->
      ${run(`M ${xd} ${RUN_TOP} L ${xd} ${FAN.y - FAN.r}`, D.colour)}
      ${run(`M ${xd} ${FAN.y + FAN.r} L ${xd} ${LEG_Y} L ${dLeg} ${LEG_Y}`, D.colour)}

      <!--
        The bypass, taking outdoor air straight to supply past the exchanger. Two
        colours, changing at the damper: what is upstream of it is still outdoor
        air, what is downstream of it is supply.
      -->
      ${run(`M ${xa} ${BYPASS_Y} L ${damper - gap} ${BYPASS_Y}`, A.colour)}
      ${run(`M ${damper + gap} ${BYPASS_Y} L ${xc} ${BYPASS_Y}`, C.colour)}
      ${dot(xa, A.colour)}
      ${dot(damper - gap, A.colour)}
      ${dot(damper + gap, C.colour)}
      ${dot(xc, C.colour)}
      <text x=${damper} y=${BYPASS_Y + Math.round(BODY.w * 0.048)}
            text-anchor="middle" font-size=${Math.round(BODY.w * 0.027)}
            letter-spacing="1.1" fill=${LINE}
            fill-opacity=${OP.label}>${text(hass, 'bypass')}</text>

      <!-- the exchanger, and the crossing that names it -->
      <g fill="none" stroke=${LINE} stroke-linecap="round" stroke-linejoin="round">
        <path d=${`M ${left} ${mid} L ${shoulderL} ${top} L ${shoulderR} ${top}`
          + ` L ${right} ${mid} L ${shoulderR} ${bottom} L ${shoulderL} ${bottom} Z`}
              stroke-width=${t.OUTLINE_W} stroke-opacity=${OP.shell} />
        <path d=${`M ${centre - CROSS.dx} ${mid + CROSS.dy}`
          + ` L ${centre + CROSS.dx} ${mid - CROSS.dy}`
          + ` M ${centre + CROSS.dx} ${mid + CROSS.dy}`
          + ` L ${centre - CROSS.dx} ${mid - CROSS.dy}`}
              stroke-width=${t.DETAIL_W} stroke-opacity=${OP.shell} />
      </g>
      <!--
        The cross's heads at the cross's own weight. Left at the runs' pipe weight
        they read bolder than the arms they belong to, which made a correctly
        proportioned head look oversized.
      -->
      <g stroke-opacity=${OP.shell}>
        ${FuturaDiagramCard.head(centre + CROSS.dx, mid - CROSS.dy,
                                 CROSS.dx, -CROSS.dy, LINE, CROSS.wing, t.DETAIL_W)}
        ${FuturaDiagramCard.head(centre - CROSS.dx, mid - CROSS.dy,
                                 -CROSS.dx, -CROSS.dy, LINE, CROSS.wing, t.DETAIL_W)}
      </g>

      <!-- direction marks: the legs in, the two runs out, and the chevrons -->
      ${FuturaDiagramCard.head(aLeg, LEG_Y, 1, 0, A.colour)}
      ${FuturaDiagramCard.head(dLeg, LEG_Y, -1, 0, D.colour)}
      <!--
        No arrowhead where a run leaves the unit. The block arrow above its collar
        already says which way that duct flows, so a head just inside the casing
        repeated it a few units lower down.
      -->
      ${FuturaDiagramCard.chevrons(xa, RUN_TOP, LEG_Y, A.colour)}
      ${FuturaDiagramCard.chevrons(xb, bTop, RUN_TOP, B.colour)}
      ${FuturaDiagramCard.chevrons(xc, cTop, FAN.y + FAN.r, C.colour)}
      ${FuturaDiagramCard.chevrons(xd, FAN.y + FAN.r, LEG_Y, D.colour)}

      ${FuturaDiagramCard.fan(xc, true, C.colour)}
      ${FuturaDiagramCard.fan(xd, false, D.colour)}
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
          <div class="labels">${DUCTS.map((duct) => this.pill(duct))}</div>
          <svg viewBox="0 0 ${W} ${H}" role="img"
               aria-label=${text(this.hass, 'ariaDiagram')}>
            ${DUCTS.map((duct) => FuturaDiagramCard.arrow(duct))}
            ${FuturaDiagramCard.casing()}
            ${FuturaDiagramCard.flow(this.hass)}
          </svg>
        </div>
      </ha-card>
    `;
  }
}
