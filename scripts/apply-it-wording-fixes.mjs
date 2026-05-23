#!/usr/bin/env node
/**
 * Apply Italian wording fixes from audit to localization/strings-it.json.
 * Run: node scripts/apply-it-wording-fixes.mjs && npm run i18n:import
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STRINGS = join(ROOT, 'localization/strings-it.json');

/** Replace within any `it` string (order matters for longer phrases first). */
const IT_GLOBAL = [
  ['Scopri di più sugli elettrodi', 'Scopri di più su Electros'],
  ['Guarda gli elettrodi in azione', 'Guarda Electros in azione'],
  ["Guida all'installazione degli elettrodi", "Guida all'installazione di Electros"],
  ['Integrazione del quadro', 'Integrazione framework'],
  ['integrazione del quadro', 'integrazione framework'],
  ['Magazzinaggio', 'Archiviazione'],
  ['Pronto. Impostato. Nuvola.', 'Pronti. Via. Cloud.'],
  ['Sfuggire al blocco del venditore', 'Libertà dal vendor lock-in'],
  ['Fai girare la tua nuvola ovunque', 'Distribuisci il tuo cloud ovunque'],
  ['La tua nuvola. Le tue regole, la tua libertà.', 'Il tuo cloud. Le tue regole. La tua libertà.'],
  ['La tua nuvola.', 'Il tuo cloud.'],
  ['senza soluzione di continuità', 'senza interruzioni'],
  ['Coubicazione AtomOS', 'Colocazione AtomOS'],
  ['2. Coubicazione AtomOS', '2. Colocazione AtomOS'],
  ['Strutture di coubicazione', 'Strutture di colocazione'],
  ['Nuvola verde', 'Cloud sostenibile'],
  ["Blog dell'Elemento", 'Blog Elemento'],
  ['Elemento Nuvola', 'Elemento Cloud'],
  ['politica sulla riservatezza', 'Informativa sulla privacy'],
  ['Prenota una call', 'Prenota una chiamata'],
  ['self-hostable', 'auto-ospitabile'],
  ['vendor-neutral', 'indipendente dal fornitore'],
  ['green computing', 'cloud sostenibile'],
  ['Green computing', 'Cloud sostenibile'],
  ['SÌ!', 'Sì!'],
  ['Partenariato', 'Partnership'],
  ['iniziative di green computing', 'iniziative di cloud sostenibile'],
  ['green e self-hostable', 'sostenibile e auto-ospitabile'],
  ['green, ad alte prestazioni e self-hostable', 'sostenibile, ad alte prestazioni e auto-ospitabile'],
  ['green e self-hostable.', 'sostenibile e auto-ospitabile.'],
];

/** When `en` matches exactly, set `it` to this value. */
const EN_TO_IT = {
  Home: 'Home',
  Partnership: 'Partnership',
  Storage: 'Archiviazione',
  'Escape vendor lock-in': 'Libertà dal vendor lock-in',
  'Spin up your cloud everywhere': 'Distribuisci il tuo cloud ovunque',
  'Ready. Set. Cloud.': 'Pronti. Via. Cloud.',
  'Learn About Electros': 'Scopri di più su Electros',
  'See Electros in Action': 'Guarda Electros in azione',
  'Electros Installation Guide': "Guida all'installazione di Electros",
  'Framework Integration': 'Integrazione framework',
  'Colocation AtomOS': 'Colocazione AtomOS',
  '2. Colocation AtomOS': '2. Colocazione AtomOS',
  'Colocation Facilities': 'Strutture di colocazione',
  'Green Cloud': 'Cloud sostenibile',
  'Elemento Blog': 'Blog Elemento',
  'Book a Call': 'Prenota una chiamata',
  'Privacy Policy': 'Informativa sulla privacy',
  'Vendor-neutral, high-performance cloud platform that\'s cost-effective, green, and self-hostable.':
    'Piattaforma cloud indipendente dal fornitore, ad alte prestazioni, conveniente, sostenibile e auto-ospitabile.',
};

const UI_OVERRIDES = {
  'ui.nav.bookCall': 'Prenota una chiamata',
  'ui.footer.tagline':
    'Piattaforma cloud indipendente dal fornitore, ad alte prestazioni, conveniente, sostenibile e auto-ospitabile.',
  'ui.footer.privacy': 'Informativa sulla privacy',
  'ui.pages.index.heroSubtitle':
    'Cloud indipendente dal fornitore, conveniente, sostenibile, ad alte prestazioni e auto-ospitabile, pronto per l\'infrastructure as code.',
  'ui.pages.about.title': 'Elemento | Chi siamo | Missione e team della piattaforma cloud',
  'ui.pages.about.heroSubtitle':
    'Trasformiamo l\'infrastruttura cloud con soluzioni indipendenti dal fornitore, sostenibili e convenienti.',
  'ui.pages.atomos.title': 'AtomOS: potenzia il tuo cloud con l\'hypervisor Linux | Elemento Cloud',
  'ui.pages.compare-costs.title': 'Confronta i costi: AtomOS e VMware | Elemento Cloud',
  'ui.pages.electros.title': 'App Electros: dashboard di orchestrazione e CLI | Elemento Cloud',
  'ui.pages.install-atomos.title': 'Guida all\'installazione — AtomOS ed Electros | Elemento Cloud',
  'ui.pages.orbital.title': 'Orbital: server hardware con AtomOS | Elemento Cloud',
  'meta.solutions_ai.title': 'AI/ML e data science | Elemento',
  'ui.pages.solutions_ai.description':
    'Addestra, distribuisci e scala i carichi di lavoro AI senza interruzioni su cloud e nodi on-premise. Gestione cluster GPU e ambienti AI multi-cloud.',
  'ui.pages.atomosphere.description':
    'Il gateway API multicloud di Elemento connette oltre 235 cloud e nodi on-premise in un\'unica rete programmabile. Controllo unificato e portabilità fluida.',
};

function applyGlobalIt(text) {
  let out = text;
  for (const [from, to] of IT_GLOBAL) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

function main() {
  const payload = JSON.parse(readFileSync(STRINGS, 'utf8'));
  const strings = payload.strings || payload;
  let changed = 0;

  for (const row of strings) {
    if (!row.it && !row.en) continue;

    if (row.id && UI_OVERRIDES[row.id]) {
      if (row.it !== UI_OVERRIDES[row.id]) {
        row.it = UI_OVERRIDES[row.id];
        changed++;
      }
      continue;
    }

    if (row.en && EN_TO_IT[row.en.trim()] && row.it !== EN_TO_IT[row.en.trim()]) {
      row.it = EN_TO_IT[row.en.trim()];
      changed++;
      continue;
    }

    if (typeof row.it === 'string' && row.it) {
      const next = applyGlobalIt(row.it);
      if (next !== row.it) {
        row.it = next;
        changed++;
      }
    }
  }

  writeFileSync(STRINGS, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Updated ${changed} string entries in strings-it.json`);

  // CMS direct fixes (stats color "green" is CSS — do not change)
  const cmsFixes = [
    ['CMS/solutions/ai.json', (it) => {
      if (it.features?.items) {
        for (const item of it.features.items) {
          if (item.title === 'Integrazione del quadro') item.title = 'Integrazione framework';
        }
      }
      if (it.faq?.items) {
        for (const item of it.faq.items) {
          if (item.answer?.includes('senza soluzione di continuità')) {
            item.answer = item.answer.replace(/senza soluzione di continuità/g, 'senza interruzioni');
          }
        }
      }
    }],
    ['CMS/solutions/industrial.json', (it) => {
      if (it.useCase?.subtitle?.includes('senza soluzione di continuità')) {
        it.useCase.subtitle = it.useCase.subtitle.replace(/senza soluzione di continuità/g, 'senza interruzioni');
      }
    }],
    ['CMS/solutions/system-integrators.json', (it) => {
      if (it.solution?.items) {
        for (const item of it.solution.items) {
          if (item.description?.includes('senza soluzione di continuità')) {
            item.description = item.description.replace(/senza soluzione di continuità/g, 'senza interruzioni');
          }
        }
      }
    }],
  ];

  for (const [rel, fn] of cmsFixes) {
    const path = join(ROOT, rel);
    const data = JSON.parse(readFileSync(path, 'utf8'));
    if (data.it) fn(data.it);
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    console.log(`Patched ${rel}`);
  }
}

main();
