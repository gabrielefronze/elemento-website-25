# Localization exports

Extract all site copy for translation in one place.

## Generate export

```bash
npm run i18n:extract
```

This writes:

| File | Use |
|------|-----|
| `strings.csv` | Open in Excel or Google Sheets; fill the **it** column |
| `strings.json` | Full dump with metadata (`en`, `it`, `source`, `context`) |
| `by-page/*.json` | Same strings grouped by page (e.g. `index.json`, `about.json`) |

## What is included

- **UI chrome** (`ui.*`) — navbar, footer, blog labels, page meta in `src/i18n/ui/en.json` / `it.json` (already wired in the app)
- **CMS** (`CMS.*`) — team, success stories, solutions, orbital, provider matrix (`en` / `it` blocks in JSON)
- **Page meta** (`meta.*`) — `<title>` and meta description per page
- **Page body** (`body.*`) — headings, paragraphs, buttons, etc. scraped from legacy HTML (reference for translation; not yet fully wired like UI strings)

## Suggested workflow

1. Run `npm run i18n:extract` after content changes.
2. Translate in `strings.csv` (sort/filter by `source` or `id`).
3. Copy translated **UI** strings into `src/i18n/ui/it.json` (keys under `ui.`).
4. Copy translated **CMS** strings into the matching `CMS/**/*.json` `it` blocks.
5. For long **body** copy, either extend `src/lib/localize-body.ts` or migrate pages to structured content in JSON.

Blog posts (`blog-posts/*`) are included as `body.blog-posts_*` entries.

## IDs

- `ui.nav.products` — already used in code via `getUi('it')`
- `body.index.h1.1` — first `<h1>` on the index page body
- `CMS.team.0.role` — team member role in `CMS/team.json`
- `CMS.solutions.ai.en.hero.title` — solution page hero (nested CMS)

Empty **it** cells need translation. Rows that already have Italian (UI + partial CMS) are pre-filled from existing files.
