#!/usr/bin/env node
/** Apply Italian UI strings to solution pageConfig copies */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'CMS', 'solutions');

const PHRASES = [
  ['Start Now', 'Inizia ora'],
  ['Book a Call', 'Prenota una call'],
  ['Read More', 'Leggi tutto'],
  ['Learn more', 'Scopri di più'],
  ['See ', 'Vedi '],
  ['Explore ', 'Esplora '],
  ['Launch ', 'Avvia '],
  ['Challenges You Face', 'Sfide che affronti'],
  ['FAQ', 'FAQ'],
  ['Ready to', 'Pronto per'],
  ['Workflow', 'Flusso di lavoro'],
  ['Solution', 'Soluzione'],
  ['Features', 'Funzionalità'],
  ['Impact', 'Impatto'],
  ['Train, Deploy, and Scale AI Workloads', 'Addestra, distribuisci e scala carichi AI'],
  ['Seamlessly run AI workloads', 'Esegui carichi AI senza attriti'],
];

function deepTranslate(obj) {
  if (typeof obj === 'string') {
    let s = obj;
    for (const [en, it] of PHRASES) {
      if (s.includes(en)) s = s.split(en).join(it);
    }
    return s;
  }
  if (Array.isArray(obj)) return obj.map(deepTranslate);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepTranslate(v);
    return out;
  }
  return obj;
}

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  data.it = deepTranslate(JSON.parse(JSON.stringify(data.en)));
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`Localized ${file}`);
}
