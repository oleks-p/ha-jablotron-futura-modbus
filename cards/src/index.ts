/**
 * Entry point: registers the elements and their Lovelace picker entries.
 *
 * Registration is explicit rather than via Lit's `@customElement` decorator.
 * esbuild's minifier tree-shakes the `__decorateClass` calls that legacy
 * decorators compile to, which leaves the module loading cleanly while no
 * element is ever defined -- the cards silently vanish from the dashboard with
 * nothing in the console. Defining them by hand cannot be optimised away.
 */
import { FuturaFlowCard } from './flow-card';
import { FuturaControlCard } from './control-card';
import { FuturaSensorGridCard } from './sensor-grid-card';
import { FuturaHistoryCard } from './history-card';
import { FuturaUnitCard } from './unit-card';
import { FuturaSchematicCard } from './schematic-card';
import { FuturaDiagramCard } from './diagram-card';
import { FuturaSchematicsCard, FuturaSchematicsCardEditor } from './schematics-card';
import { ACCENT_INK, RUNNING } from './tokens';

export {
  FuturaFlowCard,
  FuturaControlCard,
  FuturaSensorGridCard,
  FuturaHistoryCard,
  FuturaUnitCard,
  FuturaSchematicCard,
  FuturaDiagramCard,
  FuturaSchematicsCard,
  FuturaSchematicsCardEditor,
};

interface CardRegistration {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

const CARDS: Array<CardRegistration & { element: CustomElementConstructor }> = [
  {
    type: 'futura-flow-card',
    name: 'Futura air flow',
    description:
      'Airflow schematic with duct temperatures, humidity, recovered heat and filter status.',
    preview: true,
    element: FuturaFlowCard,
  },
  {
    type: 'futura-control-card',
    name: 'Futura controls',
    description: 'Ventilation level, temperature target and timed functions.',
    preview: true,
    element: FuturaControlCard,
  },
  {
    type: 'futura-sensor-grid-card',
    name: 'Futura sensor grid',
    description: 'CO₂, temperature or humidity tiles for every connected peripheral.',
    preview: true,
    element: FuturaSensorGridCard,
  },
  {
    type: 'futura-history-card',
    name: 'Futura sensor history',
    description:
      'History graph of CO₂, temperature or humidity across every connected peripheral.',
    preview: true,
    element: FuturaHistoryCard,
  },
  {
    type: 'futura-unit-card',
    name: 'Futura unit schematic',
    description:
      'The unit and its four ducts, with each duct\'s temperature and humidity '
      + 'and the current operating mode.',
    preview: true,
    element: FuturaUnitCard,
  },
  {
    type: 'futura-schematic-card',
    name: 'Futura service schematic',
    description:
      'The unit with airflow direction, per-duct readings, both fan speeds and '
      + 'filter wear -- the service view.',
    preview: true,
    element: FuturaSchematicCard,
  },
  {
    type: 'futura-diagram-card',
    name: 'Futura airflow diagram',
    description:
      'The manual\'s airflow diagram as a line drawing: runs, bypass, both fans '
      + 'and the exchanger.',
    preview: true,
    element: FuturaDiagramCard,
  },
  {
    type: 'futura-schematics-card',
    name: 'Futura schematic (pick one)',
    description:
      'Any one of the four views of the unit, chosen in the card\'s settings.',
    preview: true,
    element: FuturaSchematicsCard,
  },
];

/*
 * Not a card, so it is defined but never offered in the picker. It has to be
 * defined before the picker opens, though: HA asks a card for its editor element
 * by tag name and gets an unupgraded HTMLElement if nothing has claimed it.
 */
if (!customElements.get('futura-schematics-card-editor')) {
  customElements.define('futura-schematics-card-editor', FuturaSchematicsCardEditor);
}

const registry = ((window as any).customCards ||= []);

for (const card of CARDS) {
  // A reload of the module must not throw on an already-defined element.
  if (!customElements.get(card.type)) {
    customElements.define(card.type, card.element);
  }
  if (!registry.some((entry: CardRegistration) => entry.type === card.type)) {
    const { element: _element, ...entry } = card;
    registry.push(entry);
  }
}

// eslint-disable-next-line no-console
console.info(
  `%c FUTURA-CARDS %c ${CARDS.length} cards registered `,
  `background:${RUNNING};color:${ACCENT_INK}`,
  '',
);
