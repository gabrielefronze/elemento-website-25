#!/usr/bin/env node
/**
 * Italian marketing site wording audit.
 * Reads built /dist/it pages + i18n sources; writes CSV + markdown report.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST_IT = path.join(ROOT, 'dist/it');
const OUT_CSV = path.join(ROOT, 'localization/audit-it-wording.csv');
const OUT_MD = path.join(ROOT, 'localization/audit-it-wording.md');

const MARKETING_PATHS = [
  'index.html',
  'about.html',
  'products.html',
  'contact.html',
  'technology.html',
  'atomos.html',
  'electros.html',
  'atomosphere.html',
  'orbital.html',
  'compare-costs.html',
  'install-atomos.html',
  'signup.html',
  'signup-success.html',
  'brand-guidelines.html',
  'blog.html',
  '404.html',
  'solutions/index.html',
  'solutions/ai.html',
  'solutions/devops.html',
  'solutions/industrial.html',
  'solutions/public-sector.html',
  'solutions/regulated.html',
  'solutions/system-integrators.html',
  'solutions/vmware-alternative.html',
  'solutions/products.html',
];

const EN_MARKERS =
  /\b(the|and|with|your|our|learn|about|meet|ready|join|build|deploy|watch|skip|toggle|consent|tracking|preferences|whether|discover|explore|read|get|started|book|call|company|mission|technical|documentation|success|stories|vendor|lock-in|self-hostable|green|storage|networking|clustering|performance|impact|metrics|proven|scale|powering|worldwide|keep|existing|no markup|open standards|upstream|linux|dynamic|auto-scaling|multi-region|enterprise-grade|bank-grade|supports|regions|data centers|how it works|free tier|kubernetes|containers|workloads|organizations|transforming|revolutionized|hundreds|milestones|equity|history|founded|headquartered|we concentrate|we sharpen|we close|we extend|we were named|seed round|modular platform|strategic use|scale-up|federated)\b/i;

const PATTERN_RULES = [
  { re: /elettrodi/i, code: 'CRITICAL', severity: 'P0', note: 'Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.' },
  { re: /Integrazione del quadro/i, code: 'CRITICAL', severity: 'P0', note: 'framework mistranslated as quadro. Use integrazione del framework / compatibilità con i framework.' },
  { re: /Magazzinaggio/i, code: 'CRITICAL', severity: 'P0', note: 'Storage section: magazzinaggio = warehousing. Use Archiviazione or Storage.' },
  { re: /Pronto\.\s*Impostato\.\s*Nuvola/i, code: 'CALQUE', severity: 'P1', note: 'Calque of Ready. Set. Cloud. Use Pronti. Via. Cloud. or equivalent IT slogan; never nuvola for cloud product.' },
  { re: /Fai girare la tua nuvola/i, code: 'CALQUE', severity: 'P1', note: 'Do not use nuvola for cloud infrastructure. E.g. Distribuisci il tuo cloud ovunque.' },
  { re: /Sfuggire al blocco del venditore/i, code: 'STYLE', severity: 'P1', note: 'Awkward calque. Prefer Libertà dal vendor lock-in or Nessun vincolo al fornitore.' },
  { re: /senza soluzione di continuità/i, code: 'CALQUE', severity: 'P1', note: 'Calque of seamless. Use senza interruzioni, fluido, integrato.' },
  { re: /Coubicazione/i, code: 'STYLE', severity: 'P1', note: 'Colocation → Colocazione (standard IT Italian).' },
  { re: /Blog dell'Elemento/i, code: 'META', severity: 'P2', note: 'Prefer Blog Elemento or Blog di Elemento.' },
  { re: /Elemento Nuvola/i, code: 'META', severity: 'P1', note: 'Page title suffix: Nuvola is wrong for brand. Use Elemento Cloud or Elemento.' },
  { re: /politica sulla riservatezza/i, code: 'META', severity: 'P2', note: 'Use Informativa sulla privacy.' },
  { re: /Prenota una call\b/i, code: 'ANGLICISM', severity: 'P1', note: 'Use Prenota una chiamata or Prenota un incontro.' },
  { re: /vendor-neutral/i, code: 'ANGLICISM', severity: 'P1', note: 'Use indipendente dal fornitore or neutrale rispetto al vendor.' },
  { re: /self-hostable/i, code: 'ANGLICISM', severity: 'P1', note: 'Use auto-ospitabile or installabile on-premise.' },
  { re: /\bgreen\b/i, code: 'ANGLICISM', severity: 'P2', note: 'In IT marketing prefer sostenibile or a basse emissioni.' },
  { re: /lock-in/i, code: 'ANGLICISM', severity: 'P2', note: 'Acceptable in B2B tech; alternative: vincolo al fornitore.' },
  { re: /Cloud Factory/i, code: 'TERMINOLOGY', severity: 'P2', note: 'Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.' },
  { re: /\bCasa\b/, code: 'META', severity: 'P2', note: 'Breadcrumb Home mistranslated as Casa. Use Home.' },
  { re: /Partenariato/i, code: 'STYLE', severity: 'P2', note: 'Partnership → Partnership or Collaborazioni (Partenariato is rare in IT B2B).' },
  { re: /Informazioni su/i, code: 'META', severity: 'P2', note: 'About page title: prefer Chi siamo | Elemento.' },
  { re: /La tua nuvola/i, code: 'CALQUE', severity: 'P1', note: 'Use il tuo cloud not nuvola in product copy.' },
  { re: /Nuvola verde/i, code: 'CALQUE', severity: 'P1', note: 'Green cloud → cloud sostenibile.' },
  { re: /Scopri di più about/i, code: 'MIXED', severity: 'P0', note: 'Partial translation. Full sentence must be Italian.' },
  { re: /Meet the/i, code: 'MIXED', severity: 'P0', note: 'English+Italian mixed heading.' },
  { re: /Skip to main content/i, code: 'MISSING', severity: 'P1', note: 'Accessibility skip link not translated. Add to ui/it.json.' },
  { re: /Toggle theme/i, code: 'MISSING', severity: 'P2', note: 'Theme toggle aria-label in English.' },
  { re: /Your consent preferences/i, code: 'MISSING', severity: 'P1', note: 'Cookie banner still English.' },
  { re: /Ready to Transform/i, code: 'MISSING', severity: 'P0', note: 'CTA section still English on index.' },
  { re: /Learn about our/i, code: 'MISSING', severity: 'P0', note: 'English body copy block.' },
  { re: /Whether you/i, code: 'MISSING', severity: 'P0', note: 'English body copy block.' },
  { re: /Join hundreds/i, code: 'MISSING', severity: 'P0', note: 'English body copy block.' },
  { re: /Elemento provides bank-grade/i, code: 'MISSING', severity: 'P0', note: 'FAQ answer still English.' },
  { re: /Elemento supports 235/i, code: 'MISSING', severity: 'P0', note: 'FAQ answer still English.' },
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSnippets(html, maxLen = 220) {
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
  const scope = bodyMatch ? bodyMatch[0] : html;
  const cleaned = scope
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const texts = new Set();
  const re = />([^<]{12,}?)</g;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (!t || /^[\d\s|©€$]+$/.test(t)) continue;
    if (/^\(function\(\)|langSwitcher|const ui =/.test(t)) continue;
    if (t.includes('{"') || t.includes('}}')) continue;
    texts.add(t.slice(0, maxLen));
  }
  return [...texts];
}

const TECH_TERMS_OK =
  /\b(storage|networking|clustering|performance|linux|ubuntu|almalinux|rocky|rhel|debian|centos|windows|kubernetes|terraform|api|cli|gpu|kvm|vm|aws|azure|gcp|ebss|vlan|zfs|glusterfs|pip|appimage|macos|devops|saas|iaas|paas|soc|gdpr|hipaa|iso|ecc|iommu|cockpit|rest|terraform|devops)\b/i;

function looksEnglish(text) {
  if (TECH_TERMS_OK.test(text) && /\b(per|con|della|delle|sono|puoi|tua|tuo|nostra|gestione|distribuisci|scopri|secondo|tramite|supporto|nodi|macchine|virtuali)\b/i.test(text)) {
    return false;
  }
  if (!EN_MARKERS.test(text)) return false;
  const itWords = (text.match(/\b(che|con|per|della|delle|sono|puoi|tua|tuo|nostra|nostro|infrastruttura|piattaforma|fornitore|gestione|distribuisci|scopri|informazioni|contatti|prodotti|documentazione|secondo|tramite|supporto|nodi|virtuali|macchine|cluster|rete|archiviazione|sicurezza|conformità|implementazione|carichi|lavoro)\b/gi) || []).length;
  const enCount = (text.match(EN_MARKERS) || []).length;
  if (itWords >= 2 && enCount <= 2) return false;
  return enCount >= 3 || (/^[A-Z][a-z]+ (the|your|our|with|about|to)\b/.test(text) && itWords < 2);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function flattenUi(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenUi(v, key));
    else if (typeof v === 'string') out.push({ key, value: v });
  }
  return out;
}

function findSource(current, enRef, uiFlat, replacements) {
  const uiHit = uiFlat.find((u) => u.value === current || current.includes(u.value));
  if (uiHit) return { file: 'src/i18n/ui/it.json', key: uiHit.key };

  for (const [stem, entries] of Object.entries(replacements.byStem || {})) {
    for (const e of entries) {
      if (e.it === current || (e.it && current.includes(e.it))) {
        return { file: 'src/i18n/replacements/it.json', key: `byStem.${stem}`, en: e.en };
      }
      if (enRef && e.en === enRef) return { file: 'src/i18n/replacements/it.json', key: `byStem.${stem}`, en: e.en };
    }
  }
  for (const e of replacements.replacements || []) {
    if (e.it === current) return { file: 'src/i18n/replacements/it.json', key: 'replacements', en: e.en };
  }
  return { file: 'legacy HTML / pipeline gap', key: '', en: enRef || '' };
}

function csvEscape(s) {
  return `"${String(s ?? '').replace(/"/g, '""')}"`;
}

function main() {
  const ui = loadJson(path.join(ROOT, 'src/i18n/ui/it.json'));
  const replacements = loadJson(path.join(ROOT, 'src/i18n/replacements/it.json'));
  const uiFlat = flattenUi(ui);

  const findings = [];
  let id = 1;

  // Global chrome from ui/it.json
  const globalChecks = [
    { section: 'nav', key: 'nav.bookCall', text: ui.nav.bookCall, code: 'ANGLICISM', severity: 'P1', note: 'Use Prenota una chiamata.' },
    { section: 'footer', key: 'footer.tagline', text: ui.footer.tagline, code: 'ANGLICISM', severity: 'P1', note: 'Replace vendor-neutral, green, self-hostable with Italian.' },
    { section: 'footer', key: 'footer.privacy', text: ui.footer.privacy, code: 'META', severity: 'P2', note: 'Use Informativa sulla privacy.' },
    { section: 'pages.index', key: 'pages.index.heroSubtitle', text: ui.pages?.index?.heroSubtitle, code: 'ANGLICISM', severity: 'P1', note: 'Mixed EN/IT in hero subtitle.' },
    { section: 'pages.about', key: 'pages.about.title', text: ui.pages?.about?.title, code: 'META', severity: 'P2', note: 'Informazioni su → Chi siamo.' },
    { section: 'pages.about', key: 'pages.about.heroSubtitle', text: ui.pages?.about?.heroSubtitle, code: 'ANGLICISM', severity: 'P1', note: 'vendor-neutral left in Italian string.' },
    { section: 'pages.atomos', key: 'pages.atomos.title', text: ui.pages?.atomos?.title, code: 'META', severity: 'P1', note: 'Elemento Nuvola → Elemento Cloud.' },
    { section: 'pages.atomosphere', key: 'pages.atomosphere.description', text: ui.pages?.atomosphere?.description, code: 'CALQUE', severity: 'P1', note: 'senza soluzione di continuità for seamless.' },
    { section: 'pages.solutions_ai', key: 'pages.solutions_ai.title', text: ui.pages?.solutions_ai?.title, code: 'META', severity: 'P1', note: 'Title overly long/formal; shorten for SERP.' },
    { section: 'pages.solutions_ai', key: 'pages.solutions_ai.description', text: ui.pages?.solutions_ai?.description, code: 'CALQUE', severity: 'P1', note: 'senza soluzione di continuità.' },
    { section: 'blog', key: 'blog.englishPostsNote', text: ui.blog?.englishPostsNote, code: 'STYLE', severity: 'P2', note: 'OK content; verify tone with brand voice.' },
  ].filter((c) => c.text);

  for (const c of globalChecks) {
    findings.push({
      id: `IT-${String(id++).padStart(4, '0')}`,
      page_url: '/* (global)',
      section: c.section,
      severity: c.severity,
      issue_code: c.code,
      current_it: c.text,
      en_reference: '',
      source_file: 'src/i18n/ui/it.json',
      source_key_or_id: c.key,
      context: 'UI chrome / meta',
      rewriter_notes: c.note,
      status: 'open',
    });
  }

  // Replacements known-bad strings (grep sweep)
  for (const [stem, entries] of Object.entries(replacements.byStem || {})) {
    for (const e of entries) {
      if (!e.it) continue;
      for (const rule of PATTERN_RULES) {
        if (rule.re.test(e.it)) {
          const page = stem.replace(/_/g, '/');
          findings.push({
            id: `IT-${String(id++).padStart(4, '0')}`,
            page_url: `/it/${page}.html`,
            section: 'body copy',
            severity: rule.severity,
            issue_code: rule.code,
            current_it: e.it.length > 200 ? e.it.slice(0, 200) + '…' : e.it,
            en_reference: (e.en || '').slice(0, 200),
            source_file: 'src/i18n/replacements/it.json',
            source_key_or_id: `byStem.${stem}`,
            context: `EN: ${(e.en || '').slice(0, 80)}`,
            rewriter_notes: rule.note,
            status: 'open',
          });
          break;
        }
      }
    }
  }

  // CMS solutions
  const cmsDir = path.join(ROOT, 'CMS/solutions');
  if (fs.existsSync(cmsDir)) {
    for (const f of fs.readdirSync(cmsDir).filter((x) => x.endsWith('.json'))) {
      const cms = loadJson(path.join(cmsDir, f));
      const slug = f.replace('.json', '');
      const it = cms.it || {};
      const walk = (obj, pfx) => {
        if (!obj) return;
        if (typeof obj === 'string') {
          for (const rule of PATTERN_RULES) {
            if (rule.re.test(obj)) {
              findings.push({
                id: `IT-${String(id++).padStart(4, '0')}`,
                page_url: `/it/solutions/${slug}.html`,
                section: pfx,
                severity: rule.severity,
                issue_code: rule.code,
                current_it: obj.length > 200 ? obj.slice(0, 200) + '…' : obj,
                en_reference: '',
                source_file: `CMS/solutions/${f}`,
                source_key_or_id: pfx,
                context: 'CMS it block',
                rewriter_notes: rule.note,
                status: 'open',
              });
            }
          }
          return;
        }
        if (Array.isArray(obj)) obj.forEach((v, i) => walk(v, `${pfx}[${i}]`));
        else if (typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) walk(v, pfx ? `${pfx}.${k}` : k);
        }
      };
      walk(it, 'it');
    }
  }

  // HTML dist crawl
  for (const rel of MARKETING_PATHS) {
    const filePath = path.join(DIST_IT, rel);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf8');
    const url = `/it/${rel}`;
    const snippets = extractSnippets(html);

    for (const snip of snippets) {
      for (const rule of PATTERN_RULES) {
        if (rule.re.test(snip)) {
          const src = findSource(snip, '', uiFlat, replacements);
          if (findings.some((f) => f.page_url === url && f.current_it === snip.slice(0, 200))) continue;
          findings.push({
            id: `IT-${String(id++).padStart(4, '0')}`,
            page_url: url,
            section: 'visible text',
            severity: rule.severity,
            issue_code: rule.code,
            current_it: snip.length > 200 ? snip.slice(0, 200) + '…' : snip,
            en_reference: src.en?.slice(0, 200) || '',
            source_file: src.file,
            source_key_or_id: src.key,
            context: 'Live page snapshot',
            rewriter_notes: rule.note,
            status: 'open',
          });
          break;
        }
      }

      if (looksEnglish(snip) && snip.length > 25) {
        const src = findSource(snip, '', uiFlat, replacements);
        if (!findings.some((f) => f.page_url === url && f.current_it.startsWith(snip.slice(0, 60)))) {
          findings.push({
            id: `IT-${String(id++).padStart(4, '0')}`,
            page_url: url,
            section: 'visible text',
            severity: 'P0',
            issue_code: 'MISSING',
            current_it: snip.length > 200 ? snip.slice(0, 200) + '…' : snip,
            en_reference: src.en?.slice(0, 200) || '',
            source_file: src.file,
            source_key_or_id: src.key,
            context: 'English detected on /it/ page',
            rewriter_notes:
              src.file.includes('pipeline')
                ? 'needs extract + i18n:import or localize-body handler for nested HTML/links'
                : 'Translate and import via localization pipeline',
            status: 'open',
          });
        }
      }
    }
  }

  // Browser-validated manual findings (chrome / headings not always in replacement map)
  const manualFindings = [
    { page_url: '/* (global)', section: 'accessibility', severity: 'P1', issue_code: 'MISSING', current_it: 'Skip to main content', en_reference: 'Skip to main content', source_file: 'src/layouts/BaseLayout.astro or ui/it.json', source_key_or_id: 'TBD skipLink', context: 'All /it/ pages', rewriter_notes: 'Add Italian skip link: Vai al contenuto principale', status: 'open' },
    { page_url: '/* (global)', section: 'chrome', severity: 'P2', issue_code: 'MISSING', current_it: 'Toggle theme', en_reference: 'Toggle theme', source_file: 'src/layouts/BaseLayout.astro', source_key_or_id: 'theme toggle aria', context: 'All /it/ pages', rewriter_notes: 'Translate theme toggle label', status: 'open' },
    { page_url: '/* (global)', section: 'cookie banner', severity: 'P1', issue_code: 'MISSING', current_it: 'Your consent preferences for tracking technologies', en_reference: 'Your consent preferences for tracking technologies', source_file: 'cookie consent script/HTML', source_key_or_id: 'TBD', context: 'All /it/ pages', rewriter_notes: 'Translate cookie consent UI', status: 'open' },
    { page_url: '/it/index.html', section: 'tech-specs intro', severity: 'P0', issue_code: 'MISSING', current_it: 'Enterprise-grade infrastructure designed for modern cloud-native applications.', en_reference: 'Enterprise-grade infrastructure designed for modern cloud-native applications.', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.index', context: 'Technical specifications section', rewriter_notes: 'needs extract + import or localize-body handler', status: 'open' },
    { page_url: '/it/index.html', section: 'tech-specs h3', severity: 'P1', issue_code: 'MISSING', current_it: 'Cloud Providers & Federation', en_reference: 'Cloud Providers & Federation', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.index', context: 'Section heading', rewriter_notes: 'Translate section headings in tech specs block', status: 'open' },
    { page_url: '/it/index.html', section: 'tech-specs h3', severity: 'P1', issue_code: 'MISSING', current_it: 'Clustering & Networking', en_reference: 'Clustering & Networking', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.index', context: 'Section heading', rewriter_notes: 'Translate section headings in tech specs block', status: 'open' },
    { page_url: '/it/index.html', section: 'tech-specs h3', severity: 'P1', issue_code: 'MISSING', current_it: 'Security & Compliance', en_reference: 'Security & Compliance', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.index', context: 'Section heading', rewriter_notes: 'Translate section headings in tech specs block', status: 'open' },
    { page_url: '/it/index.html', section: 'cta', severity: 'P0', issue_code: 'MISSING', current_it: 'Ready to Transform Your Infrastructure?', en_reference: 'Ready to Transform Your Infrastructure?', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.index', context: 'Pre-footer CTA', rewriter_notes: 'Translate CTA heading and body', status: 'open' },
    { page_url: '/it/index.html', section: 'inline links', severity: 'P0', issue_code: 'MISSING', current_it: 'technical documentation', en_reference: 'technical documentation', source_file: 'legacy HTML / pipeline gap', source_key_or_id: 'index inline anchors', context: 'Link text inside Italian paragraphs', rewriter_notes: 'Extract anchor text strings; translate link labels', status: 'open' },
    { page_url: '/it/index.html', section: 'inline links', severity: 'P0', issue_code: 'MISSING', current_it: 'advanced technology stack', en_reference: 'advanced technology stack', source_file: 'legacy HTML / pipeline gap', source_key_or_id: 'index inline anchors', context: 'Link text inside Italian paragraphs', rewriter_notes: 'Extract anchor text strings; translate link labels', status: 'open' },
    { page_url: '/it/products.html', section: 'hero h1', severity: 'P0', issue_code: 'MISSING', current_it: 'Meet the Elemento Prodotti', en_reference: 'Meet the Elemento Products', source_file: 'src/i18n/replacements/it.json', source_key_or_id: 'byStem.products', context: 'Page hero', rewriter_notes: 'Fully translate hero H1', status: 'open' },
    { page_url: '/it/solutions/ai.html', section: 'hero-details h3', severity: 'P0', issue_code: 'CRITICAL', current_it: 'Integrazione del quadro', en_reference: 'Framework Integration', source_file: 'CMS/solutions/ai.json', source_key_or_id: 'it.features.items (framework)', context: 'Live page hero-details', rewriter_notes: 'Also fix in CMS it block if duplicated', status: 'open' },
    { page_url: '/it/solutions/ai.html', section: 'meta title', severity: 'P1', issue_code: 'META', current_it: 'Startup e laboratori di ricerca in materia di intelligenza artificiale/scienza dei dati | Elemento', en_reference: 'AI Startups & Data Science Research Labs | Elemento', source_file: 'src/i18n/ui/it.json', source_key_or_id: 'pages.solutions_ai.title', context: 'Browser title', rewriter_notes: 'Shorten for SEO: e.g. AI/ML e data science | Elemento', status: 'open' },
  ];
  for (const m of manualFindings) {
    findings.push({ id: `IT-${String(id++).padStart(4, '0')}`, ...m });
  }

  // Deduplicate by page + current_it prefix
  const seen = new Set();
  const deduped = [];
  for (const f of findings) {
    const k = `${f.page_url}|${f.issue_code}|${f.current_it.slice(0, 80)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(f);
  }

  // Write CSV
  const header =
    'id,page_url,section,severity,issue_code,current_it,en_reference,source_file,source_key_or_id,context,rewriter_notes,status';
  const csv = [
    header,
    ...deduped.map((f) =>
      [
        f.id,
        f.page_url,
        f.section,
        f.severity,
        f.issue_code,
        f.current_it,
        f.en_reference,
        f.source_file,
        f.source_key_or_id,
        f.context,
        f.rewriter_notes,
        f.status,
      ]
        .map(csvEscape)
        .join(',')
    ),
  ].join('\n');
  fs.writeFileSync(OUT_CSV, csv + '\n');

  // Stats for MD
  const byCode = {};
  const bySev = {};
  for (const f of deduped) {
    byCode[f.issue_code] = (byCode[f.issue_code] || 0) + 1;
    bySev[f.severity] = (bySev[f.severity] || 0) + 1;
  }

  const p0 = deduped.filter((f) => f.severity === 'P0').slice(0, 15);
  const byPage = {};
  for (const f of deduped) {
    (byPage[f.page_url] ||= []).push(f);
  }

  let md = `# Italian marketing site — wording audit\n\n`;
  md += `Generated: ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `Scope: marketing pages under \`/it/\` (blog post bodies excluded).\n\n`;
  md += `## Executive summary\n\n`;
  md += `- **Total findings:** ${deduped.length}\n`;
  md += `- **By severity:** ${Object.entries(bySev).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
  md += `- **By issue code:** ${Object.entries(byCode).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;
  md += `Deliverable for rework agent: [\`audit-it-wording.csv\`](audit-it-wording.csv)\n\n`;

  md += `### Top P0 fixes (start here)\n\n`;
  md += `| ID | Page | Issue | Current |\n|----|------|-------|--------|\n`;
  for (const f of p0) {
    md += `| ${f.id} | ${f.page_url} | ${f.issue_code} | ${f.current_it.slice(0, 70).replace(/\|/g, '/')}… |\n`;
  }

  md += `\n## Terminology glossary (canonical IT)\n\n`;
  md += `| EN | Avoid | Prefer |\n|----|-------|--------|\n`;
  md += `| Cloud (infrastructure) | nuvola | cloud |\n`;
  md += `| Vendor lock-in | blocco del venditore | vendor lock-in / vincolo al fornitore |\n`;
  md += `| Seamless | senza soluzione di continuità | senza interruzioni, fluido |\n`;
  md += `| Framework | quadro | framework |\n`;
  md += `| Electros (product) | elettrodi | Electros |\n`;
  md += `| Home (breadcrumb) | Casa | Home |\n`;
  md += `| Privacy policy | politica sulla riservatezza | Informativa sulla privacy |\n`;
  md += `| Storage (section) | Magazzinaggio | Archiviazione |\n`;
  md += `| Colocation | Coubicazione | Colocazione |\n`;
  md += `| Self-hostable | (literal) | auto-ospitabile / installabile on-premise |\n\n`;

  md += `## Findings by page\n\n`;
  const pageOrder = ['/* (global)', ...MARKETING_PATHS.map((p) => `/it/${p}`)];
  for (const url of pageOrder) {
    const items = byPage[url];
    if (!items?.length) continue;
    md += `### ${url}\n\n`;
    for (const f of items.slice(0, 25)) {
      md += `- **${f.id}** [${f.severity}/${f.issue_code}] ${f.section}\n`;
      md += `  - Current: "${f.current_it.slice(0, 120)}${f.current_it.length > 120 ? '…' : ''}"\n`;
      md += `  - Source: \`${f.source_file}\`${f.source_key_or_id ? ` → \`${f.source_key_or_id}\`` : ''}\n`;
      md += `  - Note: ${f.rewriter_notes}\n`;
    }
    if (items.length > 25) md += `- _…and ${items.length - 25} more in CSV_\n`;
    md += `\n`;
  }

  md += `## Handoff for rework agent\n\n`;
  md += `1. Edit strings in \`src/i18n/ui/it.json\`, \`localization/strings-it.json\`, and/or \`src/i18n/replacements/it.json\` (or CMS \`it\` blocks).\n`;
  md += `2. For \`MISSING\` rows tagged pipeline gap: extend extract/localize-body before translating.\n`;
  md += `3. Run \`npm run i18n:import\` (if strings-it.json updated) and \`npm run build\`.\n`;
  md += `4. Re-check P0 URLs: \`/it/index.html\`, \`/it/about.html\`, \`/it/products.html\`, \`/it/solutions/ai.html\`.\n`;

  fs.writeFileSync(OUT_MD, md);
  console.log(`Wrote ${deduped.length} findings`);
  console.log(`  ${OUT_CSV}`);
  console.log(`  ${OUT_MD}`);
}

main();
