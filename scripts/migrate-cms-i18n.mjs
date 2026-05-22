#!/usr/bin/env node
/**
 * Wrap CMS JSON entries with en/it locale objects (idempotent).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMS = join(__dirname, '..', 'CMS');

const ROLE_IT = {
  'CEO – Chief Executive Officer': 'CEO – Amministratore delegato',
  'CTO – Chief Technical Officer': 'CTO – Direttore tecnico',
  'CSO – Chief Sales Officer': 'CSO – Direttore vendite',
  'CFO – Chief Financial Officer': 'CFO – Direttore finanziario',
  'CMO – Chief Marketing Officer': 'CMO – Direttore marketing',
  'R&D Leader - #1 Employee': 'Responsabile R&S - primo dipendente',
  'Art Director': 'Direttore artistico',
  'Event Manager': 'Event Manager',
  'Cloud Software Developer': 'Sviluppatore cloud',
  'Software Developer': 'Sviluppatore software',
  'Business Analyst': 'Business analyst',
  'Support Specialist': 'Specialist supporto',
};

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function wrapMember(m) {
  if (m.en && m.it) return m;
  const id = m.id || slug(m.name);
  const en = {
    name: m.name,
    role: m.role,
    highlight: m.highlight || '',
    bio: m.bio,
  };
  const it = {
    name: m.name,
    role: ROLE_IT[m.role] || m.role,
    highlight: m.highlight || '',
    bio: m.bio,
  };
  const { name, role, highlight, bio, ...rest } = m;
  return { id, ...rest, en, it };
}

function wrapOrbital(item) {
  if (item.en && item.it) return item;
  const id = item.id || slug(item.name);
  const textKeys = ['name', 'description', 'availability'];
  const en = {};
  const it = {};
  for (const k of textKeys) {
    if (item[k] != null) {
      en[k] = item[k];
      it[k] =
        k === 'availability' && item[k] === 'In Stock'
          ? 'Disponibile'
          : k === 'description'
            ? item[k]
            : item[k];
    }
  }
  if (item.features) {
    en.features = item.features;
    it.features = item.features.map((f) =>
      f.replace('included with perpetual licensing', 'con licenza perpetua inclusa')
        .replace('Standard warranty and support', 'Garanzia e supporto standard')
    );
  }
  if (item.use_cases) {
    en.use_cases = item.use_cases;
    it.use_cases = item.use_cases.map((u) =>
      u.replace('Development environments', 'Ambienti di sviluppo')
        .replace('Small business applications', 'Applicazioni per PMI')
        .replace('Testing and staging', 'Test e staging')
        .replace('Lightweight workloads', 'Carichi di lavoro leggeri')
        .replace('Production applications', 'Applicazioni di produzione')
        .replace('AI/ML workloads', 'Carichi AI/ML')
        .replace('Database servers', 'Server database')
    );
  }
  const { name, description, features, use_cases, availability, ...rest } = item;
  return { id, ...rest, en, it };
}

function wrapStory(s) {
  if (s.en && s.it) return s;
  const id = s.id || slug(s.company || s.name || 'story');
  return {
    id,
    logo: s.logo,
    en: {
      company: s.company,
      quote: s.quote,
      author: s.author,
      role: s.role,
    },
    it: {
      company: s.company,
      quote: s.quote,
      author: s.author,
      role: s.role,
    },
  };
}

function main() {
  const teamPath = join(CMS, 'team.json');
  const team = JSON.parse(readFileSync(teamPath, 'utf-8'));
  writeFileSync(teamPath, JSON.stringify(team.map(wrapMember), null, 2) + '\n');
  console.log('Migrated team.json');

  const orbitalPath = join(CMS, 'orbital.json');
  const orbital = JSON.parse(readFileSync(orbitalPath, 'utf-8'));
  writeFileSync(orbitalPath, JSON.stringify(orbital.map(wrapOrbital), null, 2) + '\n');
  console.log('Migrated orbital.json');

  const storiesPath = join(CMS, 'success-stories.json');
  const stories = JSON.parse(readFileSync(storiesPath, 'utf-8'));
  writeFileSync(storiesPath, JSON.stringify(stories.map(wrapStory), null, 2) + '\n');
  console.log('Migrated success-stories.json');

  const piPath = join(CMS, 'provider-integrations.json');
  const pi = JSON.parse(readFileSync(piPath, 'utf-8'));
  if (!pi.ui) {
    pi.ui = {
      en: {
        supported: 'Supported',
        partial: 'Partial support',
        planned: 'Planned',
        providerColumn: 'Provider',
        supportColumn: 'Support level',
      },
      it: {
        supported: 'Supportato',
        partial: 'Supporto parziale',
        planned: 'In roadmap',
        providerColumn: 'Provider',
        supportColumn: 'Livello di supporto',
      },
    };
    writeFileSync(piPath, JSON.stringify(pi, null, 2) + '\n');
    console.log('Added provider-integrations ui labels');
  }
}

main();
