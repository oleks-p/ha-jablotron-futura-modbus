/**
 * Every user-visible string the cards print, in every language they ship with.
 *
 * The integration's own entity names are translated by Home Assistant, which
 * reads `translations/<lang>.json` and hands the result back as
 * `friendly_name`. The cards cannot use that: the words here label parts of a
 * drawing rather than entities -- "Supply", "BYPASS", "Filter clogging" -- and
 * there is no entity whose name they could borrow. So they carry their own
 * table, in the same shape and with the same rule: English is the fallback, key
 * by key, and a language file that is missing one string degrades that string
 * alone rather than blanking the card.
 *
 * Shipped as JSON rather than as a TypeScript object so the same test that
 * checks the integration's translations can read these without parsing
 * TypeScript -- see tests/test_card_strings.py.
 *
 * The lookup is `text()` rather than the conventional `t()`: every card
 * already imports the drawing tokens as `t`.
 */
import type { Hass } from './shared';
import en from './strings/en.json';
import uk from './strings/uk.json';

export type StringKey = keyof typeof en;

/** Add a language by adding its file here; nothing else needs to change. */
const TABLES: Record<string, Partial<Record<StringKey, string>>> = { en, uk };

/**
 * The frontend's language, as a bare language code.
 *
 * `hass.locale.language` is what the user picked in their profile and is what
 * Home Assistant itself translates by; `hass.language` is the same value on
 * older frontends. Regional codes are folded in -- `uk-UA` and `uk` get the
 * same strings, because a translation this size has nothing region-specific in
 * it and silently falling back to English would be worse.
 */
export function language(hass?: Hass): string {
  const raw = hass?.locale?.language ?? hass?.language ?? 'en';
  return raw.toLowerCase().split('-')[0];
}

/**
 * The string for `key`, with `{placeholders}` filled in.
 *
 * A placeholder with no value is left as it stands rather than printed as
 * "undefined": on a card that is a visible, searchable defect instead of a
 * plausible-looking wrong reading.
 */
export function text(
  hass: Hass | undefined,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  const text = TABLES[language(hass)]?.[key] ?? en[key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole);
}
