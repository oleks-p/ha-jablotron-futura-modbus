/**
 * A trend chart over whichever peripherals a unit actually has.
 *
 * Naming six sensors in dashboard YAML only works for the installation it was
 * written on. This discovers the entities at render time and hands them to one
 * of Home Assistant's own chart cards, so the same dashboard travels to any
 * Futura — three CO2 sensors, eight, or none at all.
 *
 * It delegates to `statistics-graph` rather than `history-graph`. Over two days
 * a raw history plot of six sensors polled every 15 s is a thicket: hundreds of
 * points per series, every one of them noise around a slow trend. Hourly means
 * carry the same shape, draw far less, and load from the long-term statistics
 * table instead of the full state history. Set `raw: true` for the unsmoothed
 * plot where short-lived detail matters.
 *
 * Buckets are five minutes wide by default, which removes the sample-to-sample
 * jitter without rounding off a real step. `period: hour` smooths harder and is
 * retained much longer -- Home Assistant purges the 5-minute statistics well
 * before the hourly ones, so a window of more than a few days wants hourly.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, type TemplateResult } from 'lit';
import {
  DEFAULT_PREFIX,
  type Hass,
  METRICS,
  type Metric,
  discoverPeripherals,
  sharedStyles,
  shortName,
} from './shared';

export interface HistoryCardConfig {
  type: string;
  metric?: Metric;
  prefix?: string;
  title?: string;
  hours_to_show?: number;
  /** Plot raw state history instead of statistics. */
  raw?: boolean;
  /** Statistics bucket width. Hourly is retained far longer than 5-minute. */
  period?: '5minute' | 'hour' | 'day' | 'week' | 'month';
}

interface InnerCard extends HTMLElement {
  hass?: Hass;
  setConfig?: (config: unknown) => void;
}

export class FuturaHistoryCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: HistoryCardConfig = { type: 'custom:futura-history-card' };
  /** The delegated built-in card, rebuilt only when the entity set changes. */
  private inner?: InnerCard;
  private signature = '';

  static override styles = [
    sharedStyles,
    css`
      ha-card {
        background: none;
        border: none;
        box-shadow: none;
        padding: 0;
      }
    `,
  ];

  setConfig(config: HistoryCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    const metric = config.metric ?? 'co2';
    if (!(metric in METRICS)) {
      throw new Error(`metric must be one of ${Object.keys(METRICS).join(', ')}`);
    }
    this.config = { metric, hours_to_show: 48, ...config };
    // A config change invalidates the delegated card.
    this.signature = '';
    this.inner = undefined;
  }

  getCardSize(): number {
    return 4;
  }

  static getStubConfig(): HistoryCardConfig {
    return { type: 'custom:futura-history-card', metric: 'co2' };
  }

  private get metric(): Metric {
    return this.config.metric ?? 'co2';
  }

  private get chartTitle(): string {
    return this.config.title ?? `${METRICS[this.metric].label} per sensor`;
  }

  /** Build or refresh the inner card when the discovered entities change. */
  private async sync(entities: string[]): Promise<void> {
    const signature = entities.join(',');
    if (signature === this.signature && this.inner) {
      this.inner.hass = this.hass;
      return;
    }

    const helpers = await (
      window as unknown as {
        loadCardHelpers?: () => Promise<{
          createCardElement: (config: unknown) => InnerCard;
        }>;
      }
    ).loadCardHelpers?.();
    if (!helpers) return;

    this.signature = signature;
    const hours = this.config.hours_to_show ?? 48;
    const metric = METRICS[this.metric];
    const named = entities.map((entity) => ({
      entity,
      name: shortName(this.hass, entity, this.metric),
    }));
    const axis = {
      min_y_axis: metric.min,
      max_y_axis: metric.max,
      // Soft bounds: the axis holds still normally but still shows an outlier.
      fit_y_data: true,
    };
    const card = helpers.createCardElement(
      this.config.raw
        ? {
            type: 'history-graph',
            title: this.chartTitle,
            hours_to_show: hours,
            entities: named,
            ...axis,
          }
        : {
            type: 'statistics-graph',
            title: this.chartTitle,
            // statistics-graph counts in days, and rounds up so a part-day
            // window still asks for the day that contains it.
            days_to_show: Math.max(1, Math.ceil(hours / 24)),
            period: this.config.period ?? '5minute',
            stat_types: ['mean'],
            chart_type: 'line',
            entities: named,
            ...axis,
          },
    );
    card.hass = this.hass;
    this.inner = card;
    this.requestUpdate();
  }

  override render(): TemplateResult | typeof nothing {
    const entities = discoverPeripherals(
      this.hass,
      this.config.prefix ?? DEFAULT_PREFIX,
      this.metric,
    );
    // Nothing to plot on a unit without peripherals; render no card at all
    // rather than an empty frame.
    if (!entities.length) return nothing;

    void this.sync(entities);
    return html`${this.inner ?? nothing}`;
  }
}
