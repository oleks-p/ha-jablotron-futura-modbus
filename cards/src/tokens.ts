/**
 * The one place a colour, radius or stroke weight is decided.
 *
 * One table rather than literals scattered through the cards: the drift it
 * replaced was four greens, five warm tones and two blues for the same handful
 * of states.
 *
 * Semantic groups are deliberately kept apart:
 *
 *   SURFACE   what a thing is drawn on
 *   STATUS    what a reading or a machine is doing right now
 *   DUCT      which duct a reading belongs to -- an identity, not a state
 *   GREY      decoration: arrows, shells, inactive furniture
 *
 * Mixing them is what produced the original mess: one green served as both
 * "control is active" and the room-temperature duct.
 */

/* ── surfaces ────────────────────────────────────────────────────────────── */

/** The ground every schematic and flow diagram is drawn on. */
export const GROUND = '#0f1216';
/** A panel floating on the ground: the filter strip, a readout group. */
export const PANEL = '#1b1b1e';
/** The unit's own body in the flow diagram, one step up from a panel. */
export const BODY = '#26262a';
/** Hairline between surfaces. */
export const BORDER = '#35353a';
/** Primary and secondary text on a surface. */
export const INK = '#f2f2f7';
export const DIM = '#8e8e93';

/* ── status ──────────────────────────────────────────────────────────────── */

/** A reading inside its comfortable band. */
export const OK = '#6fce6f';
/** A reading drifting out of band. */
export const WARN = '#b9b02f';
/** A reading out of band. */
export const BAD = '#d9564f';
/**
 * Equipment that is running.
 *
 * Distinct from OK on purpose: a fan running and a CO2 level being fine are
 * different facts, and a dashboard that paints them the same colour cannot say
 * "running, and the air is still bad".
 */
export const RUNNING = '#6edc96';
/**
 * No telemetry for this thing.
 *
 * Grey, never red. Red is a fault -- something that needs attention -- and an
 * absent reading is not one. Painting it red would put a permanent false alarm
 * on every card with a sensor missing.
 */
export const NO_DATA = '#79828f';
/** A real fault. The only red in the palette. */
export const FAULT = '#e0392c';
/** Text and glyphs printed on top of RUNNING, which is a light green. */
export const ACCENT_INK = '#0b2413';

/* ── ventilation ducts ───────────────────────────────────────────────────── */

/**
 * The four ducts, matched to the Jablotron mobile app.
 *
 * Each key is named for the reading it carries, which is worth stating because
 * the first version of this table was shifted by one: `ambient` coloured the
 * waste duct, `fresh` coloured the outdoor one, and so on. The rendering was
 * right -- it matched the app -- so nothing looked wrong, which is exactly why
 * it survived.
 *
 * These are the app's own colour language for "which duct", not a temperature
 * scale -- the card exists to mirror that screen. Sampled from a reference
 * screenshot rather than eyeballed: the app fills each arrow with a gradient, so
 * each value here is the brightest saturated pixel in that arrow.
 */
export const DUCT = {
  /** Spent air on its way out. Top left on the app's main screen, rising. */
  waste: '#ffc800',
  /** Outdoor air arriving. Top right, falling. */
  outside: '#67c814',
  /** Conditioned air going to the rooms. Bottom left, falling. */
  fresh: '#19afff',
  /** Room air being extracted. Bottom right, rising. */
  inside: '#ff2e11',
} as const;

/**
 * The two ribbons, as gradient stops in the direction each gradient is drawn.
 *
 * Extract runs bottom-right to top-left, so it reads red, orange, gold; supply
 * runs top-right to bottom-left, green to blue. The ends match the duct arrows
 * they meet, so a ribbon and its arrow are continuous.
 */
export const RIBBON_EXTRACT = [DUCT.inside, '#ff810a', DUCT.waste] as const;
export const RIBBON_SUPPLY = [DUCT.outside, DUCT.fresh] as const;

/* ── decoration ──────────────────────────────────────────────────────────── */

/** Greys for arrows, shells and furniture that carry no state. */
export const GREY = {
  bright: '#e6e6ea',
  light: '#d7d7db',
  mid: '#c9c9ce',
  dim: '#8f8f95',
  dark: '#6a6a6f',
  darker: '#5d5d61',
  track: '#333338',
} as const;

/** The filter-wear bar, the one gradient in the palette. */
export const FILTER_GRADIENT = ['#6b4a12', '#d99a2a', '#ffb15c'] as const;

/* ── the unit, as drawn ──────────────────────────────────────────────────── */

/**
 * The unit's own materials, for the cards that draw it rather than abstract it.
 *
 * These were literals scattered through three cards -- a dozen hexes, several of
 * them a hair apart from each other and none of them named. Collected here
 * unchanged: the point of this pass was to stop the drawing carrying its own
 * palette, not to redesign it.
 *
 * There are more steps in the grey ladder than the drawing probably needs --
 * `seam` and `panelEdge` are one idea at two values, and `dim`, `fainter` and
 * `wordmark` are three -- but merging them changes what renders, which is a
 * separate decision from naming them. It is now a one-place change if it is
 * wanted.
 */
export const DRAW = {
  /** A line drawing's stroke, on the dark ground. */
  line: '#e8ecf2',
  /** The painted shell, lit. */
  casing: '#f8f8f8',
  /** A panel joint across it: the filter hatch, a door seam. */
  seam: '#dcdce0',
  /** The EPP sleeve around a flange. */
  collar: '#9b9ba1',
  /** A readout panel set into the casing, and its edge. */
  panel: '#ededf0',
  panelEdge: '#c9c9ce',
  /** Type on the casing: a value, its label, and the quietest of the three. */
  ink: '#4a4a50',
  dim: '#7e7e85',
  fainter: '#8e8e95',
  /** The two wordmarks, which the photograph shows at different strengths. */
  wordmark: '#8b8b90',
  wordmarkDim: '#adadb2',
  /** The status LED down the front, running. */
  led: '#61d960',
} as const;

/* ── shape ───────────────────────────────────────────────────────────────── */

/**
 * Four radii, each with a job. The five that preceded them included a 10px and
 * an inherited 16px that nothing had chosen.
 */
export const RADIUS = {
  /** A full-bleed drawing surface: schematic, flow diagram, panel. */
  canvas: '18px',
  /** A small value readout sitting over artwork. */
  pill: '13px',
  /** Anything you press that is not a toggle chip. */
  button: '12px',
  /** A toggle in a row of toggles. */
  chip: '999px',
} as const;

/* ── stroke ladder ───────────────────────────────────────────────────────── */

/**
 * The flow diagram draws into a 923-wide viewBox rendered at roughly 500 px, so
 * a stroke of 2 here renders at about 1.1 px. These are viewBox units chosen so
 * the rendered hairline lands on 1.4 px at the card's usual width -- 1.4 x 923 /
 * 500 is about 2.6.
 *
 * Verify by measuring the live page, never by comparing these numbers with a
 * drawing that uses a different viewBox.
 */
export const VIEWBOX_W = 923;
/** The width the card is typically rendered at, for the scale factor above. */
export const RENDER_W = 500;
const SCALE = VIEWBOX_W / RENDER_W;

/**
 * A carried medium: an air run on the diagram.
 *
 * Heavier than the outline on purpose -- what flows reads above what contains it.
 */
export const PIPE_W = Math.round(2 * SCALE * 10) / 10;
/** Equipment outline: 1.4 px once rendered. */
export const OUTLINE_W = Math.round(1.4 * SCALE * 10) / 10;
/** Detail inside equipment: glyphs, collars. */
export const DETAIL_W = Math.round(OUTLINE_W * 0.9 * 10) / 10;
/** The finest line that still reads at render size. */
export const FINE_W = Math.round(OUTLINE_W * 0.72 * 10) / 10;

/* ── type ────────────────────────────────────────────────────────────────── */

/**
 * Readout type, in px rather than rem.
 *
 * A rem-sized label beside SVG text that does not scale drifts apart from it as
 * soon as the reader changes their font size, so anything that has to line up
 * with artwork is px. Prose and captions stay in rem.
 */
export const PILL_FONT_SIZE = '12px';
export const PILL_FONT_WEIGHT = '500';
export const PILL_ICON_SIZE = '13px';
