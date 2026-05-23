import type { Locale } from '../i18n/config';
import { getUi } from '../i18n';
import itReplacements from '../i18n/replacements/it.json';

type Replacement = [string | RegExp, string];
type ReplacementEntry = { en: string; it: string };

type ReplacementFile = {
  byStem?: Record<string, ReplacementEntry[]>;
  replacements?: ReplacementEntry[];
};

/** Keep diagram filenames (e.g. Products.svg) out of string replacement passes. */
const DIAGRAM_ASSET_SRC_RE =
  /(src=["'])(?:\.\/)?assets\/diagrams\/[^"']+\.svg(["'])/gi;

function maskDiagramAssetSrc(html: string): { html: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = html.replace(DIAGRAM_ASSET_SRC_RE, (match) => {
    const token = `__EL_DIAGRAM_SRC_${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { html: masked, tokens };
}

function unmaskDiagramAssetSrc(html: string, tokens: string[]): string {
  let out = html;
  tokens.forEach((value, index) => {
    out = out.replace(`__EL_DIAGRAM_SRC_${index}__`, value);
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

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function getReplacementPairs(stem: string): Replacement[] {
  const cached = stemCache.get(stem);
  if (cached) return cached;

  const data = itReplacements as ReplacementFile;
  let entries: ReplacementEntry[] = data.byStem?.[stem] ?? [];
  if (!entries.length && data.replacements?.length) {
    entries = data.replacements;
  }

  const pairs = entries
    .filter((r) => r.en && r.it && r.en !== r.it)
    .sort((a, b) => b.en.length - a.en.length)
    .map((r) => [r.en, r.it] as Replacement);

  stemCache.set(stem, pairs);
  return pairs;
}

/** Apply Italian (or future locale) overlays to legacy HTML body copy */
export function localizeBody(html: string, locale: Locale, stem: string): string {
  if (locale === 'en') return html;

  const ui = getUi(locale);
  const pages = ui.pages as Record<string, { heroTitle?: string; heroSubtitle?: string }>;
  const pageKey = stem.includes('/') ? stem.split('/').pop()! : stem;
  const page = pages[pageKey];
  const { html: maskedHtml, tokens: diagramSrcTokens } = maskDiagramAssetSrc(html);
  let out = maskedHtml;

  const legacy: Replacement[] = [
    ['Read more', ui.blog.readMore],
    ['Learn more', 'Scopri di più'],
    ['Get Started', 'Inizia'],
    ['Start Now', 'Inizia ora'],
    ['Start Free Trial', 'Inizia la prova gratuita'],
    ['Contact us', ui.pages.contact.heroTitle],
    ['Sign up', ui.pages.signup.heroTitle],
    ['Book a Call', ui.nav.bookCall],
    ['Book a call', ui.nav.bookCall],
    ['Skip to main content', 'Vai al contenuto principale'],
  ];

  const perPage: Record<string, Replacement[]> = {
    index: [
      ['Ready. Set. Cloud.', 'Pronti. Via. Cloud.'],
      [
        /Build and Run Your Own(?:\s|<[^>]+>\s*)+Cloud Infrastructure(?:\s|<[^>]+>\s*)+<span class="pixel-accent">with No Lock-In<\/span>/gi,
        'Costruisci ed esegui la tua<br> infrastruttura cloud<br> <span class="pixel-accent">senza vincoli</span>',
      ],
      [
        /Elemento lets you build and run your own cloud infrastructure with complete freedom\.[\s\S]*?<span class="pixel-accent">Your cloud\. Your rules, Your freedom\.<\/span>/gi,
        'Elemento ti permette di costruire e gestire la tua infrastruttura cloud in totale libertà. Tu scegli dove gira e noi automatizziamo tutto per te.<br><span class="pixel-accent">Il tuo cloud. Le tue regole. La tua libertà.</span>',
      ],
    ],
    about: [
      ['Our Story. Our Mission. Our passion.', 'La nostra storia. La nostra missione. La nostra passione.'],
      [/<span class="pixel-word">About<\/span>/, '<span class="pixel-word">Chi siamo</span>'],
      [
        /Transforming cloud infrastructure[\s\S]*?green computing solutions\./gi,
        page?.heroSubtitle ?? '',
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

  const stemKey = stem.replace(/\//g, '_');
  const stemPairs = getReplacementPairs(stemKey);
  const translationMap = buildTranslationMap(stemPairs);
  const all = [...stemPairs, ...legacy, ...(perPage[pageKey] ?? [])];

  out = localizeHeroDetails(out, translationMap);
  out = localizeFaqQuestionSpans(out, buildFaqQuestionMap(stemPairs));
  out = localizeFaqAnswers(out, translationMap);
  out = localizeMappedElements(out, translationMap);
  out = localizeAnchorText(out, translationMap);

  for (const [from, to] of all) {
    if (!to) continue;
    out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to);
  }

  if (pageKey === 'blog' && locale === 'it') {
    out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, `<h1 class="hero-title">${ui.blog.heading}</h1>`);
    const note = `<p class="blog-locale-note" style="margin:1rem auto;max-width:720px;text-align:center;opacity:0.85;">${ui.blog.englishPostsNote}</p>`;
    if (!out.includes('blog-locale-note')) {
      out = out.replace(/<div id="blog-posts-container"/, `${note}<div id="blog-posts-container"`);
    }
  }

  return unmaskDiagramAssetSrc(out, diagramSrcTokens);
}
