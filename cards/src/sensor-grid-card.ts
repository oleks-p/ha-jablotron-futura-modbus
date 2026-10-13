/**
 * The peripheral tiles from the app's Devices screens.
 *
 * Sensors are discovered from the entity registry rather than listed by hand, so
 * the grid matches whatever the unit reports as connected.
 */
import * as t from './tokens';
import { LitElement, type PropertyDeclarations, css, html, type TemplateResult } from 'lit';
import {
  DEFAULT_PREFIX,
  type Hass,
  METRICS,
  type Metric,
  cssVal,
  discoverPeripherals,
  fmt,
  sharedStyles,
  shortName,
} from './shared';

export interface SensorGridConfig {
  type: string;
  title?: string;
  prefix?: string;
  metric?: Metric;
  columns?: number;
}

interface Tile {
  entityId: string;
  name: string;
  value: number | undefined;
}

export class FuturaSensorGridCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: SensorGridConfig = {
    type: 'custom:futura-sensor-grid-card',
    metric: 'co2',
  };

  static override styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 1rem;
        font-weight: 600;
      }

      .grid {
        display: grid;
        gap: 8px;
      }

      /* Same geometry as the shared readout pill, at tile scale. */
      .tile {
        background: var(--futura-panel);
        border-radius: ${cssVal(t.RADIUS.pill)};
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .tile .name {
        font-size: 0.75rem;
        color: var(--futura-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tile .value {
        font-size: 1.35rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .tile .value .unit {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--futura-muted);
      }

      .empty {
        color: var(--futura-muted);
        font-size: 0.9rem;
      }
    `,
  ];

  setConfig(config: SensorGridConfig): void {
    if (!config) throw new Error('Missing configuration');
    if (config.metric && !(config.metric in METRICS)) {
      throw new Error(`metric must be one of ${Object.keys(METRICS).join(', ')}`);
    }
    this.config = { metric: 'co2', columns: 3, ...config };
  }

  getCardSize(): number {
    return 3;
  }

  static getStubConfig(): SensorGridConfig {
    return { type: 'custom:futura-sensor-grid-card', metric: 'co2' };
  }

  /** Tiles for whichever peripherals this unit reports. */
  private tiles(): Tile[] {
    const metric = this.config.metric ?? 'co2';
    return discoverPeripherals(
      this.hass,
      this.config.prefix ?? DEFAULT_PREFIX,
      metric,
    ).map((entityId) => {
      const value = Number(this.hass!.states[entityId].state);
      return {
        entityId,
        name: shortName(this.hass, entityId, metric),
        value: Number.isFinite(value) ? value : undefined,
      };
    });
  }

  private open(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    if (!this.hass) return html`<ha-card></ha-card>`;
    const metric = METRICS[this.config.metric ?? 'co2'];
    const tiles = this.tiles();
    const columns = Math.max(1, Math.min(6, this.config.columns ?? 3));

    return html`
      <ha-card>
        <div class="head">
          <ha-icon icon=${metric.icon}></ha-icon>
          ${this.config.title ?? metric.label}
        </div>
        ${tiles.length === 0
          ? html`<div class="empty">No peripheral sensors reporting.</div>`
          : html`
              <div
                class="grid"
                style=${`grid-template-columns:repeat(${columns},minmax(0,1fr))`}
              >
                ${tiles.map(
                  (tile) => html`
                    <div
                      class="tile"
                      role="button"
                      tabindex="0"
                      @click=${() => this.open(tile.entityId)}
                      @keydown=${(event: KeyboardEvent) =>
                        event.key === 'Enter' && this.open(tile.entityId)}
                    >
                      <span class="name" title=${tile.name}>${tile.name}</span>
                      <span class="value">
                        ${fmt(tile.value, metric.digits)}
                        <span class="unit">${metric.unit}</span>
                      </span>
                    </div>
                  `,
                )}
              </div>
            `}
      </ha-card>
    `;
  }
}
