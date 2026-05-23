# Italian marketing site — wording audit

Generated: 2026-05-23

Scope: marketing pages under `/it/` (blog post bodies excluded).

## Executive summary

- **Total findings:** 140
- **By severity:** P1: 40, P2: 57, P0: 43
- **By issue code:** ANGLICISM: 36, META: 26, CALQUE: 16, STYLE: 6, CRITICAL: 7, TERMINOLOGY: 7, MISSING: 41, MIXED: 1

Deliverable for rework agent: [`audit-it-wording.csv`](audit-it-wording.csv)

### Top P0 fixes (start here)

| ID | Page | Issue | Current |
|----|------|-------|--------|
| IT-0015 | /it/atomos.html | CRITICAL | Scopri di più sugli elettrodi… |
| IT-0018 | /it/atomosphere.html | CRITICAL | Scopri di più sugli elettrodi… |
| IT-0036 | /it/electros.html | CRITICAL | Guarda gli elettrodi in azione… |
| IT-0045 | /it/index.html | CRITICAL | Scopri di più sugli elettrodi… |
| IT-0048 | /it/index.html | CRITICAL | Magazzinaggio… |
| IT-0049 | /it/install-atomos.html | CRITICAL | Guida all'installazione degli elettrodi… |
| IT-0063 | /it/solutions/ai.html | CRITICAL | Integrazione del quadro… |
| IT-0084 | /it/index.html | MISSING | Whether you're a startup scaling rapidly or an enterprise modernizing … |
| IT-0085 | /it/index.html | MISSING | Join hundreds of organizations that have revolutionized their cloud op… |
| IT-0086 | /it/index.html | MISSING | Elemento provides bank-grade security with end-to-end encryption, comp… |
| IT-0087 | /it/index.html | MISSING | Elemento supports 235+ data centers worldwide across all major cloud p… |
| IT-0088 | /it/about.html | MISSING | Learn about our… |
| IT-0090 | /it/about.html | MISSING | and learn about our… |
| IT-0091 | /it/about.html | MISSING | Pioneering the next generation of cloud infrastructure with cutting-ed… |
| IT-0096 | /it/products.html | MIXED | Deploy AtomOS on your own private servers. Pieno control over hardware… |

## Terminology glossary (canonical IT)

| EN | Avoid | Prefer |
|----|-------|--------|
| Cloud (infrastructure) | nuvola | cloud |
| Vendor lock-in | blocco del venditore | vendor lock-in / vincolo al fornitore |
| Seamless | senza soluzione di continuità | senza interruzioni, fluido |
| Framework | quadro | framework |
| Electros (product) | elettrodi | Electros |
| Home (breadcrumb) | Casa | Home |
| Privacy policy | politica sulla riservatezza | Informativa sulla privacy |
| Storage (section) | Magazzinaggio | Archiviazione |
| Colocation | Coubicazione | Colocazione |
| Self-hostable | (literal) | auto-ospitabile / installabile on-premise |

## Findings by page

### /* (global)

- **IT-0001** [P1/ANGLICISM] nav
  - Current: "Prenota una call"
  - Source: `src/i18n/ui/it.json` → `nav.bookCall`
  - Note: Use Prenota una chiamata.
- **IT-0002** [P1/ANGLICISM] footer
  - Current: "Piattaforma cloud ad alte prestazioni, vendor-neutral, economica, green e self-hostable."
  - Source: `src/i18n/ui/it.json` → `footer.tagline`
  - Note: Replace vendor-neutral, green, self-hostable with Italian.
- **IT-0003** [P2/META] footer
  - Current: "politica sulla riservatezza"
  - Source: `src/i18n/ui/it.json` → `footer.privacy`
  - Note: Use Informativa sulla privacy.
- **IT-0004** [P1/ANGLICISM] pages.index
  - Current: "Cloud vendor-neutral, economico, green, ad alte prestazioni e self-hostable, pronto per l'infrastructure-as-code."
  - Source: `src/i18n/ui/it.json` → `pages.index.heroSubtitle`
  - Note: Mixed EN/IT in hero subtitle.
- **IT-0005** [P2/META] pages.about
  - Current: "Elemento | Informazioni su | Missione e team della piattaforma cloud"
  - Source: `src/i18n/ui/it.json` → `pages.about.title`
  - Note: Informazioni su → Chi siamo.
- **IT-0006** [P1/ANGLICISM] pages.about
  - Current: "Trasformiamo l'infrastruttura cloud con soluzioni vendor-neutral, sostenibili e convenienti."
  - Source: `src/i18n/ui/it.json` → `pages.about.heroSubtitle`
  - Note: vendor-neutral left in Italian string.
- **IT-0007** [P1/META] pages.atomos
  - Current: "AtomOS: potenzia il tuo cloud con l'hypervisor Linux | Elemento Nuvola"
  - Source: `src/i18n/ui/it.json` → `pages.atomos.title`
  - Note: Elemento Nuvola → Elemento Cloud.
- **IT-0008** [P1/CALQUE] pages.atomosphere
  - Current: "Il gateway API multicloud di Elemento connette oltre 235 cloud e nodi on-premise in un'unica rete programmabile. Control…"
  - Source: `src/i18n/ui/it.json` → `pages.atomosphere.description`
  - Note: senza soluzione di continuità for seamless.
- **IT-0009** [P1/META] pages.solutions_ai
  - Current: "Startup e laboratori di ricerca in materia di intelligenza artificiale/scienza dei dati | Elemento"
  - Source: `src/i18n/ui/it.json` → `pages.solutions_ai.title`
  - Note: Title overly long/formal; shorten for SERP.
- **IT-0010** [P1/CALQUE] pages.solutions_ai
  - Current: "Addestra, distribuisci e scala i carichi di lavoro AI senza soluzione di continuità su cloud e nodi on-premise. Elemento…"
  - Source: `src/i18n/ui/it.json` → `pages.solutions_ai.description`
  - Note: senza soluzione di continuità.
- **IT-0011** [P2/STYLE] blog
  - Current: "Gli articoli sono pubblicati in inglese. Interfaccia in italiano; i contenuti degli articoli restano in inglese fino a t…"
  - Source: `src/i18n/ui/it.json` → `blog.englishPostsNote`
  - Note: OK content; verify tone with brand voice.
- **IT-0131** [P1/MISSING] accessibility
  - Current: "Skip to main content"
  - Source: `src/layouts/BaseLayout.astro or ui/it.json` → `TBD skipLink`
  - Note: Add Italian skip link: Vai al contenuto principale
- **IT-0132** [P2/MISSING] chrome
  - Current: "Toggle theme"
  - Source: `src/layouts/BaseLayout.astro` → `theme toggle aria`
  - Note: Translate theme toggle label
- **IT-0133** [P1/MISSING] cookie banner
  - Current: "Your consent preferences for tracking technologies"
  - Source: `cookie consent script/HTML` → `TBD`
  - Note: Translate cookie consent UI

### /it/index.html

- **IT-0039** [P1/CALQUE] body copy
  - Current: "Elemento ti consente di creare ed eseguire la tua infrastruttura cloud in completa libertà. Scegli dove eseguirlo e noi …"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Use il tuo cloud not nuvola in product copy.
- **IT-0041** [P1/ANGLICISM] body copy
  - Current: "Sovranità dei dati tramite distribuzioni self-hostable"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Use auto-ospitabile or installabile on-premise.
- **IT-0042** [P2/TERMINOLOGY] body copy
  - Current: "Scopri i componenti di Cloud Factory"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0043** [P1/CALQUE] body copy
  - Current: "Fai girare la tua nuvola ovunque"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Do not use nuvola for cloud infrastructure. E.g. Distribuisci il tuo cloud ovunque.
- **IT-0044** [P1/STYLE] body copy
  - Current: "Sfuggire al blocco del venditore"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Awkward calque. Prefer Libertà dal vendor lock-in or Nessun vincolo al fornitore.
- **IT-0045** [P0/CRITICAL] body copy
  - Current: "Scopri di più sugli elettrodi"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.
- **IT-0046** [P1/CALQUE] body copy
  - Current: "Pronto. Impostato. Nuvola."
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Calque of Ready. Set. Cloud. Use Pronti. Via. Cloud. or equivalent IT slogan; never nuvola for cloud product.
- **IT-0047** [P2/META] body copy
  - Current: "Ulteriori informazioni su AtomOS"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: About page title: prefer Chi siamo | Elemento.
- **IT-0048** [P0/CRITICAL] body copy
  - Current: "Magazzinaggio"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Storage section: magazzinaggio = warehousing. Use Archiviazione or Storage.
- **IT-0083** [P1/CALQUE] visible text
  - Current: "la tua nuvola ovunque"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use il tuo cloud not nuvola in product copy.
- **IT-0084** [P0/MISSING] visible text
  - Current: "Whether you're a startup scaling rapidly or an enterprise modernizing legacy systems, Elemento adapts to your needs. Dis…"
  - Source: `src/i18n/ui/it.json` → `blog.byAuthor`
  - Note: English body copy block.
- **IT-0085** [P0/MISSING] visible text
  - Current: "Join hundreds of organizations that have revolutionized their cloud operations with Elemento. Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0086** [P0/MISSING] visible text
  - Current: "Elemento provides bank-grade security with end-to-end encryption, compliance-ready architecture, and the ability to run …"
  - Source: `legacy HTML / pipeline gap`
  - Note: FAQ answer still English.
- **IT-0087** [P0/MISSING] visible text
  - Current: "Elemento supports 235+ data centers worldwide across all major cloud providers. This includes AWS regions, Azure regions…"
  - Source: `legacy HTML / pipeline gap`
  - Note: FAQ answer still English.
- **IT-0134** [P0/MISSING] tech-specs intro
  - Current: "Enterprise-grade infrastructure designed for modern cloud-native applications."
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: needs extract + import or localize-body handler
- **IT-0135** [P1/MISSING] tech-specs h3
  - Current: "Cloud Providers & Federation"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Translate section headings in tech specs block
- **IT-0136** [P1/MISSING] tech-specs h3
  - Current: "Clustering & Networking"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Translate section headings in tech specs block
- **IT-0137** [P1/MISSING] tech-specs h3
  - Current: "Security & Compliance"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Translate section headings in tech specs block
- **IT-0138** [P0/MISSING] cta
  - Current: "Ready to Transform Your Infrastructure?"
  - Source: `src/i18n/replacements/it.json` → `byStem.index`
  - Note: Translate CTA heading and body
- **IT-0139** [P0/MISSING] inline links
  - Current: "technical documentation"
  - Source: `legacy HTML / pipeline gap` → `index inline anchors`
  - Note: Extract anchor text strings; translate link labels
- **IT-0140** [P0/MISSING] inline links
  - Current: "advanced technology stack"
  - Source: `legacy HTML / pipeline gap` → `index inline anchors`
  - Note: Extract anchor text strings; translate link labels

### /it/about.html

- **IT-0012** [P2/STYLE] body copy
  - Current: "Partenariato"
  - Source: `src/i18n/replacements/it.json` → `byStem.about`
  - Note: Partnership → Partnership or Collaborazioni (Partenariato is rare in IT B2B).
- **IT-0013** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.about`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0088** [P0/MISSING] visible text
  - Current: "Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0089** [P1/ANGLICISM] visible text
  - Current: "vendor-neutral"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use indipendente dal fornitore or neutrale rispetto al vendor.
- **IT-0090** [P0/MISSING] visible text
  - Current: "and learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0091** [P0/MISSING] visible text
  - Current: "Pioneering the next generation of cloud infrastructure with cutting-edge technology and sustainable practices. Discover …"
  - Source: `src/i18n/ui/it.json` → `blog.byAuthor`
  - Note: Translate and import via localization pipeline
- **IT-0092** [P2/ANGLICISM] visible text
  - Current: "-driven on-premise and appliance deployments—so organizations can run cloud-grade stacks without hyperscaler lock-in."
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0093** [P2/ANGLICISM] visible text
  - Current: ": deeper multi-cloud and hybrid operations, broader partner and provider integrations, and the next wave of security and…"
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.

### /it/products.html

- **IT-0057** [P2/META] body copy
  - Current: "Distribuisci AtomOS sui tuoi server privati. Controllo completo su hardware, rete e sicurezza con clustering autonomo tr…"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: About page title: prefer Chi siamo | Elemento.
- **IT-0058** [P2/ANGLICISM] body copy
  - Current: "Prezzi basati su server invece che su licenza per CPU o per VM. Incoraggia l'utilizzo efficiente delle risorse e riduce …"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.
- **IT-0059** [P1/STYLE] body copy
  - Current: "2. Coubicazione AtomOS"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: Colocation → Colocazione (standard IT Italian).
- **IT-0060** [P1/STYLE] body copy
  - Current: "Coubicazione AtomOS"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: Colocation → Colocazione (standard IT Italian).
- **IT-0061** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0094** [P1/ANGLICISM] visible text
  - Current: "vendor-neutral"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use indipendente dal fornitore or neutrale rispetto al vendor.
- **IT-0095** [P1/ANGLICISM] visible text
  - Current: "Build your cloud with vendor-neutral, high-performance components that work seamlessly together. Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use indipendente dal fornitore or neutrale rispetto al vendor.
- **IT-0096** [P0/MIXED] visible text
  - Current: "Deploy AtomOS on your own private servers. Pieno control over hardware, networking, and security with autonomous cluster…"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: Partial translation. Full sentence must be Italian.
- **IT-0097** [P2/ANGLICISM] visible text
  - Current: "No vendor lock-in. Use your existing cloud accounts, infrastructure, and tools. Elemento works with your current setup, …"
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0098** [P1/ANGLICISM] visible text
  - Current: "Self-hostable on your infrastructure"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use auto-ospitabile or installabile on-premise.
- **IT-0099** [P0/MISSING] visible text
  - Current: "Server-based pricing instead of per-CPU or per-VM licensing. Encourages efficient resource utilization and reduces total…"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0100** [P2/ANGLICISM] visible text
  - Current: "green computing initiatives"
  - Source: `legacy HTML / pipeline gap`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.
- **IT-0101** [P2/ANGLICISM] visible text
  - Current: "Green computing incentives"
  - Source: `legacy HTML / pipeline gap`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.
- **IT-0102** [P2/ANGLICISM] visible text
  - Current: "No hidden fees or vendor lock-in costs"
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0103** [P1/ANGLICISM] visible text
  - Current: "Join organizations transforming their infrastructure with vendor-neutral, cost-effective cloud solutions. Scopri di più …"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use indipendente dal fornitore or neutrale rispetto al vendor.
- **IT-0141** [P0/MISSING] hero h1
  - Current: "Meet the Elemento Prodotti"
  - Source: `src/i18n/replacements/it.json` → `byStem.products`
  - Note: Fully translate hero H1

### /it/contact.html

- **IT-0032** [P1/ANGLICISM] body copy
  - Current: "SÌ! Elemento è progettato per essere self-hostable, offrendoti il ​​controllo completo sulla tua infrastruttura e sui tu…"
  - Source: `src/i18n/replacements/it.json` → `byStem.contact`
  - Note: Use auto-ospitabile or installabile on-premise.
- **IT-0033** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.contact`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0104** [P0/MISSING] visible text
  - Current: "Ready to transform your"
  - Source: `legacy HTML / pipeline gap`
  - Note: CTA section still English on index.
- **IT-0105** [P0/MISSING] visible text
  - Current: ". Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0106** [P0/MISSING] visible text
  - Current: "Whether you're looking to get started with"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0107** [P0/MISSING] visible text
  - Current: ", we're here to help. Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0108** [P0/MISSING] visible text
  - Current: "Choose the support option that works best for you"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links
- **IT-0109** [P1/ANGLICISM] visible text
  - Current: "self-hostable"
  - Source: `legacy HTML / pipeline gap`
  - Note: Use auto-ospitabile or installabile on-premise.
- **IT-0110** [P0/MISSING] visible text
  - Current: "Join hundreds of organizations that have revolutionized their cloud operations with Elemento. Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.

### /it/technology.html

- **IT-0066** [P1/CALQUE] body copy
  - Current: "Elemento consente alle organizzazioni di gestire infrastrutture IT complesse su più cloud e ambienti on-premise senza so…"
  - Source: `src/i18n/replacements/it.json` → `byStem.technology`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0067** [P2/ANGLICISM] body copy
  - Current: "Prevenzione del lock-in del fornitore"
  - Source: `src/i18n/replacements/it.json` → `byStem.technology`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0068** [P1/CALQUE] body copy
  - Current: "Nuvola verde"
  - Source: `src/i18n/replacements/it.json` → `byStem.technology`
  - Note: Green cloud → cloud sostenibile.
- **IT-0069** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.technology`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0111** [P0/MISSING] visible text
  - Current: "and learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0112** [P2/ANGLICISM] visible text
  - Current: "without vendor lock-in."
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0113** [P0/MISSING] visible text
  - Current: "book on BookStack hosts the C4 whitepaper, connector specification, and Pacchetto tecnologico mesone for mapping existin…"
  - Source: `src/i18n/replacements/it.json` → `byStem.technology`
  - Note: English body copy block.
- **IT-0114** [P0/MISSING] visible text
  - Current: "Comprehensive monitoring, logging, and analytics that provide insights into performance, costs, and environmental impact…"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0115** [P0/MISSING] visible text
  - Current: "Ready to see how our cutting-edge technology can transform your infrastructure? Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.

### /it/atomos.html

- **IT-0014** [P2/META] body copy
  - Current: "Ulteriori informazioni sulla tecnologia"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomos`
  - Note: About page title: prefer Chi siamo | Elemento.
- **IT-0015** [P0/CRITICAL] body copy
  - Current: "Scopri di più sugli elettrodi"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomos`
  - Note: Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.
- **IT-0016** [P2/META] body copy
  - Current: "Ulteriori informazioni sull'orbitale"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomos`
  - Note: About page title: prefer Chi siamo | Elemento.
- **IT-0017** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomos`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0116** [P0/MISSING] visible text
  - Current: "Install the AtomOS CLI tool:"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links
- **IT-0117** [P0/MISSING] visible text
  - Current: "Install the AtomOS services"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links
- **IT-0118** [P0/MISSING] visible text
  - Current: "Ready to deploy your first VM in minutes!"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links

### /it/electros.html

- **IT-0035** [P1/CALQUE] body copy
  - Current: "Distribuisci le VM su cloud pubblici e nodi privati ​​senza soluzione di continuità, bilanciando costi, prestazioni e co…"
  - Source: `src/i18n/replacements/it.json` → `byStem.electros`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0036** [P0/CRITICAL] body copy
  - Current: "Guarda gli elettrodi in azione"
  - Source: `src/i18n/replacements/it.json` → `byStem.electros`
  - Note: Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.
- **IT-0037** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.electros`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0119** [P0/MISSING] visible text
  - Current: "Whether you're managing VMs on"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0120** [P0/MISSING] visible text
  - Current: "provides intelligent remote access that automatically selects the optimal protocol based on your VM's operating system a…"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0121** [P0/MISSING] visible text
  - Current: "Ready to manage your multicloud infrastructure!"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links

### /it/atomosphere.html

- **IT-0018** [P0/CRITICAL] body copy
  - Current: "Scopri di più sugli elettrodi"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomosphere`
  - Note: Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.
- **IT-0019** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomosphere`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0122** [P2/ANGLICISM] visible text
  - Current: "in real-time to choose the most cost-effective option for each workload without vendor lock-in."
  - Source: `legacy HTML / pipeline gap`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.

### /it/orbital.html

- **IT-0051** [P2/TERMINOLOGY] body copy
  - Current: "Che tu abbia bisogno di un server di sviluppo, di un cluster di produzione o di una distribuzione aziendale, Orbital for…"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0052** [P2/TERMINOLOGY] body copy
  - Current: "Soluzioni hardware e software complete progettate per le operazioni di Cloud Factory"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0053** [P2/TERMINOLOGY] body copy
  - Current: "La soluzione on-premise completa per la tua Cloud Factory"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0054** [P2/TERMINOLOGY] body copy
  - Current: "Pronto a implementare la tua infrastruttura Cloud Factory?"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0055** [P1/STYLE] body copy
  - Current: "Strutture di coubicazione"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Colocation → Colocazione (standard IT Italian).
- **IT-0056** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.orbital`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0123** [P2/TERMINOLOGY] visible text
  - Current: "for Your Cloud Factory"
  - Source: `legacy HTML / pipeline gap`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.
- **IT-0124** [P0/MISSING] visible text
  - Current: "Whether you need a"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.
- **IT-0125** [P2/TERMINOLOGY] visible text
  - Current: ", Orbitale provides the perfect on-premise foundation for your Cloud Factory infrastructure with complete data sovereign…"
  - Source: `src/i18n/replacements/it.json` → `byStem.atomos`
  - Note: Decide: keep English brand term Cloud Factory or translate Fabbrica cloud consistently.

### /it/compare-costs.html

- **IT-0031** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.compare-costs`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.

### /it/install-atomos.html

- **IT-0049** [P0/CRITICAL] body copy
  - Current: "Guida all'installazione degli elettrodi"
  - Source: `src/i18n/replacements/it.json` → `byStem.install-atomos`
  - Note: Electros (product name) mistranslated as elettrodi (electrodes). Keep Electros.
- **IT-0050** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.install-atomos`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0126** [P0/MISSING] visible text
  - Current: "Install the AtomOS CLI tool:"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links
- **IT-0127** [P0/MISSING] visible text
  - Current: "Ready to deploy your first VM in minutes!"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links
- **IT-0128** [P0/MISSING] visible text
  - Current: "Ready to manage your multicloud infrastructure!"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links

### /it/signup.html

- **IT-0062** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.signup`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.

### /it/brand-guidelines.html

- **IT-0030** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.brand-guidelines`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0129** [P0/MISSING] visible text
  - Current: "Request the full partnership artwork from"
  - Source: `legacy HTML / pipeline gap`
  - Note: needs extract + i18n:import or localize-body handler for nested HTML/links

### /it/blog.html

- **IT-0028** [P2/META] body copy
  - Current: "Blog dell'Elemento"
  - Source: `src/i18n/replacements/it.json` → `byStem.blog`
  - Note: Prefer Blog Elemento or Blog di Elemento.
- **IT-0029** [P2/META] body copy
  - Current: "Casa"
  - Source: `src/i18n/replacements/it.json` → `byStem.blog`
  - Note: Breadcrumb Home mistranslated as Casa. Use Home.
- **IT-0130** [P0/MISSING] visible text
  - Current: "stories from the Elemento team and cloud computing community. Learn about our"
  - Source: `legacy HTML / pipeline gap`
  - Note: English body copy block.

### /it/solutions/index.html

- **IT-0064** [P1/CALQUE] body copy
  - Current: "Addestra, distribuisci e scala i carichi di lavoro AI senza soluzione di continuità su cloud e nodi on-premise. Gestione…"
  - Source: `src/i18n/replacements/it.json` → `byStem.solutions_index`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.

### /it/solutions/ai.html

- **IT-0063** [P0/CRITICAL] body copy
  - Current: "Integrazione del quadro"
  - Source: `src/i18n/replacements/it.json` → `byStem.solutions_ai`
  - Note: framework mistranslated as quadro. Use integrazione del framework / compatibilità con i framework.
- **IT-0071** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/ai.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.
- **IT-0072** [P1/CALQUE] it.faq.items[2].answer
  - Current: "Elemento offre funzionalità di integrazione dei dati senza soluzione di continuità che ti consentono di lavorare con dat…"
  - Source: `CMS/solutions/ai.json` → `it.faq.items[2].answer`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0143** [P1/META] meta title
  - Current: "Startup e laboratori di ricerca in materia di intelligenza artificiale/scienza dei dati | Elemento"
  - Source: `src/i18n/ui/it.json` → `pages.solutions_ai.title`
  - Note: Shorten for SEO: e.g. AI/ML e data science | Elemento

### /it/solutions/devops.html

- **IT-0073** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/devops.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

### /it/solutions/industrial.html

- **IT-0074** [P1/CALQUE] it.useCase.subtitle
  - Current: "La telemetria in tempo reale passa senza soluzione di continuità dai PLC all'analisi e all'ottimizzazione"
  - Source: `CMS/solutions/industrial.json` → `it.useCase.subtitle`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0075** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/industrial.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

### /it/solutions/public-sector.html

- **IT-0076** [P2/META] it.painPoints.items[1].description
  - Current: "Elevati requisiti di conformità per i dati governativi e le informazioni sui cittadini"
  - Source: `CMS/solutions/public-sector.json` → `it.painPoints.items[1].description`
  - Note: About page title: prefer Chi siamo | Elemento.
- **IT-0077** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/public-sector.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

### /it/solutions/regulated.html

- **IT-0078** [P2/ANGLICISM] it.painPoints.items[1].description
  - Current: "Elevato rischio di lock-in quando si utilizzano hyperscaler con requisiti di residenza e conformità dei dati poco chiari"
  - Source: `CMS/solutions/regulated.json` → `it.painPoints.items[1].description`
  - Note: Acceptable in B2B tech; alternative: vincolo al fornitore.
- **IT-0079** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/regulated.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

### /it/solutions/system-integrators.html

- **IT-0080** [P1/CALQUE] it.solution.items[2].description
  - Current: "Livello API per orchestrazione e gestione multi-cloud senza soluzione di continuità"
  - Source: `CMS/solutions/system-integrators.json` → `it.solution.items[2].description`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0081** [P2/ANGLICISM] it.stats.items[1].color
  - Current: "green"
  - Source: `CMS/solutions/system-integrators.json` → `it.stats.items[1].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

### /it/solutions/vmware-alternative.html

- **IT-0065** [P1/CALQUE] body copy
  - Current: "Migrazione senza soluzione di continuità tra ambienti on-premise e cloud con gestione coerente"
  - Source: `src/i18n/replacements/it.json` → `byStem.solutions_vmware-alternative`
  - Note: Calque of seamless. Use senza interruzioni, fluido, integrato.
- **IT-0082** [P2/ANGLICISM] it.stats.items[0].color
  - Current: "green"
  - Source: `CMS/solutions/vmware-alternative.json` → `it.stats.items[0].color`
  - Note: In IT marketing prefer sostenibile or a basse emissioni.

## Handoff for rework agent

1. Edit strings in `src/i18n/ui/it.json`, `localization/strings-it.json`, and/or `src/i18n/replacements/it.json` (or CMS `it` blocks).
2. For `MISSING` rows tagged pipeline gap: extend extract/localize-body before translating.
3. Run `npm run i18n:import` (if strings-it.json updated) and `npm run build`.
4. Re-check P0 URLs: `/it/index.html`, `/it/about.html`, `/it/products.html`, `/it/solutions/ai.html`.
