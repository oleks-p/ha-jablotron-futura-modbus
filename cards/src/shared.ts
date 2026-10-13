/** Shared helpers and styling for the Futura cards. */
import { css, html, TemplateResult, unsafeCSS } from 'lit';
import * as t from './tokens';

/**
 * Lit's `css` tag only interpolates numbers and CSSResult, so a token string has
 * to be wrapped. These are our own constants, never user input.
 */
export const cssVal = (value: string) => unsafeCSS(value);

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface Hass {
  states: Record<string, HassEntity>;
  /**
   * The entity and device registries as the frontend holds them -- only the
   * fields the cards read. Optional because a card can render before they load.
   */
  entities?: Record<string, { device_id?: string | null }>;
  devices?: Record<string, { name?: string | null; name_by_user?: string | null }>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ) => Promise<unknown>;
  localize?: (key: string) => string;
}

/** Resolve an entity's numeric state, or undefined when it is not usable. */
export function num(hass: Hass | undefined, entityId?: string): number | undefined {
  if (!hass || !entityId) return undefined;
  const entity = hass.states[entityId];
  if (!entity) return undefined;
  if (entity.state === 'unavailable' || entity.state === 'unknown') return undefined;
  const value = Number(entity.state);
  return Number.isFinite(value) ? value : undefined;
}

export function str(hass: Hass | undefined, entityId?: string): string | undefined {
  if (!hass || !entityId) return undefined;
  const entity = hass.states[entityId];
  if (!entity) return undefined;
  if (entity.state === 'unavailable' || entity.state === 'unknown') return undefined;
  return entity.state;
}

export function isOn(hass: Hass | undefined, entityId?: string): boolean {
  return str(hass, entityId) === 'on';
}

/** Format a number for display, falling back to an em dash. */
export function fmt(value: number | undefined, digits = 1): string {
  return value === undefined ? '--' : value.toFixed(digits);
}

/** Render seconds as a compact countdown. */
export function countdown(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/**
 * The entity prefix the integration produces by default.
 *
 * One definition, imported by every card. Four cards had their own copy of this
 * string, so renaming the device would have been five edits with nothing to
 * remind anyone about the other four.
 */
export const DEFAULT_PREFIX = 'sensor.jablotron_futura';

/** Metrics every peripheral family reports. */
export type Metric = 'co2' | 'temperature' | 'humidity';

/**
 * `min`/`max` are the y-axis extent a chart starts from, not a clamp: charts
 * pair them with `fit_y_data`, so the axis holds still at ordinary readings and
 * still grows to show an outlier rather than clipping it. Without a floor the
 * axis rescales on every refresh and a half-degree wobble fills the plot.
 */
export const METRICS: Record<
  Metric,
  { label: string; unit: string; icon: string; digits: number; min: number; max: number }
> = {
  co2: { label: 'CO₂', unit: 'ppm', icon: 'mdi:leaf', digits: 0, min: 400, max: 1200 },
  temperature: {
    label: 'Temperature', unit: '°C', icon: 'mdi:thermometer', digits: 1,
    min: 18, max: 28,
  },
  humidity: {
    label: 'Humidity', unit: '%', icon: 'mdi:water-percent', digits: 0,
    min: 30, max: 70,
  },
};

/**
 * Peripheral reading entities: wall controllers, CO2 sensors and ALFA units.
 *
 * Matching on the slot pattern rather than a fixed list keeps every card working
 * on any Futura, whatever mix of peripherals it has — the integration only
 * creates entities for slots that are actually populated.
 */
const PERIPHERAL_SLOT = /^_(alfa|co2_sensor|wall_controller)_\d+_/;

/** Every entity reporting `metric` for a connected peripheral, sorted. */
export function discoverPeripherals(
  hass: Hass | undefined,
  prefix: string,
  metric: Metric,
): string[] {
  if (!hass) return [];
  const suffix = `_${metric}`;
  return Object.keys(hass.states)
    .filter((id) => {
      if (!id.startsWith(prefix) || !id.endsWith(suffix)) return false;
      // The slot must follow the prefix directly. A second unit's ids start
      // with the first one's prefix too -- sensor.jablotron_futura_2_alfa_1_co2
      // -- and this is what keeps them off the first unit's cards. It also
      // excludes the unit's own duct probes and the derived summaries.
      if (!PERIPHERAL_SLOT.test(id.slice(prefix.length))) return false;
      // The ALFA's optional NTC input is a separate probe, not a room reading.
      return !id.includes('_ntc_');
    })
    .sort();
}

/** The device an entity belongs to, if the registries have loaded. */
export function deviceId(hass: Hass | undefined, entityId: string): string | undefined {
  return hass?.entities?.[entityId]?.device_id ?? undefined;
}

/** Drop the device name and the trailing metric from a friendly name. */
export function shortName(
  hass: Hass | undefined,
  entityId: string,
  metric: Metric,
): string {
  const friendly = hass?.states[entityId]?.attributes?.friendly_name as
    | string
    | undefined;
  if (!friendly) return entityId;
  const id = deviceId(hass, entityId);
  const device = id ? hass?.devices?.[id] : undefined;
  const deviceName = device?.name_by_user || device?.name;
  const bare = deviceName && friendly.toLowerCase().startsWith(deviceName.toLowerCase())
    ? friendly.slice(deviceName.length)
    : friendly.replace(/^Jablotron Futura\s*/i, '');
  return bare
    .replace(/\sCO2$/i, '')
    .replace(new RegExp(`\\s*${metric}$`, 'i'), '')
    .trim();
}

export function errorRow(message: string): TemplateResult {
  return html`<div class="futura-error">${message}</div>`;
}

/**
 * Tokens and base styling.
 *
 * Everything resolves through Home Assistant's own theme variables first so the
 * cards follow the active theme, with the app's dark palette as the fallback.
 */
export const sharedStyles = css`
  :host {
    /* Theme tokens where the card should follow the user's HA theme, fixed
       tokens where it must match artwork. Every fallback and every fixed value
       comes from tokens.ts. */
    --futura-bg: var(--ha-card-background, var(--card-background-color, ${cssVal(t.GROUND)}));
    --futura-panel: var(--secondary-background-color, rgba(255, 255, 255, 0.06));
    --futura-text: var(--primary-text-color, ${cssVal(t.INK)});
    --futura-muted: var(--secondary-text-color, ${cssVal(t.DIM)});
    /* Active controls take the "running" green, not the "reading is good" one. */
    --futura-accent: var(--state-icon-active-color, ${cssVal(t.RUNNING)});
    --futura-good: ${cssVal(t.OK)};
    --futura-moderate: ${cssVal(t.WARN)};
    --futura-poor: ${cssVal(t.BAD)};
    --futura-fault: ${cssVal(t.FAULT)};
    --futura-neutral: ${cssVal(t.NO_DATA)};
    /* One canvas radius, not HA's 16px default fighting the cards' own 18. */
    --futura-radius: ${cssVal(t.RADIUS.canvas)};
    display: block;
  }

  ha-card {
    background: var(--futura-bg);
    color: var(--futura-text);
    border-radius: var(--futura-radius);
    padding: 16px;
    overflow: hidden;
  }

  .futura-error {
    padding: 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--futura-fault) 15%, transparent);
    color: var(--futura-fault);
    font-size: 0.9rem;
  }

  .muted {
    color: var(--futura-muted);
  }

  /*
   * The one "value over artwork" pill, shared by every card -- same radius,
   * ground, hairline and type, so a reading looks the same wherever it is
   * printed. Numerals are tabular because these all carry a
   * live number: without it the label slides sideways when 9.9 becomes 10.0.
   */
  .readout-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: ${cssVal(t.RADIUS.pill)};
    background: rgba(12, 14, 18, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    font-size: ${cssVal(t.PILL_FONT_SIZE)};
    font-weight: ${cssVal(t.PILL_FONT_WEIGHT)};
    color: rgba(255, 255, 255, 0.92);
    font-variant-numeric: tabular-nums;
  }

  .readout-pill ha-icon {
    --mdc-icon-size: ${cssVal(t.PILL_ICON_SIZE)};
    opacity: 0.75;
    flex: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`;
