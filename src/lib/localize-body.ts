import type { Locale } from '../i18n/config';
import { getUi } from '../i18n';
import itReplacements from '../i18n/replacements/it.json';

type Replacement = [string | RegExp, string];
type ReplacementEntry = { en: string; it: string };

type ReplacementFile = {
  byStem?: Record<string, ReplacementEntry[]>;
  replacements?: ReplacementEntry[];
};

const stemCache = new Map<string, Replacement[]>();

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
  let out = html;

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
      ['Ready. Set. Cloud.', 'Pronto. Impostato. Nuvola.'],
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
  };

  const stemKey = stem.replace(/\//g, '_');
  const all = [...getReplacementPairs(stemKey), ...legacy, ...(perPage[pageKey] ?? [])];

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

  return out;
}
