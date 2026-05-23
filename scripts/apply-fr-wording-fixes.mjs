#!/usr/bin/env node
/**
 * Apply French wording / glossary fixes to localization/strings-fr.json.
 * Run: node scripts/apply-fr-wording-fixes.mjs && npm run i18n:import:fr
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STRINGS = join(ROOT, 'localization/strings-fr.json');

const FR_GLOBAL = [
  ['En savoir plus sur les électrodes', 'En savoir plus sur Electros'],
  ['Découvrez les électrodes', 'Découvrez Electros'],
  ['Voir les électrodes en action', 'Voir Electros en action'],
  ["Guide d'installation des électrodes", "Guide d'installation d'Electros"],
  ['Intégration du cadre', 'Intégration framework'],
  ['intégration du cadre', 'intégration framework'],
  ['Entreposage', 'Stockage'],
  ['entreposage', 'stockage'],
  ['Prêt. Set. Nuage.', 'Prêts. Partez. Cloud.'],
  ['Échapper au verrouillage du fournisseur', 'Liberté face au vendor lock-in'],
  ['Lancez votre nuage partout', 'Déployez votre cloud partout'],
  ['Votre nuage. Vos règles, votre liberté.', 'Votre cloud. Vos règles. Votre liberté.'],
  ['Votre nuage.', 'Votre cloud.'],
  ['sans solution de continuité', 'sans interruption'],
  ['sans interruption de service', 'sans interruption'],
  ['Nuage vert', 'Cloud durable'],
  ['Blog Elemento Nuage', 'Blog Elemento'],
  ['Elemento Nuage', 'Elemento Cloud'],
  ['Élément', 'Elemento'],
  ['self-hostable', 'auto-hébergeable'],
  ['vendor-neutral', 'neutre vis-à-vis des fournisseurs'],
  ['green computing', 'cloud durable'],
  ['Green computing', 'Cloud durable'],
  ['informatique verte', 'cloud durable'],
];

const EN_TO_FR = {
  Home: 'Accueil',
  Partnership: 'Partenariat',
  Storage: 'Stockage',
  'Escape vendor lock-in': 'Liberté face au vendor lock-in',
  'Spin up your cloud everywhere': 'Déployez votre cloud partout',
  'Ready. Set. Cloud.': 'Prêts. Partez. Cloud.',
  'Learn About Electros': 'En savoir plus sur Electros',
  'See Electros in Action': 'Voir Electros en action',
  'Electros Installation Guide': "Guide d'installation d'Electros",
  'Framework Integration': 'Intégration framework',
  'Colocation AtomOS': 'Colocation AtomOS',
  '2. Colocation AtomOS': '2. Colocation AtomOS',
  'Colocation Facilities': 'Sites de colocation',
  'Green Cloud': 'Cloud durable',
  'Elemento Blog': 'Blog Elemento',
  'Book a Call': 'Réserver un appel',
  'Privacy Policy': 'Politique de confidentialité',
  'Vendor-neutral, high-performance cloud platform that\'s cost-effective, green, and self-hostable.':
    'Plateforme cloud neutre vis-à-vis des fournisseurs, performante, économique, durable et auto-hébergeable.',
};

const UI_OVERRIDES = {
  'ui.nav.bookCall': 'Réserver un appel',
  'ui.footer.tagline':
    'Plateforme cloud neutre vis-à-vis des fournisseurs, performante, économique, durable et auto-hébergeable.',
  'ui.footer.privacy': 'Politique de confidentialité',
  'ui.pages.index.heroSubtitle':
    'Cloud neutre, économique, durable, performant et auto-hébergeable, prêt pour l\'infrastructure as code.',
  'ui.pages.about.title': 'Elemento | À propos | Mission et équipe cloud',
  'ui.pages.about.heroSubtitle':
    'Transformer l\'infrastructure cloud avec des solutions neutres, durables et économiques.',
  'ui.pages.atomos.title': 'AtomOS : hyperviseur Linux pour votre cloud | Elemento Cloud',
  'ui.pages.compare-costs.title': 'Comparer les coûts : AtomOS vs VMware | Elemento Cloud',
  'ui.pages.electros.title': 'Electros : orchestration et CLI | Elemento Cloud',
  'ui.pages.install-atomos.title': 'Guide d\'installation — AtomOS et Electros | Elemento Cloud',
  'ui.pages.orbital.title': 'Orbital : serveurs matériels avec AtomOS | Elemento Cloud',
  'meta.solutions_ai.title': 'IA/ML et data science | Elemento',
  'ui.pages.solutions_ai.description':
    'Entraînez, déployez et scalez les charges IA sans interruption sur cloud et nœuds on-premise. Clusters GPU et environnements AI multi-cloud.',
  'ui.pages.atomosphere.description':
    'La passerelle API multicloud d\'Elemento connecte plus de 235 clouds et nœuds on-premise en un réseau programmable unifié. Contrôle unifié et portabilité fluide.',
};

function applyGlobalFr(text) {
  let out = text;
  for (const [from, to] of FR_GLOBAL) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

function main() {
  const payload = JSON.parse(readFileSync(STRINGS, 'utf8'));
  const strings = payload.strings || payload;
  let changed = 0;

  for (const row of strings) {
    if (!row.fr && !row.en) continue;

    if (row.id && UI_OVERRIDES[row.id]) {
      if (row.fr !== UI_OVERRIDES[row.id]) {
        row.fr = UI_OVERRIDES[row.id];
        changed++;
      }
      continue;
    }

    if (row.en && EN_TO_FR[row.en.trim()] && row.fr !== EN_TO_FR[row.en.trim()]) {
      row.fr = EN_TO_FR[row.en.trim()];
      changed++;
      continue;
    }

    if (typeof row.fr === 'string' && row.fr) {
      const next = applyGlobalFr(row.fr);
      if (next !== row.fr) {
        row.fr = next;
        changed++;
      }
    }
  }

  writeFileSync(STRINGS, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Updated ${changed} string entries in strings-fr.json`);
}

main();
