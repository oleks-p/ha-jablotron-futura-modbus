/**
 * One card that draws whichever of the four schematics you pick.
 *
 * There are four views of the same unit now -- the app's air-flow screen, the
 * plumbing schematic, the service view and the manual's line diagram -- and
 * stacking all four down a dashboard is more than anyone wants at once. This is a
 * thin shell around them: choose a variant in the card's own settings and it draws
 * that one. Add a second copy with a different variant to see two side by side.
 *
 * It owns no drawing of its own. Everything except `variant` and `variant_entity`
 * is passed through to the chosen card untouched, so options that belong to one of
 * them -- the flow card's `show_outdoor`, say -- keep working here.
 *
 * Point `variant_entity` at an `input_select` and the choice moves out of the
 * card's settings and onto the dashboard, which is the difference between looking
 * at another view and editing a dashboard to look at another view.
 */
import { LitElement, type PropertyDeclarations, css, html, nothing, type TemplateResult } from 'lit';
import { type Hass, errorRow } from './shared';
import { text, type StringKey } from './i18n';

export interface SchematicsCardConfig {
  type: string;
  /** Which schematic to draw. Ignored while `variant_entity` names a live one. */
  variant?: Variant;
  /**
   * An `input_select` (or any entity) whose state chooses the schematic, so it can
   * be switched from the dashboard rather than by editing the card.
   */
  variant_entity?: string;
  [option: string]: unknown;
}

export type Variant = 'flow' | 'unit' | 'service' | 'diagram';

interface VariantSpec {
  tag: string;
  label: StringKey;
  /**
   * What an `input_select` option should read, and what its state is matched
   * against. Shorter than `label`, whose parenthetical belongs in a settings
   * dropdown and not in a helper's options.
   *
   * Matching is against the English wording as well as the translated one, so a
   * helper written in English keeps working on a frontend in another language --
   * and so does one written in that language. The integration's own select
   * reports the variant key, which matches whatever the frontend's language is.
   */
  option: StringKey;
  /** One line on what this view is for, shown under the picker. */
  hint: StringKey;
}

/**
 * The four, in the order they were built, which is also roughly least to most
 * technical.
 */
export const VARIANTS: Record<Variant, VariantSpec> = {
  flow: {
    option: 'variantFlow',
    tag: 'futura-flow-card',
    label: 'variantFlowLabel',
    hint: 'variantFlowHint',
  },
  unit: {
    option: 'variantUnit',
    tag: 'futura-unit-card',
    label: 'variantUnitLabel',
    hint: 'variantUnitHint',
  },
  service: {
    option: 'variantService',
    tag: 'futura-schematic-card',
    label: 'variantServiceLabel',
    hint: 'variantServiceHint',
  },
  diagram: {
    option: 'variantDiagram',
    tag: 'futura-diagram-card',
    label: 'variantDiagramLabel',
    hint: 'variantDiagramHint',
  },
};

const DEFAULT_VARIANT: Variant = 'flow';

/** A child card, as much of its interface as this needs. */
type ChildCard = HTMLElement & {
  hass?: Hass;
  setConfig(config: Record<string, unknown>): void;
  getCardSize?(): number;
};

export class FuturaSchematicsCard extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  private _hass?: Hass;
  private config: SchematicsCardConfig = { type: 'custom:futura-schematics-card' };
  private child?: ChildCard;

  static override styles = css`
    :host {
      display: block;
    }
  `;

  /**
   * Forwarded straight to the child on every frame.
   *
   * A setter rather than a plain field because the child is not in the template
   * as an element -- it is a node this card creates -- so nothing would otherwise
   * push new state into it, and the drawing would freeze at whatever it read on
   * the first render.
   */
  set hass(hass: Hass | undefined) {
    const was = this.variant;
    this._hass = hass;
    // The helper can change the variant between frames, so the child is checked
    // here as well as in setConfig -- otherwise switching the input_select would
    // update nothing until the dashboard was reloaded.
    if (this.variant !== was) {
      this.child = undefined;
      this.requestUpdate();
      return;
    }
    if (this.child) this.child.hass = hass;
  }

  get hass(): Hass | undefined {
    return this._hass;
  }

  setConfig(config: SchematicsCardConfig): void {
    if (!config) throw new Error('Missing configuration');
    const variant = config.variant ?? DEFAULT_VARIANT;
    if (!(variant in VARIANTS)) {
      throw new Error(
        `Unknown variant "${variant}". Pick one of: ${Object.keys(VARIANTS).join(', ')}.`,
      );
    }
    this.config = { ...config };
    // Rebuilt rather than reconfigured: a different variant is a different
    // element, and the same one is cheap enough to make again.
    this.child = undefined;
  }

  static getStubConfig(): SchematicsCardConfig {
    return { type: 'custom:futura-schematics-card', variant: DEFAULT_VARIANT };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement('futura-schematics-card-editor');
  }

  /**
   * The variant to draw: from `variant_entity` if it names a live one, else the
   * configured `variant`.
   *
   * An entity's state is matched against both the variant key and its option
   * label, case- and space-insensitively, so an `input_select` can carry readable
   * options ("Airflow diagram") without the card needing a mapping table in its
   * config. Anything unrecognised returns undefined so the caller can say so:
   * falling back silently would leave a mistyped option looking like a card that
   * ignores its helper.
   */
  private static normalise(state: string): string {
    // Letters and digits in any script: the option labels are translated, and
    // an ASCII-only strip would reduce a Ukrainian option to nothing and match
    // every variant at once.
    return state.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  }

  private match(state: string): Variant | undefined {
    const key = FuturaSchematicsCard.normalise(state);
    const same = (option: StringKey, hass: Hass | undefined) =>
      FuturaSchematicsCard.normalise(text(hass, option)) === key;
    // `undefined` for hass is the English table: a helper written in English
    // keeps working after the frontend is switched to another language.
    return (Object.keys(VARIANTS) as Variant[]).find(
      (v) => v === key || same(VARIANTS[v].option, this._hass)
        || same(VARIANTS[v].option, undefined),
    );
  }

  private get variant(): Variant {
    return this.selected ?? this.config.variant ?? DEFAULT_VARIANT;
  }

  /**
   * The helper's raw state.
   *
   * Read straight off `hass` rather than through the shared `str`, which folds
   * `unavailable` and `unknown` into undefined. Those two need telling apart from
   * a missing entity here: one is a helper that has not started yet, the other is
   * a typo in the card's config, and only the second deserves an error.
   */
  private get helperState(): string | undefined {
    const entity = this.config.variant_entity;
    return entity ? this._hass?.states[entity]?.state : undefined;
  }

  /** What the helper currently says, or undefined if it says nothing usable. */
  private get selected(): Variant | undefined {
    const state = this.helperState;
    if (state === undefined || state === 'unavailable' || state === 'unknown') {
      return undefined;
    }
    return this.match(state);
  }

  /** Set when the helper is missing or pointing at something unrecognised. */
  private get unmatched(): string | undefined {
    const entity = this.config.variant_entity;
    if (!entity) return undefined;
    const state = this.helperState;
    if (state === undefined) {
      return text(this._hass, 'entityMissing', { entity });
    }
    // Startup states, not mistakes: fall through to the configured variant.
    if (state === 'unavailable' || state === 'unknown') return undefined;
    if (this.match(state)) return undefined;
    return text(this._hass, 'optionUnknown', {
      entity,
      state,
      options: Object.values(VARIANTS)
        .map((v) => text(this._hass, v.option))
        .join(', '),
    });
  }

  /** Delegated, so a masonry column still leaves the right amount of room. */
  getCardSize(): number {
    return this.child?.getCardSize?.() ?? 7;
  }

  /**
   * The chosen card, made once per config and handed everything but `variant`.
   */
  private get card(): ChildCard | undefined {
    const { tag } = VARIANTS[this.variant];
    if (!customElements.get(tag)) return undefined;
    if (!this.child) {
      const {
        type: _type, variant: _variant, variant_entity: _entity, ...rest
      } = this.config;
      const child = document.createElement(tag) as ChildCard;
      child.setConfig({ type: `custom:${tag}`, ...rest });
      child.hass = this._hass;
      this.child = child;
    }
    return this.child;
  }

  override render(): TemplateResult {
    const problem = this.unmatched;
    if (problem) return html`<ha-card>${errorRow(problem)}</ha-card>`;
    const card = this.card;
    if (!card) {
      return html`<ha-card>
        ${errorRow(text(this._hass, 'cardMissing', { tag: VARIANTS[this.variant].tag }))}
      </ha-card>`;
    }
    return html`${card}`;
  }
}

/* ── the editor ──────────────────────────────────────────────────────────── */

/**
 * The card's settings, as a dropdown.
 *
 * `ha-form` comes from the frontend rather than from here, so this stays a
 * schema and a change handler. It is the first GUI editor in this bundle: the
 * other cards fall back to the YAML editor, which is fine for them because their
 * options are entity ids, and much less fine for a choice between four names.
 */
export class FuturaSchematicsCardEditor extends LitElement {
  static override properties: PropertyDeclarations = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: Hass;
  private config: SchematicsCardConfig = { type: 'custom:futura-schematics-card' };

  static override styles = css`
    .hint {
      padding: 8px 4px 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `;

  setConfig(config: SchematicsCardConfig): void {
    this.config = { ...config };
  }

  private get schema() {
    return [
      {
        name: 'variant',
        selector: {
          select: {
            mode: 'dropdown',
            options: Object.entries(VARIANTS).map(([value, spec]) => ({
              value,
              label: text(this.hass, spec.label),
            })),
          },
        },
      },
      {
        name: 'variant_entity',
        selector: { entity: { domain: ['input_select', 'select'] } },
      },
      { name: 'prefix', selector: { text: {} } },
      { name: 'title', selector: { text: {} } },
    ];
  }

  /**
   * Bound, not static: `ha-form` calls it as a bare function, so it has to
   * carry the editor with it to reach `hass` and translate.
   */
  private readonly label = (entry: { name: string }): string => {
    const key: Record<string, StringKey> = {
      variant: 'editorVariant',
      variant_entity: 'editorVariantEntity',
      prefix: 'editorPrefix',
      title: 'editorTitle',
    };
    const name = key[entry.name];
    return name ? text(this.hass, name) : entry.name;
  };

  private changed(event: CustomEvent): void {
    event.stopPropagation();
    const config = { ...this.config, ...(event.detail.value as object) };
    // ha-form hands back "" for a cleared text field; an empty prefix would
    // otherwise be forwarded and every entity id would come out malformed.
    for (const key of ['prefix', 'title', 'variant_entity'] as const) {
      if (config[key] === '') delete config[key];
    }
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    const variant = this.config.variant ?? DEFAULT_VARIANT;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ variant, ...this.config }}
        .schema=${this.schema}
        .computeLabel=${this.label}
        @value-changed=${this.changed}
      ></ha-form>
      <div class="hint">
        ${VARIANTS[variant] ? text(this.hass, VARIANTS[variant].hint) : nothing}
      </div>
    `;
  }
}
