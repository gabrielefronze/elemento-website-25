import type { Locale } from '../i18n/config';
import { getUi } from '../i18n';
import itReplacements from '../i18n/replacements/it.json';
import frReplacements from '../i18n/replacements/fr.json';

type Replacement = [string | RegExp, string];
type ReplacementEntry = { en: string; it?: string; fr?: string };

type ReplacementFile = {
  byStem?: Record<string, ReplacementEntry[]>;
  replacements?: ReplacementEntry[];
};

const REPLACEMENT_FILES: Partial<Record<Locale, ReplacementFile>> = {
  it: itReplacements as ReplacementFile,
  fr: frReplacements as ReplacementFile,
};

/** Keep asset and blog image paths out of string replacement passes. */
const PROTECTED_ASSET_SRC_RE =
  /(src=["'])(?:\.\/)?(?:assets\/(?:diagrams|img|logos)\/[^"']+|img\/[^"']+)(["'])/gi;

function maskProtectedAssetSrc(html: string): { html: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = html.replace(PROTECTED_ASSET_SRC_RE, (match) => {
    const token = `__EL_ASSET_SRC_${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { html: masked, tokens };
}

function unmaskProtectedAssetSrc(html: string, tokens: string[]): string {
  let out = html;
  tokens.forEach((value, index) => {
    out = out.replace(`__EL_ASSET_SRC_${index}__`, value);
  });
  return out;
}

const stemCache = new Map<string, Replacement[]>();

/** Map EN FAQ question text → IT (from extract ids body.{stem}.faq.q.* or legacy button.* with ▼). */
function buildFaqQuestionMap(pairs: Replacement[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const [en, it] of pairs) {
    if (!it) continue;
    const key = (typeof en === 'string' ? en : en.source).replace(/\s*▼\s*$/, '').trim();
    if (key) map.set(key, it);
  }
  return map;
}

function localizeFaqQuestionSpans(html: string, faqMap: Map<string, string>): string {
  if (!faqMap.size) return html;
  return html.replace(
    /(<button[^>]*\bfaq-question\b[^>]*>\s*<span>)([^<]+)(<\/span>)/gi,
    (_match, open, text, close) => {
      const translated = faqMap.get(text.trim());
      return translated ? `${open}${translated}${close}` : `${open}${text}${close}`;
    }
  );
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

function plainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function normalizeKey(text: string): string {
  return text.replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
}

function buildTranslationMap(pairs: Replacement[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const [en, it] of pairs) {
    if (!it || typeof en !== 'string') continue;
    map.set(en.trim(), it);
    map.set(normalizeKey(en), it);
    map.set(plainText(en), it);
    map.set(normalizeKey(plainText(en)), it);
  }
  return map;
}

const EMPHASIS_CLS = 'pixel-accent|pixel-word|highlight-pixel|pixel-brand';
const EMPHASIS_SPAN_RE = new RegExp(`<span class="(${EMPHASIS_CLS})">([^<]*)<\\/span>`, 'g');

function hasEmphasisMarkup(html: string): boolean {
  return new RegExp(EMPHASIS_CLS).test(html);
}

function mapWordIndex(wordIdx: number, fromLen: number, toLen: number): number {
  if (fromLen <= 0 || toLen <= 0) return 0;
  return Math.min(toLen - 1, Math.round((wordIdx / fromLen) * toLen));
}

function mapWordRange(
  found: { start: number; end: number },
  enLen: number,
  itLen: number
): { start: number; end: number } {
  const start = mapWordIndex(found.start, enLen, itLen);
  const last = mapWordIndex(Math.max(found.start, found.end - 1), enLen, itLen);
  return { start, end: Math.min(itLen, Math.max(start + 1, last + 1)) };
}

function findWordRange(words: string[], phrase: string): { start: number; end: number } | null {
  const hw = phrase.split(/\s+/).filter(Boolean);
  if (!hw.length) return null;
  for (let i = 0; i <= words.length - hw.length; i++) {
    if (words.slice(i, i + hw.length).join(' ').toLowerCase() === hw.join(' ').toLowerCase()) {
      return { start: i, end: i + hw.length };
    }
  }
  return null;
}

/** Preserve Argent Pixel emphasis spans when replacing heading inner HTML. */
function rebuildEmphasisSpans(originalInner: string, translated: string): string {
  const spans = [...originalInner.matchAll(EMPHASIS_SPAN_RE)];
  if (!spans.length) return translated;

  const trimmed = originalInner.trim();
  if (spans.length === 1 && trimmed === `<span class="${spans[0][1]}">${spans[0][2]}</span>`) {
    return `<span class="${spans[0][1]}">${translated}</span>`;
  }

  const commaParts = translated.split(/,\s*/);
  if (commaParts.length === spans.length && spans.length > 1) {
    return commaParts
      .map((part, i) => {
        const words = part.trim().split(/\s+/);
        const emphasis = words[words.length - 1] ?? part.trim();
        const lead = words.slice(0, -1).join(' ');
        return `${lead ? `${lead} ` : ''}<span class="${spans[i][1]}">${emphasis}</span>`;
      })
      .join(', ');
  }

  const enWords = plainText(originalInner).split(/\s+/).filter(Boolean);
  const itWords = translated.split(/\s+/).filter(Boolean);
  if (!enWords.length || !itWords.length) return translated;

  const ranges: { cls: string; start: number; end: number }[] = [];
  for (const [, cls, text] of spans) {
    const found = findWordRange(enWords, text.trim());
    if (!found) continue;
    ranges.push({ cls, ...mapWordRange(found, enWords.length, itWords.length) });
  }
  if (!ranges.length) return translated;

  ranges.sort((a, b) => a.start - b.start);

  const segments: string[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push(itWords.slice(cursor, r.start).join(' '));
    }
    segments.push(`<span class="${r.cls}">${itWords.slice(r.start, r.end).join(' ')}</span>`);
    cursor = r.end;
  }
  if (cursor < itWords.length) {
    segments.push(itWords.slice(cursor).join(' '));
  }

  return segments.filter(Boolean).join(' ').replace(/\s+([?!.,;:])/g, '$1');
}

function applyInlineTranslation(originalInner: string, map: Map<string, string>): string {
  const plain = normalizeKey(plainText(originalInner));
  const translated = map.get(plain) ?? map.get(plainText(originalInner));
  if (!translated) return originalInner;

  if (hasEmphasisMarkup(originalInner) && !/<a\b/i.test(originalInner)) {
    return rebuildEmphasisSpans(originalInner, translated);
  }
  return translated;
}

function localizeHeroDetails(html: string, map: Map<string, string>): string {
  if (!map.size) return html;

  return html.replace(
    /<section class="section hero-details">([\s\S]*?)<\/section>/g,
    (section) => {
      let out = section;
      out = out.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_m, attrs, inner) => {
        const next = applyInlineTranslation(inner, map);
        return next === inner ? _m : `<h2${attrs}>${next}</h2>`;
      });
      out = out.replace(
        /(<div class="content-text">[\s\S]*?<p>)([\s\S]*?)(<\/p>)/,
        (full, open, inner, close) => {
          const plain = plainText(inner);
          const translated = map.get(plain);
          if (!translated) return full;
          return `${open}${translated}${close}`;
        }
      );
      out = out.replace(
        /<div class="feature-item">\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g,
        (_m, h3Inner, pInner) => {
          const newH3 = applyInlineTranslation(h3Inner, map);
          const newP = applyInlineTranslation(pInner, map);
          if (newH3 === h3Inner && newP === pInner) return _m;
          return `<div class="feature-item">
                                <h3>${newH3}</h3>
                                <p>${newP}</p>`;
        }
      );
      return out;
    }
  );
}

function localizeFaqAnswers(html: string, map: Map<string, string>): string {
  if (!map.size) return html;
  return html.replace(/<div class="faq-answer">([\s\S]*?)<\/div>/g, (full, inner) => {
    const plain = normalizeKey(plainText(inner));
    const translated = map.get(plain) ?? map.get(plainText(inner));
    if (!translated) return full;
    if (/<p\b/i.test(inner)) {
      return full.replace(/<p>([\s\S]*?)<\/p>/i, `<p>${translated}</p>`);
    }
    return `<div class="faq-answer"><p>${translated}</p></div>`;
  });
}

function localizeMappedElements(html: string, map: Map<string, string>): string {
  if (!map.size) return html;
  const tags = ['h1', 'h2', 'h3', 'h4', 'p', 'li'];
  let out = html;
  for (const tag of tags) {
    const re = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    out = out.replace(re, (full, attrs, inner) => {
      const plain = normalizeKey(plainText(inner));
      const translated = map.get(plain) ?? map.get(plainText(inner));
      if (!translated) return full;
      if (/<a\b/i.test(inner) && !hasEmphasisMarkup(inner)) {
        return `<${tag}${attrs}>${translated}</${tag}>`;
      }
      const next = applyInlineTranslation(inner, map);
      return `<${tag}${attrs}>${next}</${tag}>`;
    });
  }
  return out;
}

function localizeAnchorText(html: string, map: Map<string, string>): string {
  if (!map.size) return html;
  return html.replace(/(<a\b[^>]*>)([^<]+)(<\/a>)/gi, (full, open, text, close) => {
    const tr = map.get(text.trim()) ?? map.get(normalizeKey(text));
    return tr ? `${open}${tr}${close}` : full;
  });
}

function getReplacementPairs(stem: string, locale: Locale): Replacement[] {
  const cacheKey = `${locale}:${stem}`;
  const cached = stemCache.get(cacheKey);
  if (cached) return cached;

  const data = REPLACEMENT_FILES[locale];
  if (!data) {
    stemCache.set(cacheKey, []);
    return [];
  }

  let entries: ReplacementEntry[] = data.byStem?.[stem] ?? [];
  if (!entries.length && data.replacements?.length) {
    entries = data.replacements;
  }

  const pairs = entries
    .filter((r) => {
      const tr = r[locale];
      return r.en && tr && r.en !== tr;
    })
    .sort((a, b) => b.en.length - a.en.length)
    .map((r) => [r.en, r[locale]!] as Replacement);

  stemCache.set(cacheKey, pairs);
  return pairs;
}

function replaceTranslatableString(html: string, from: string, to: string): string {
  let out = html.split(from).join(to);
  if (from.includes('&')) {
    const encoded = from.replace(/&/g, '&amp;');
    if (encoded !== from) out = out.split(encoded).join(to);
  }
  return out;
}

/** Apply non-English locale overlays to legacy HTML body copy */
export function localizeBody(html: string, locale: Locale, stem: string): string {
  if (locale === 'en') return html;

  const ui = getUi(locale);
  const pages = ui.pages as Record<string, { heroTitle?: string; heroSubtitle?: string }>;
  const pageKey = stem.includes('/') ? stem.split('/').pop()! : stem;
  const page = pages[pageKey];
  const { html: maskedHtml, tokens: protectedAssetTokens } = maskProtectedAssetSrc(html);
  let out = maskedHtml;

  const skipLink =
    locale === 'it'
      ? 'Vai al contenuto principale'
      : locale === 'fr'
        ? 'Aller au contenu principal'
        : 'Skip to main content';

  const legacy: Replacement[] = [
    ['Read more', ui.blog.readMore],
    ['Learn more', locale === 'fr' ? 'En savoir plus' : 'Scopri di più'],
    ...(locale === 'it'
      ? ([
          ['mission and values', 'missione e valori'],
          ['complete product suite', 'suite completa di prodotti'],
          ['advanced technology stack', 'stack tecnologico avanzato'],
          ['company mission', 'missione aziendale'],
          ['product solutions', 'soluzioni di prodotto'],
          ['company mission', 'missione aziendale'],
          ['technical architecture', 'architettura tecnica'],
          ['team and mission', 'team e sulla nostra missione'],
          ['success stories', 'storie di successo'],
          ['C4 protocol technology', 'tecnologia del protocollo C4'],
          ['deployment support', 'supporto per l\'implementazione'],
          ['vendor neutrality philosophy', 'filosofia di neutralità del fornitore'],
          ['company values', 'valori aziendali'],
          ['sustainable cloud initiatives', 'iniziative di cloud sostenibile'],
          ['pricing models', 'modelli di prezzo'],
          ['technical documentation', 'documentazione tecnica'],
          ['technical capabilities', 'capacità tecniche'],
          ['latest insights and updates', 'ultimi approfondimenti e aggiornamenti'],
          ['product implementations', 'implementazioni dei prodotti'],
          ['company vision', 'visione aziendale'],
          ['product ecosystem', 'ecosistema di prodotti'],
          ['technical insights', 'approfondimenti tecnici'],
        ] as Replacement[])
      : []),
    ['Get Started', locale === 'fr' ? 'Commencer' : 'Inizia'],
    ['Start Now', locale === 'fr' ? 'Commencer' : 'Inizia ora'],
    ['Start Free Trial', locale === 'fr' ? 'Essai gratuit' : 'Inizia la prova gratuita'],
    ['Contact us', ui.pages.contact?.heroTitle ?? 'Contact us'],
    ['Sign up', ui.pages.signup?.heroTitle ?? 'Sign up'],
    ['Book a Call', ui.nav.bookCall],
    ['Book a call', ui.nav.bookCall],
    ['Skip to main content', skipLink],
    ...(locale === 'it'
      ? ([
          ['Deploy in minutes', 'Distribuisci in pochi minuti'],
          ['Scale as you grow', 'Scala man mano che cresci'],
          ['Enterprise security', 'Sicurezza enterprise'],
          ['Zero-downtime migration', 'Migrazione senza downtime'],
          ['Compliance certified', 'Conformità certificata'],
          ['Multi-cloud support', 'Supporto multi-cloud'],
          ['Automated workflows', 'Flussi di lavoro automatizzati'],
          ['Tool integration', 'Integrazione strumenti'],
          ['Browse books', 'Sfoglia i libri'],
          ['Read in wiki', 'Leggi nel wiki'],
          ['Open tech pack', 'Apri il tech pack'],
          ['Search wiki', 'Cerca nel wiki'],
          ['Open book', 'Apri'],
          ['View comparisons', 'Guarda le comparazioni'],
        ] as Replacement[])
      : []),
  ];

  const perPageIt: Record<string, Replacement[]> = {
    index: [
      ['Elemento. The Metacloud.', 'Elemento. Il Metacloud.'],
      [
        /The Infrastructure Layer<br><span class="pixel-accent">After Cloud\.<\/span>/gi,
        'Il livello infrastrutturale<br><span class="pixel-accent">dopo il Cloud.</span>',
      ],
      [
        /Govern, orchestrate and optimise infrastructure across public clouds, private clouds, sovereign providers, hypervisors and native AtomOS environments — through one sovereign control plane\./gi,
        'Governa, orchestra e ottimizza l\'infrastruttura su public cloud, private cloud, provider sovrani, hypervisor e ambienti AtomOS nativi — attraverso un unico control plane sovrano.',
      ],
      ['Book a Metacloud Assessment', 'Prenota una Metacloud Assessment'],
      ['Explore the Platform', 'Esplora la piattaforma'],
      ['VMware Exit Assessment', 'Assessment exit da VMware'],
      ['Why Now?', 'Perché adesso?'],
      ['The Metacloud Architecture', 'Architettura Metacloud'],
      ['Adopt the Metacloud at Your Own Pace', 'Adotta il Metacloud al tuo ritmo'],
      ['Built in Europe. Designed for Sovereignty.', 'Costruito in Europa. Progettato per la sovranità.'],
    ],
    about: [
      ['European DNA. Sovereignty native.', 'DNA europeo. Nativamente sovrano.'],
      ['Building the Metacloud', 'Costruiamo il Metacloud'],
      [
        /Elemento builds the Metacloud: a sovereign control plane[\s\S]*?without lock-in\./gi,
        'Elemento costruisce il Metacloud: un control plane sovrano che consente alle organizzazioni di governare, migrare e procurare infrastruttura tramite intent e contratti portabili, senza lock-in.',
      ],
      ['Meet the Team', 'Il team'],
      ['Meet Our Team', 'Il nostro team'],
      ['Our Mission', 'La nostra missione'],
      ['Our Values', 'I nostri valori'],
    ],
    contact: [
      ['Get in Touch', ui.pages.contact.heroTitle],
      ['Send us a message', 'Inviaci un messaggio'],
      ['Sales', 'Vendite'],
      ['Support', 'Supporto'],
      ['Partnership', 'Partnership'],
      [
        'Choose the support option that works best for you',
        "Scegli l'opzione di supporto più adatta alle tue esigenze",
      ],
    ],
    products: [
      ['Our Products', ui.pages.products.heroTitle],
      ['Modular Cloud Solutions', 'Soluzioni cloud modulari'],
      ['All Products', ui.footer.allProducts],
    ],
    signup: [
      ['Create your account', 'Crea il tuo account'],
      ['Start your journey', 'Inizia il percorso'],
    ],
    blog: [
      ['Latest Articles', 'Articoli recenti'],
      ['Cloud Computing Insights', 'Approfondimenti sul cloud'],
    ],
    videos: [
      ['Watch. Learn. Explore.', 'Guarda. Impara. Esplora.'],
      [/<span class="pixel-word">Videos<\/span>/, '<span class="pixel-word">Video</span>'],
      [
        /<p><span class="emphasis-pixel">Keynotes<\/span>,[\s\S]*?<a href="\/contact\.html">get in touch<\/a>\.<\/p>/,
        '<p><span class="emphasis-pixel">Keynote</span>, <span class="emphasis-pixel">webinar</span> e registrazioni <span class="emphasis-pixel">prodotto</span> dal team Elemento. Approfondimenti sul nostro <a href="/blog.html">blog</a> o <a href="/contact.html">contattaci</a>.</p>',
      ],
    ],
    atomos: [
      ['Install the AtomOS CLI tool:', 'Installa lo strumento CLI AtomOS:'],
      ['Install the AtomOS services', 'Installa i servizi AtomOS'],
      ['Ready to deploy your first VM in minutes!', 'Pronto a distribuire la tua prima VM in pochi minuti!'],
    ],
    'install-atomos': [
      ['Install the AtomOS CLI tool:', 'Installa lo strumento CLI AtomOS:'],
      ['Ready to deploy your first VM in minutes!', 'Pronto a distribuire la tua prima VM in pochi minuti!'],
      ['Ready to manage your multicloud infrastructure!', 'Pronto a gestire la tua infrastruttura multicloud!'],
      ['Configure Electros CLI from ~/.elemento/config', 'Configura la CLI Electros da ~/.elemento/config'],
      ['Start managing VMs across all your clouds!', 'Inizia a gestire le VM su tutti i tuoi cloud!'],
    ],
    electros: [
      ['Configure Electros CLI from ~/.elemento/config', 'Configura la CLI Electros da ~/.elemento/config'],
      ['Start managing VMs across all your clouds!', 'Inizia a gestire le VM su tutti i tuoi cloud!'],
      ['Ready to manage your multicloud infrastructure!', 'Pronto a gestire la tua infrastruttura multicloud!'],
      [
        'Surfaces to run<br><small>Linux, macOS, Windows apps, plus elemento-cli</small>',
        "Modalità per eseguire<br><small>l'app Linux, macOS, Windows e elemento-cli</small>",
      ],
      [
        'Cloud & hybrid targets<br><small>AWS, Azure, Google Cloud, and on-prem infrastructure</small>',
        "Target cloud e ibridi<br><small>AWS, Azure, Google Cloud e all'infrastruttura on-premise</small>",
      ],
      [
        'Ship-ready builds<br><small>AppImage, DMG, EXE, and DEB—x64 and ARM64 where supported</small>',
        'Build pronte<br><small>AppImage, DMG, EXE e DEB—x64 e ARM64 dove supportato</small>',
      ],
      [
        /Electros is the operational core of the Elemento platform\. It federates existing resources and exposes them through one governance, orchestration and brokerage model\./gi,
        'Electros è il nucleo operativo della piattaforma Elemento. Federazione delle risorse esistenti attraverso un unico modello di governance, orchestrazione e brokerage.',
      ],
      ['Book an Electros Demo', 'Prenota una demo Electros'],
      ['Connect Your First Infrastructure', 'Connetti la tua prima infrastruttura'],
    ],
    'signup-success': [
      ['Check your email', 'Controlla la tua email'],
      [
        "We've sent you a welcome message with your login credentials and next steps.",
        'Ti abbiamo inviato un messaggio di benvenuto con le credenziali di accesso e i prossimi passi.',
      ],
    ],
    '404': [['Discover our solutions', 'Scopri le nostre soluzioni']],
  };

  const perPageFr: Record<string, Replacement[]> = {
    index: [
      ['Elemento. The Metacloud.', 'Elemento. Le Metacloud.'],
      [
        /The Infrastructure Layer<br><span class="pixel-accent">After Cloud\.<\/span>/gi,
        'La couche d\'infrastructure<br><span class="pixel-accent">après le Cloud.</span>',
      ],
      [
        /Govern, orchestrate and optimise infrastructure across public clouds, private clouds, sovereign providers, hypervisors and native AtomOS environments — through one sovereign control plane\./gi,
        'Gouvernez, orchestrez et optimisez l\'infrastructure sur clouds publics, clouds privés, fournisseurs souverains, hyperviseurs et environnements AtomOS natifs — via un plan de contrôle souverain unique.',
      ],
      ['Book a Metacloud Assessment', 'Réserver une évaluation Metacloud'],
      ['Explore the Platform', 'Explorer la plateforme'],
      ['VMware Exit Assessment', 'Évaluation sortie VMware'],
      ['Why Now?', 'Pourquoi maintenant ?'],
      ['The Metacloud Architecture', 'Architecture Metacloud'],
      ['Adopt the Metacloud at Your Own Pace', 'Adoptez le Metacloud à votre rythme'],
      ['Built in Europe. Designed for Sovereignty.', 'Conçu en Europe. Pensé pour la souveraineté.'],
    ],
    about: [
      ['European DNA. Sovereignty native.', 'ADN européen. Souveraineté native.'],
      ['Building the Metacloud', 'Construire le Metacloud'],
      [
        /Elemento builds the Metacloud: a sovereign control plane[\s\S]*?without lock-in\./gi,
        'Elemento construit le Metacloud : un plan de contrôle souverain qui permet aux organisations de gouverner, migrer et se procurer l\'infrastructure via l\'intention et des contrats portables, sans verrouillage.',
      ],
      ['Meet the Team', 'L\'équipe'],
      ['Meet Our Team', 'Notre équipe'],
      ['Our Mission', 'Notre mission'],
      ['Our Values', 'Nos valeurs'],
    ],
    contact: [
      ['Get in Touch', ui.pages.contact?.heroTitle ?? 'Nous contacter'],
      ['Send us a message', 'Envoyez-nous un message'],
      ['Sales', 'Ventes'],
      ['Support', 'Support'],
      ['Partnership', 'Partenariat'],
      [
        'Choose the support option that works best for you',
        'Choisissez l\'option de support qui vous convient le mieux',
      ],
    ],
    products: [
      ['Our Products', ui.pages.products?.heroTitle ?? 'Nos produits'],
      ['Modular Cloud Solutions', 'Solutions cloud modulaires'],
      ['All Products', ui.footer.allProducts],
    ],
    signup: [
      ['Create your account', 'Créez votre compte'],
      ['Start your journey', 'Commencez votre parcours'],
    ],
    blog: [
      ['Latest Articles', 'Articles récents'],
      ['Cloud Computing Insights', 'Actualités cloud'],
    ],
    videos: [
      ['Watch. Learn. Explore.', 'Regardez. Apprenez. Explorez.'],
      [/<span class="pixel-word">Videos<\/span>/, '<span class="pixel-word">Vidéos</span>'],
      [
        /<p><span class="emphasis-pixel">Keynotes<\/span>,[\s\S]*?<a href="\/contact\.html">get in touch<\/a>\.<\/p>/,
        '<p><span class="emphasis-pixel">Keynotes</span>, <span class="emphasis-pixel">webinaires</span> et enregistrements <span class="emphasis-pixel">produit</span> de l\'équipe Elemento. Approfondissements sur notre <a href="/blog.html">blogue</a> ou <a href="/contact.html">contactez-nous</a>.</p>',
      ],
    ],
    atomos: [
      ['Install the AtomOS CLI tool:', 'Installez l\'outil CLI AtomOS :'],
      ['Install the AtomOS services', 'Installez les services AtomOS'],
      ['Ready to deploy your first VM in minutes!', 'Prêt à déployer votre première VM en quelques minutes !'],
    ],
    'install-atomos': [
      ['Install the AtomOS CLI tool:', 'Installez l\'outil CLI AtomOS :'],
      ['Ready to deploy your first VM in minutes!', 'Prêt à déployer votre première VM en quelques minutes !'],
      ['Ready to manage your multicloud infrastructure!', 'Prêt à gérer votre infrastructure multicloud !'],
      ['Configure Electros CLI from ~/.elemento/config', 'Configurez la CLI Electros depuis ~/.elemento/config'],
      ['Start managing VMs across all your clouds!', 'Gérez vos VM sur tous vos clouds !'],
    ],
    electros: [
      ['Configure Electros CLI from ~/.elemento/config', 'Configurez la CLI Electros depuis ~/.elemento/config'],
      ['Start managing VMs across all your clouds!', 'Gérez vos VM sur tous vos clouds !'],
      ['Ready to manage your multicloud infrastructure!', 'Prêt à gérer votre infrastructure multicloud !'],
    ],
    'signup-success': [
      ['Check your email', 'Vérifiez votre e-mail'],
      [
        "We've sent you a welcome message with your login credentials and next steps.",
        'Nous vous avons envoyé un message de bienvenue avec vos identifiants et les prochaines étapes.',
      ],
    ],
    '404': [['Discover our solutions', 'Découvrez nos solutions']],
  };

  const stemKey = stem.replace(/\//g, '_');
  const stemPairs = getReplacementPairs(stemKey, locale);
  const translationMap = buildTranslationMap(stemPairs);
  const perPage =
    locale === 'it' ? perPageIt : locale === 'fr' ? perPageFr : {};
  const all = [...stemPairs, ...legacy, ...(perPage[pageKey] ?? [])];

  out = localizeHeroDetails(out, translationMap);
  out = localizeFaqQuestionSpans(out, buildFaqQuestionMap(stemPairs));
  out = localizeFaqAnswers(out, translationMap);
  out = localizeMappedElements(out, translationMap);
  out = localizeAnchorText(out, translationMap);

  for (const [from, to] of all) {
    if (!to) continue;
    out =
      typeof from === 'string' ? replaceTranslatableString(out, from, to) : out.replace(from, to);
  }

  if (pageKey === 'blog' && (locale === 'it' || locale === 'fr')) {
    out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, `<h1 class="hero-title">${ui.blog.heading}</h1>`);
    const note = `<p class="blog-locale-note" style="margin:1rem auto;max-width:720px;text-align:center;opacity:0.85;">${ui.blog.englishPostsNote}</p>`;
    if (!out.includes('blog-locale-note')) {
      out = out.replace(/<div id="blog-posts-container"/, `${note}<div id="blog-posts-container"`);
    }
  }

  return unmaskProtectedAssetSrc(out, protectedAssetTokens);
}
