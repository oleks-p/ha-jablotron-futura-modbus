/**
 * The Futura control screen: ventilation level, comfort target and the row of
 * timed-function chips, matching the layout of the mobile app.
 */
import {
  LitElement,
  type PropertyDeclarations,
  type PropertyValues,
  css,
  html,
  nothing,
  type TemplateResult,
} from 'lit';
import {
  type Hass,
  DEFAULT_PREFIX,
  countdown,
  cssVal,
  deviceId,
  errorRow,
  isOn,
  num,
  sharedStyles,
  str,
} from './shared';
import { text, type StringKey } from './i18n';
import * as t from './tokens';

export interface ControlCardConfig {
  type: string;
  title?: string;
  prefix?: string;
  climate?: string;
  ventilation_select?: string;
  humidity_select?: string;
  show_functions?: boolean;
  show_humidity?: boolean;
  /** Override any visible string, for dashboards not in English. */
  labels?: Partial<Record<LabelKey, string>>;
}

/**
 * The card's strings live in i18n.ts, which ships English and Ukrainian and
 * falls back key by key. `labels` in the card's config still overrides any one
 * of them, for a dashboard that wants different wording or a language the cards
 * do not ship yet.
 */
type LabelKey = StringKey;

const LEVELS = ['off', '1', '2', '3', '4', '5', 'auto'] as const;

/** The unit's three humidity presets, labelled as the app labels them. */
const HUMIDITY_MODES: Array<{ option: string; label: LabelKey }> = [
  { option: 'dry', label: 'dry' },
  { option: 'comfort', label: 'comfort' },
  { option: 'wet', label: 'wet' },
];

interface FunctionChip {
  /** The key the set_function service expects, and the label to show for it. */
  key: string;
  label: LabelKey;
  icon: string;
  /** Countdown sensor, and the number entity that carries the unit's ceiling. */
  remaining: string;
  active: string;
  limit: string;
}

/** The integration's own domain, for its set_function service. */
const DOMAIN = 'jablotron_futura_modbus';

/**
 * Vacancy is not a timer, so it is not in FUNCTIONS.
 *
 * The other five functions are a countdown in a single holding register and the
 * card offers them a duration. Vacancy is a pair of uint32 timestamps -- holding
 * 6-7 and 8-9 -- and the unit runs low until the end of it, so the only sensible
 * control is a calendar. It gets its own chip and its own dialog.
 */
function awayEntities(base: string) {
  return {
    active: `binary_sensor.${base}_away_active`,
    begins: `sensor.${base}_away_begins`,
    ends: `sensor.${base}_away_ends`,
  };
}

/** `YYYY-MM-DDTHH:MM` in local time, which is what datetime-local wants. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** A timestamp sensor's state as a Date, or undefined when it is not set. */
function stateDate(hass: Hass | undefined, entity: string): Date | undefined {
  const raw = hass?.states[entity]?.state;
  if (!raw || raw === 'unknown' || raw === 'unavailable') return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * The five timers, with entity suffixes rather than entity ids.
 *
 * The countdown sensor and the number carrying the unit's ceiling share a
 * suffix, so `remaining` names both. Night and party are irregular -- the
 * countdown is `*_mode_remaining` but the flag is `*_active` -- which is why
 * each suffix is spelled out rather than built from the key.
 */
const FUNCTIONS: Array<Omit<FunctionChip, 'limit'>> = [
  {
    key: 'boost', label: 'boost', icon: 'mdi:fan-plus',
    remaining: 'boost_remaining', active: 'boost_active',
  },
  {
    key: 'circulation', label: 'circulation', icon: 'mdi:autorenew',
    remaining: 'circulation_remaining', active: 'circulation_active',
  },
  {
    key: 'overpressure', label: 'overpressure', icon: 'mdi:weather-windy',
    remaining: 'overpressure_remaining', active: 'overpressure_active',
  },
  {
    key: 'night', label: 'night', icon: 'mdi:weather-night',
    remaining: 'night_mode_remaining', active: 'night_active',
  },
  {
    key: 'party', label: 'party', icon: 'mdi:glass-cocktail',
    remaining: 'party_mode_remaining', active: 'party_active',
  },
];

/** FUNCTIONS with every suffix resolved against one unit's entity base. */
function functionChips(base: string): FunctionChip[] {
  return FUNCTIONS.map((fn) => ({
    ...fn,
    remaining: `sensor.${base}_${fn.remaining}`,
    active: `binary_sensor.${base}_${fn.active}`,
    limit: `number.${base}_${fn.remaining}`,
  }));
}

/** Slider granularity, in minutes. */
const STEP_MINUTES = 5;

/**
 * Quick-pick durations, in minutes.
 *
 * 5 is offered only where the unit's own ceiling is two hours or less -- boost,
 * circulation and overpressure -- because a brief burst is what those are for.
 * On night mode and party, which run up to ten hours, it would be noise. Keying
 * this off the reported ceiling rather than the function names keeps it working
 * on a unit that caps them differently.
 */
function quickMinutes(max: number): number[] {
  const base = [15, 30, 60, 120, 240, 480, 600];
  return (max <= 120 ? [5, ...base] : base).filter((m) => m <= max);
}

/**
 * How long to give the unit to honour a stop before calling it overridden.
 *
 * The coordinator polls every 15 s and the unit's own mode bit lags a further
 * cycle, so a genuine stop can take ~30 s to show up. Anything still running
 * after that is being held on by the unit, not by a slow read.
 */
const STOP_GRACE_MS = 35_000;

/**
 * Minimum time to hold the "stopping" state before believing a success.
 *
 * The coordinator updates its cached value optimistically the moment a write is
 * accepted, so the countdown reads 0 before the unit has been polled at all.
 * Judging success from that would close the dialog instantly and miss exactly
 * the case this check exists for — a unit that quietly re-arms the function.
 */
const STOP_MIN_DWELL_MS = 6_000;

function formatMinutes(t: Lookup, minutes: number): string {
  if (minutes <= 0) return t('off');
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = t('hourShort');
  const min = t('minuteLong');
  if (hours && rest) return `${hours} ${h} ${rest} ${min}`;
  if (hours) return `${hours} ${h}`;
  return `${rest} ${min}`;
}

/** The card's own string lookup, passed to the helpers that render text. */
type Lookup = (key: StringKey, vars?: Record<string, string | number>) => string;

export class FuturaControlCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
    picker: { state: true },
    awayPicker: { state: true },
    stopState: { state: true },
  };

  hass?: Hass;
  private config: ControlCardConfig = {
    type: 'custom:futura-control-card',
  };
  /** The function whose duration is being chosen, and the chosen minutes. */
  private picker?: { fn: FunctionChip; minutes: number };
  /** The vacancy period being edited, as datetime-local strings. */
  private awayPicker?: { begin: string; end: string };
  /** Tracks a stop request so an override by the unit can be reported. */
  private stopState?: {
    fn: FunctionChip;
    phase: 'waiting' | 'overridden';
    since: number;
  };
  private stopTimeout?: number;

  static override styles = [
    sharedStyles,
    css`
      ha-card {
        position: relative;
      }

      .title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 14px;
      }

      section {
        margin-bottom: 18px;
      }

      section:last-of-type {
        margin-bottom: 0;
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 10px;
      }

      .head .name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
      }

      .head .current {
        font-size: 0.95rem;
        color: var(--futura-muted);
        font-variant-numeric: tabular-nums;
      }

      .levels {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
      }

      .modes {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      button.level {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 10px 0;
        border-radius: ${cssVal(t.RADIUS.button)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-weight: 600;
        transition: background 0.2s ease, color 0.2s ease;
      }

      button.level:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      button.level[aria-pressed='true'] {
        background: var(--futura-accent);
        color: ${cssVal(t.ACCENT_INK)};
      }

      button.level:focus-visible {
        outline: 2px solid var(--futura-accent);
        outline-offset: 2px;
      }

      .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: var(--futura-panel);
        border-radius: ${cssVal(t.RADIUS.button)};
        padding: 8px 12px;
      }

      .stepper .target {
        font-size: 1.5rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .stepper button {
        appearance: none;
        border: none;
        cursor: pointer;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: var(--futura-text);
        font-size: 1.3rem;
        line-height: 1;
      }

      .stepper button:hover:not([disabled]) {
        background: rgba(255, 255, 255, 0.18);
      }

      .stepper button[disabled] {
        opacity: 0.35;
        cursor: default;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      button.chip {
        appearance: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: ${cssVal(t.RADIUS.chip)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-size: 0.85rem;
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }

      button.chip[data-active='true'] {
        background: rgba(143, 195, 107, 0.22);
        box-shadow: inset 0 0 0 1px var(--futura-accent);
        color: var(--futura-accent);
      }

      button.chip .time {
        font-variant-numeric: tabular-nums;
        opacity: 0.85;
      }

      ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Duration picker. Positioned over the card rather than in a native
         <dialog>, which cannot escape a Lovelace card's stacking context. */
      .scrim {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: grid;
        place-items: center;
        border-radius: var(--futura-radius);
        z-index: 5;
      }

      .dialog {
        width: min(340px, calc(100% - 32px));
        background: var(--futura-bg);
        border-radius: ${cssVal(t.RADIUS.canvas)};
        padding: 18px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .dialog-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        font-weight: 600;
      }

      .dialog-head .running {
        margin-left: auto;
        font-size: 0.8rem;
        font-weight: 400;
        color: var(--futura-accent);
      }

      .notice {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px;
        border-radius: ${cssVal(t.RADIUS.button)};
        background: var(--futura-panel);
      }

      .notice.warn {
        background: rgba(217, 86, 79, 0.14);
        box-shadow: inset 0 0 0 1px rgba(217, 86, 79, 0.4);
      }

      .notice ha-icon {
        flex: none;
        margin-top: 1px;
        color: var(--futura-muted);
      }

      .notice.warn ha-icon {
        color: var(--futura-poor);
      }

      .notice strong {
        font-size: 0.92rem;
      }

      .notice p {
        margin: 4px 0 0;
        font-size: 0.8rem;
        line-height: 1.45;
        color: var(--futura-muted);
      }

      .readout {
        text-align: center;
        font-size: 1.7rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .slider {
        width: 100%;
        accent-color: var(--futura-accent);
      }

      .scale {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--futura-muted);
        margin-top: -8px;
      }

      .quick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .quick .chip {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: ${cssVal(t.RADIUS.chip)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-size: 0.78rem;
      }

      .quick .chip.on {
        background: var(--futura-accent);
        color: ${cssVal(t.ACCENT_INK)};
      }

      /* The vacancy dialog's two datetime fields. */
      .field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 0.92rem;
        color: var(--futura-muted);
      }

      .field input {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        max-width: 62%;
        background: var(--futura-panel);
        color: var(--futura-text);
        border: 1px solid ${cssVal(t.BORDER)};
        border-radius: ${cssVal(t.RADIUS.button)};
        padding: 9px 11px;
        font: inherit;
        font-size: 0.95rem;
        font-variant-numeric: tabular-nums;
      }

      .field input::-webkit-calendar-picker-indicator {
        /* The stock indicator is near-black on this ground. */
        filter: invert(1) opacity(0.65);
        cursor: pointer;
      }

      .field input:focus-visible {
        outline: 2px solid var(--futura-accent);
        outline-offset: 1px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
        flex-wrap: wrap;
      }

      .actions button {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 9px 16px;
        border-radius: ${cssVal(t.RADIUS.button)};
        font: inherit;
        font-weight: 600;
      }

      .actions .ghost {
        background: var(--futura-panel);
        color: var(--futura-text);
      }

      .actions .stop {
        color: var(--futura-poor);
      }

      .actions .primary {
        background: var(--futura-accent);
        color: ${cssVal(t.ACCENT_INK)};
      }

      .actions .primary[disabled] {
        opacity: 0.4;
        cursor: default;
      }
    `,
  ];

  setConfig(config: ControlCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    this.config = { show_functions: true, show_humidity: true, ...config };
  }

  getCardSize(): number {
    return 5;
  }

  static getStubConfig(): ControlCardConfig {
    return { type: 'custom:futura-control-card' };
  }

  /**
   * The object id this unit's entities start with, from the same `prefix` the
   * other cards take: `sensor.jablotron_futura` gives `jablotron_futura`, which
   * this card needs under six domains. A renamed device is that one option
   * rather than a dozen.
   */
  private get base(): string {
    return (this.config.prefix ?? DEFAULT_PREFIX).replace(/^[a-z_]+\./, '');
  }

  private get chips(): FunctionChip[] {
    return functionChips(this.base);
  }

  private get away() {
    return awayEntities(this.base);
  }

  /**
   * Which unit the integration's services should act on.
   *
   * With one unit configured they need no target; with two they refuse a call
   * without one. The ventilation select belongs to this card's unit, so its
   * device is the target. Left out until the registries load, which only
   * matters if a second unit exists -- and then the call fails visibly.
   */
  private get target(): { device_id?: string } {
    const id = deviceId(this.hass, this.selectEntity);
    return id ? { device_id: id } : {};
  }

  private get selectEntity(): string {
    return this.config.ventilation_select ?? `select.${this.base}_ventilation`;
  }

  /** A visible string, translated if the dashboard supplied an override. */
  private t(key: LabelKey, vars?: Record<string, string | number>): string {
    return this.config.labels?.[key] ?? text(this.hass, key, vars);
  }

  /** `t` as a value, for the helpers that render text outside the class. */
  private get lookup(): Lookup {
    return (key, vars) => this.t(key, vars);
  }

  private get humidityEntity(): string {
    return this.config.humidity_select ?? `select.${this.base}_humidity_mode`;
  }

  private get climateEntity(): string {
    return this.config.climate ?? `climate.${this.base}`;
  }

  private async setLevel(level: string): Promise<void> {
    await this.hass?.callService('select', 'select_option', {
      entity_id: this.selectEntity,
      option: level,
    });
  }

  private async nudge(delta: number): Promise<void> {
    const climate = this.hass?.states[this.climateEntity];
    const current = Number(climate?.attributes?.temperature);
    if (!Number.isFinite(current)) return;

    // Clamp to the entity's own limits. Without this the buttons happily send a
    // value the unit refuses, and the only feedback is an error toast.
    const min = Number(climate?.attributes?.min_temp);
    const max = Number(climate?.attributes?.max_temp);
    const step = Number(climate?.attributes?.target_temp_step) || 0.5;
    let next = current + delta;
    next = Math.round(next / step) * step;
    if (Number.isFinite(min)) next = Math.max(min, next);
    if (Number.isFinite(max)) next = Math.min(max, next);
    if (next === current) return;

    await this.hass?.callService('climate', 'set_temperature', {
      entity_id: this.climateEntity,
      temperature: next,
    });
  }

  /** Whether a further nudge in this direction would do anything. */
  private atLimit(delta: number): boolean {
    const climate = this.hass?.states[this.climateEntity];
    const current = Number(climate?.attributes?.temperature);
    if (!Number.isFinite(current)) return true;
    const bound = Number(
      climate?.attributes?.[delta < 0 ? 'min_temp' : 'max_temp'],
    );
    if (!Number.isFinite(bound)) return false;
    return delta < 0 ? current <= bound : current >= bound;
  }

  private async setHumidity(option: string): Promise<void> {
    await this.hass?.callService('select', 'select_option', {
      entity_id: this.humidityEntity,
      option,
    });
  }

  private humidity(): TemplateResult | typeof nothing {
    if (this.config.show_humidity === false) return nothing;
    // Only render once the entity exists, so a trimmed-down setup shows nothing
    // rather than three buttons that cannot do anything.
    if (!this.hass?.states[this.humidityEntity]) return nothing;
    const current = str(this.hass, this.humidityEntity);
    return html`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:water-percent"></ha-icon>${this.t('humidity')}
          </span>
          <span class="current">
            ${current
              ? this.t(current as LabelKey)
              : '--'}
          </span>
        </div>
        <div class="modes">
          ${HUMIDITY_MODES.map(
            (mode) => html`
              <button
                class="level"
                aria-pressed=${current === mode.option ? 'true' : 'false'}
                @click=${() => this.setHumidity(mode.option)}
              >
                ${this.t(mode.label)}
              </button>
            `,
          )}
        </div>
      </section>
    `;
  }

  /** The unit's own ceiling for this function, in minutes. */
  private maxMinutes(fn: FunctionChip): number {
    const limit = Number(this.hass?.states[fn.limit]?.attributes?.max);
    return Number.isFinite(limit) && limit > 0 ? Math.round(limit / 60) : 120;
  }

  private openPicker(fn: FunctionChip): void {
    const running = num(this.hass, fn.remaining) ?? 0;
    const suggested = running > 0
      ? Math.ceil(running / 60 / STEP_MINUTES) * STEP_MINUTES
      : Math.min(60, this.maxMinutes(fn));
    this.picker = { fn, minutes: Math.min(suggested, this.maxMinutes(fn)) };
  }

  /** Seed the calendar from the unit when away is set, otherwise now to +7 d. */
  private openAwayPicker(): void {
    const begins = stateDate(this.hass, this.away.begins);
    const ends = stateDate(this.hass, this.away.ends);
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    this.awayPicker = {
      begin: toLocalInput(begins ?? now),
      end: toLocalInput(ends ?? week),
    };
  }

  private closeAwayPicker(): void {
    this.awayPicker = undefined;
  }

  private async setAway(begin: string, end: string): Promise<void> {
    // The inputs are naive local times and the registers hold local-time
    // timestamps, so the strings go straight through -- no zone conversion,
    // which is the bug to avoid here.
    await this.hass?.callService(DOMAIN, 'set_away', { ...this.target, begin, end });
    this.closeAwayPicker();
  }

  private async clearAway(): Promise<void> {
    await this.hass?.callService(DOMAIN, 'clear_away', { ...this.target });
    this.closeAwayPicker();
  }

  private closePicker(): void {
    window.clearTimeout(this.stopTimeout);
    this.picker = undefined;
    this.stopState = undefined;
  }

  private async runFunction(fn: FunctionChip, minutes: number): Promise<void> {
    // The integration's own service enforces each function's range, so the card
    // does not have to duplicate those rules.
    await this.hass?.callService(DOMAIN, 'set_function', {
      ...this.target,
      function: fn.key,
      duration: Math.round(minutes) * 60,
    });
    this.closePicker();
  }

  /**
   * Stop a function and check the unit obeyed.
   *
   * Writing 0 always succeeds at the Modbus level, but the unit can re-arm a
   * function straight away — a latched kitchen-hood or boost input holds
   * overpressure on indefinitely, for instance. Without this check the register
   * flicks to 0 and back and the button just looks broken.
   */
  private async stopFunction(fn: FunctionChip): Promise<void> {
    this.stopState = { fn, phase: 'waiting', since: Date.now() };
    await this.hass?.callService(DOMAIN, 'set_function', {
      ...this.target,
      function: fn.key,
      duration: 0,
    });
    window.clearTimeout(this.stopTimeout);
    this.stopTimeout = window.setTimeout(
      () => this.judgeStop(),
      STOP_GRACE_MS,
    );
  }

  /** True once both the countdown and the unit's own mode flag have cleared. */
  private hasStopped(fn: FunctionChip): boolean {
    return (num(this.hass, fn.remaining) ?? 0) <= 0 && !isOn(this.hass, fn.active);
  }

  private judgeStop(): void {
    const pending = this.stopState;
    if (!pending) return;
    this.stopState = this.hasStopped(pending.fn)
      ? undefined
      : { fn: pending.fn, phase: 'overridden', since: pending.since };
    if (!this.stopState) this.closePicker();
  }

  protected override willUpdate(changed: PropertyValues): void {
    // Close as soon as the stop lands, rather than sitting out the full grace.
    if (
      changed.has('hass')
      && this.stopState?.phase === 'waiting'
      && Date.now() - this.stopState.since >= STOP_MIN_DWELL_MS
      && this.hasStopped(this.stopState.fn)
    ) {
      window.clearTimeout(this.stopTimeout);
      this.stopState = undefined;
      this.picker = undefined;
    }
  }

  override disconnectedCallback(): void {
    window.clearTimeout(this.stopTimeout);
    super.disconnectedCallback();
  }

  private async stopAll(): Promise<void> {
    await this.hass?.callService('button', 'press', {
      entity_id: `button.${this.base}_stop_all_functions`,
    });
  }

  /** Shown in place of the slider while a stop is being confirmed. */
  private stopNotice(): TemplateResult {
    if (this.stopState?.phase === 'waiting') {
      return html`
        <div class="notice">
          <ha-icon icon="mdi:timer-sand"></ha-icon>
          <div>
            <strong>${this.t('stopping')}</strong>
            <p>${this.t('stoppingHint')}</p>
          </div>
        </div>
      `;
    }
    return html`
      <div class="notice warn">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <div>
          <strong>${this.t('overriddenTitle')}</strong>
          <p>${this.t('overriddenBody')}</p>
        </div>
      </div>
    `;
  }

  private awayDialog(): TemplateResult | typeof nothing {
    const picker = this.awayPicker;
    if (!picker) return nothing;
    const active = isOn(this.hass, this.away.active);
    const invalid = !picker.begin || !picker.end || picker.end <= picker.begin;

    return html`
      <div
        class="scrim"
        @click=${(event: Event) => {
          if (event.target === event.currentTarget) this.closeAwayPicker();
        }}
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.t('vacancy')}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'Escape') this.closeAwayPicker();
          }}
        >
          <div class="dialog-head">
            <ha-icon icon="mdi:calendar-account"></ha-icon>
            <span>${this.t('vacancy')}</span>
          </div>

          <label class="field">
            <span>${this.t('from')}</span>
            <input
              type="datetime-local"
              .value=${picker.begin}
              @input=${(event: Event) => {
                const value = (event.target as HTMLInputElement).value;
                this.awayPicker = { ...picker, begin: value };
              }}
            />
          </label>

          <label class="field">
            <span>${this.t('until')}</span>
            <input
              type="datetime-local"
              .value=${picker.end}
              min=${picker.begin}
              @input=${(event: Event) => {
                const value = (event.target as HTMLInputElement).value;
                this.awayPicker = { ...picker, end: value };
              }}
            />
          </label>

          <div class="actions">
            <button class="ghost" @click=${() => this.closeAwayPicker()}>
              ${this.t('cancel')}
            </button>
            ${active
              ? html`<button class="ghost" @click=${() => this.clearAway()}>
                  ${this.t('clearVacancy')}
                </button>`
              : nothing}
            <button
              class="primary"
              ?disabled=${invalid}
              @click=${() => this.setAway(picker.begin, picker.end)}
            >
              ${this.t('save')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private pickerDialog(): TemplateResult | typeof nothing {
    const picker = this.picker;
    if (!picker) return nothing;
    const { fn, minutes } = picker;
    const max = this.maxMinutes(fn);
    const running = num(this.hass, fn.remaining) ?? 0;

    return html`
      <div
        class="scrim"
        @click=${(event: Event) => {
          if (event.target === event.currentTarget) this.closePicker();
        }}
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.t('ariaFunctionDuration', { function: this.t(fn.label) })}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'Escape') this.closePicker();
          }}
        >
          <div class="dialog-head">
            <ha-icon icon=${fn.icon}></ha-icon>
            <span>${this.t(fn.label)}</span>
            ${running > 0
              ? html`<span class="running">
                  ${countdown(this.hass, running)} ${this.t('left')}
                </span>`
              : nothing}
          </div>

          ${this.stopState?.fn.key === fn.key
            ? this.stopNotice()
            : html`<div class="readout">${formatMinutes(this.lookup, minutes)}</div>`}

          ${this.stopState?.fn.key === fn.key ? nothing : html`
          <input
            class="slider"
            type="range"
            min="0"
            max=${max}
            step=${STEP_MINUTES}
            .value=${String(minutes)}
            aria-label=${this.t('ariaDuration')}
            @input=${(event: Event) => {
              const value = Number((event.target as HTMLInputElement).value);
              this.picker = { fn, minutes: value };
            }}
          />
          <div class="scale">
            <span>${this.t('off')}</span><span>${formatMinutes(this.lookup, max)}</span>
          </div>`}

          <div class="quick" ?hidden=${this.stopState?.fn.key === fn.key}>
            ${quickMinutes(max)
              .map(
                (m) => html`
                  <button
                    class=${m === minutes ? 'chip on' : 'chip'}
                    @click=${() => { this.picker = { fn, minutes: m }; }}
                  >
                    ${formatMinutes(this.lookup, m)}
                  </button>
                `,
              )}
          </div>

          <div class="actions">
            <button class="ghost" @click=${() => this.closePicker()}>
              ${this.t('cancel')}
            </button>
            ${running > 0 && this.stopState?.fn.key !== fn.key
              ? html`<button class="ghost stop"
                       @click=${() => this.stopFunction(fn)}>
                       ${this.t('stop')}</button>`
              : nothing}
            ${this.stopState?.fn.key === fn.key
              ? nothing
              : html`
                  <button
                    class="primary"
                    ?disabled=${minutes <= 0}
                    @click=${() => this.runFunction(fn, minutes)}
                  >
                    ${this.t('start')}
                  </button>
                `}
          </div>
        </div>
      </div>
    `;
  }

  private ventilation(): TemplateResult {
    const current = str(this.hass, this.selectEntity);
    return html`
      <section>
        <div class="head">
          <span class="name"><ha-icon icon="mdi:fan"></ha-icon>${this.t('ventilation')}</span>
          <span class="current">
            ${current === 'auto' ? this.t('auto') : current ?? '--'}
          </span>
        </div>
        <div class="levels">
          ${LEVELS.map(
            (level) => html`
              <button
                class="level"
                aria-pressed=${current === level ? 'true' : 'false'}
                title=${level === 'off' ? this.t('off')
                  : level === 'auto' ? this.t('automatic')
                  : this.t('level', { level })}
                @click=${() => this.setLevel(level)}
              >
                ${level === 'off' ? '0' : level === 'auto' ? 'A' : level}
              </button>
            `,
          )}
        </div>
      </section>
    `;
  }

  private temperature(): TemplateResult {
    const climate = this.hass?.states[this.climateEntity];
    const target = Number(climate?.attributes?.temperature);
    const indoor = Number(climate?.attributes?.current_temperature);
    return html`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:thermometer"></ha-icon>${this.t('temperature')}
          </span>
          <span class="current">
            ${Number.isFinite(indoor)
              ? `${indoor.toFixed(1)} °C ${this.t('now')}`
              : '--'}
          </span>
        </div>
        <div class="stepper">
          <button
            ?disabled=${this.atLimit(-0.5)}
            @click=${() => this.nudge(-0.5)}
            aria-label=${this.t('ariaLower')}
          >
            &minus;
          </button>
          <span class="target">
            ${Number.isFinite(target) ? target.toFixed(1) : '--'} °C
          </span>
          <button
            ?disabled=${this.atLimit(0.5)}
            @click=${() => this.nudge(0.5)}
            aria-label=${this.t('ariaRaise')}
          >
            &plus;
          </button>
        </div>
      </section>
    `;
  }

  /** Vacancy, showing the date it runs to rather than a countdown. */
  private awayChip(): TemplateResult | typeof nothing {
    if (this.hass?.states[this.away.ends] === undefined) return nothing;
    const active = isOn(this.hass, this.away.active);
    const ends = stateDate(this.hass, this.away.ends);
    // A date, not a countdown: "6 days left" is the wrong shape for something
    // you set on a calendar and read off one.
    const label = active && ends
      ? ends.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
      : '';
    return html`
      <button
        class="chip"
        data-active=${active ? 'true' : 'false'}
        title=${this.t('vacancy')}
        @click=${() => this.openAwayPicker()}
      >
        <ha-icon icon="mdi:calendar-account"></ha-icon>${this.t('vacancy')}
        ${label ? html`<span class="time">${label}</span>` : nothing}
      </button>
    `;
  }

  private functions(): TemplateResult | typeof nothing {
    if (this.config.show_functions === false) return nothing;
    const available = this.chips.filter(
      (fn) => this.hass?.states[fn.remaining] !== undefined,
    );
    // Vacancy can stand alone: it is not one of the timer functions, so an
    // otherwise empty row still shows it.
    if (!available.length && this.hass?.states[this.away.ends] === undefined) {
      return nothing;
    }
    return html`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:timer-outline"></ha-icon>${this.t('functions')}
          </span>
        </div>
        <div class="chips">
          ${available.map((fn) => {
            const active = isOn(this.hass, fn.active);
            const left = countdown(this.hass, num(this.hass, fn.remaining));
            return html`
              <button
                class="chip"
                data-active=${active ? 'true' : 'false'}
                title=${`${this.t('duration')}: ${this.t(fn.label)}`}
                @click=${() => this.openPicker(fn)}
              >
                <ha-icon icon=${fn.icon}></ha-icon>${this.t(fn.label)}
                ${left ? html`<span class="time">${left}</span>` : nothing}
              </button>
            `;
          })}
          ${this.awayChip()}
          ${available.some((fn) => (num(this.hass, fn.remaining) ?? 0) > 0)
            ? html`
                <button class="chip" @click=${() => this.stopAll()}>
                  <ha-icon icon="mdi:stop-circle-outline"></ha-icon>${this.t('stopAll')}
                </button>
              `
            : nothing}
        </div>
      </section>
    `;
  }

  override render(): TemplateResult {
    if (!this.hass) return html`<ha-card></ha-card>`;
    if (!this.hass.states[this.selectEntity]) {
      return html`<ha-card>
        ${errorRow(this.t('entityMissing', { entity: this.selectEntity }))}
      </ha-card>`;
    }
    return html`
      <ha-card>
        <!-- No title in the config means the card's own heading, in the
             frontend's language; an empty one means no heading at all. -->
        ${(this.config.title ?? this.t('controls'))
          ? html`<div class="title">${this.config.title ?? this.t('controls')}</div>`
          : nothing}
        ${this.ventilation()} ${this.temperature()} ${this.humidity()}
        ${this.functions()} ${this.pickerDialog()} ${this.awayDialog()}
      </ha-card>
    `;
  }
}
