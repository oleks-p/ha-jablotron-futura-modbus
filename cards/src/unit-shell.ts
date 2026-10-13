/**
 * The unit itself: casing, hatch, flange collars, and the geometry behind them.
 *
 * Shared by every card that draws the unit, so there is one description of its
 * shape rather than one per card. Everything derives from the installation
 * manual's millimetres: the casing is 835 x 995 x 522 mm with four EPP flanges of
 * 150 mm, and Annex 11 chains the flange row as 133 + 3 x 243 + 133 = 995, which
 * closes exactly on the certified width -- so the row is centred and the centres
 * land 133, 376, 619 and 862 mm from the left edge.
 *
 * Only the width is chosen in SVG units. The height and the flange centres scale
 * from the millimetres, so a drawing built on this cannot come out of
 * proportion: it renders at aspect 1.191 against the real 1.192.
 */
import { svg, type TemplateResult } from 'lit';
import * as t from './tokens';

/** Millimetres, from the installation manual. */
export const MM = {
  bodyW: 995,
  bodyH: 835,
  pitch: 243,
  /**
   * First flange centre, from the left edge of the casing.
   *
   * The symmetric chain above needs no fudge factor, which is how you know it is
   * the right reading. An earlier one paired this 133 with a 73 from the same page
   * and needed an invented 30 mm inset each side to reach 995, putting the centres
   * at 163/406/649/892 -- 163 mm from the left edge against 103 from the right,
   * and visibly shifted right on the drawing. The 73 belongs to another callout.
   */
  firstCentre: 133,
} as const;

export interface Shell {
  body: { x: number; y: number; w: number; h: number; r: number };
  /** Flange centres, left to right: A, B, C, D. */
  collarX: number[];
  collarW: number;
  collarH: number;
  /** Depth of the filter-hatch band below the casing top. */
  lidH: number;
}

/**
 * Lay the unit out with its casing top at `bodyY` and the given width.
 *
 * Collar width comes from the manual's airflow drawing rather than the 150 mm
 * bore -- that drawing has them nearly touching, at about 22% of the casing
 * width, because what it draws is the EPP sleeve around the flange. Deriving it
 * from the pitch less a 1% gap gets "nearly touching" by construction.
 */
export function makeShell(bodyY: number, bodyW = 560, bodyX = 170): Shell {
  const k = bodyW / MM.bodyW;
  const gap = Math.round(bodyW * 0.011);
  const body = {
    x: bodyX,
    y: bodyY,
    w: bodyW,
    h: Math.round(MM.bodyH * k),
    r: 22,
  };
  return {
    body,
    collarX: [0, 1, 2, 3].map(
      (i) => Math.round(bodyX + (MM.firstCentre + i * MM.pitch) * k),
    ),
    collarW: Math.round(MM.pitch * k) - gap,
    collarH: 30,
    lidH: Math.round(body.h * 0.26),
  };
}

/** The collars, drawn before whatever crosses them. */
export function collars(s: Shell): TemplateResult {
  return svg`
    ${s.collarX.map((cx) => svg`
      <rect x=${cx - s.collarW / 2} y=${s.body.y - s.collarH}
            width=${s.collarW} height=${s.collarH * 2} rx="8"
            fill=${t.DRAW.collar} />
    `)}
  `;
}

/** The casing, with its filter hatch. */
export function casing(s: Shell, outlineW: number): TemplateResult {
  const { x, y, w, h, r } = s.body;
  return svg`
    <rect x=${x} y=${y} width=${w} height=${h} rx=${r} fill=${t.DRAW.casing} />
    ${hatchSeam(s.body, y + s.lidH, outlineW)}
  `;
}

/**
 * The filter hatch: a seam across the casing with its ends turned up to the top
 * edge.
 *
 * Separate from `casing` because the two cards put the hatch at different heights
 * -- but they should draw the same hatch, and the shape has two details worth
 * getting right once rather than twice.
 *
 * The ends stop exactly on the casing's top edge. Running them to the casing's top
 * *coordinate* overshoots, because the corner is rounded: at that height the white
 * only reaches x + w - r, so a seam inset by less than the radius hangs off the
 * corner into the background. Stopping them short of the edge instead leaves a
 * stub floating in the middle of the hatch. So the end is solved for -- the height
 * at which a vertical at the seam's inset meets the corner arc.
 */
export function hatchSeam(
  body: { x: number; y: number; w: number; h: number; r: number },
  seam: number,
  outlineW: number,
): TemplateResult {
  const { x, y, w, h, r } = body;
  const inset = 7;
  const corner = Math.min(12, Math.round(h * 0.035));
  // Where a vertical at `inset` crosses the corner arc, whose centre is r in
  // from the edge: the chord at horizontal distance (r - inset) from it.
  const reach = r - inset;
  const top = y + r - Math.sqrt(Math.max(0, r * r - reach * reach));
  return svg`
    <path d=${`M ${x + inset} ${top}`
      + ` L ${x + inset} ${seam - corner}`
      + ` Q ${x + inset} ${seam} ${x + inset + corner} ${seam}`
      + ` L ${x + w - inset - corner} ${seam}`
      + ` Q ${x + w - inset} ${seam} ${x + w - inset} ${seam - corner}`
      + ` L ${x + w - inset} ${top}`}
          fill="none" stroke=${t.DRAW.seam} stroke-width=${outlineW} />
  `;
}

/**
 * A dash pitch that fits `length`, landing the last mark fully inside the end.
 *
 * Marks sit every `pitch` from a path's start, so whether one reaches the far end
 * is luck, and both the unit card's runs and its arcs came up short of it.
 * Rounding the pitch to divide the length exactly looked like the fix and was
 * not: a zero-length dash sitting exactly ON the endpoint is not painted, so the
 * mark was computed and then dropped -- which is why an arc showed a dot at the
 * flange it started from and none at the flange it finished on. The start is at
 * distance 0, which paints.
 *
 * `dash` is what the two callers need differently. A dot is a zero-length dash
 * with a round cap, so it only needs nudging a hair off the endpoint. A square is
 * a dash as long as the stroke is wide, and it needs that much room: fit it to
 * the endpoint and the browser clips the last one to a sliver, which on the
 * service schematic drew a faint cross exactly where two streams meet.
 */
export function evenPitch(length: number, pitch: number, dash = 0): string {
  const room = Math.max(dash, 0.5);
  const usable = Math.max(room, length - room);
  const steps = Math.max(1, Math.round(usable / pitch));
  return (usable / steps).toFixed(3);
}

/**
 * Length of a cubic bezier, by flattening it.
 *
 * `evenPitch` has to know how long a path is, and the service schematic's runs
 * are curves rather than the straight lines and circular arcs the unit card gets
 * away with measuring by hand. 64 segments is more than enough -- the error is
 * well under a tenth of a unit, and the pitch only has to be good enough that the
 * marks look evenly spaced.
 */
export function cubicLength(
  x0: number, y0: number, x1: number, y1: number,
  x2: number, y2: number, x3: number, y3: number,
): number {
  const at = (t: number, a: number, b: number, c: number, d: number) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };
  let total = 0;
  let px = x0;
  let py = y0;
  for (let i = 1; i <= 64; i += 1) {
    const t = i / 64;
    const qx = at(t, x0, x1, x2, x3);
    const qy = at(t, y0, y1, y2, y3);
    total += Math.hypot(qx - px, qy - py);
    px = qx;
    py = qy;
  }
  return total;
}
