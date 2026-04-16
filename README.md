# Atlas Help — SPO Production Monitor

An in-app metric lookup web component for the Turner SPO Production Monitor. Lets users instantly look up what any metric means, how it's calculated, and how to interpret it — without leaving the report.

**Live demo:** https://coaedo.github.io/spo-atlas-app/

---

## What's been built

### `<atlas-help>` web component
A zero-dependency Shadow DOM web component that floats over the host page as a `?` button. Clicking it opens a searchable panel of every metric in the SPO Production Monitor.

**Features:**
- Full-text search across metric names, meanings, calculations, and tags
- Page filter pills (All / P1–P6 / Glossary) to scope results to the active report page
- Detail view per metric: **What it means → How it's calculated → How to interpret it**
- Light and dark theme via `theme` attribute
- `page` attribute for programmatic pre-filtering (e.g. wired to Power BI page navigation)
- Safe to embed alongside Power BI — Shadow DOM prevents style conflicts

**Usage:**
```html
<script type="module" src="./src/atlas-help.js"></script>
<atlas-help page="p1"></atlas-help>
```

### Content (`src/data/metrics.js`)
~55 structured metric definitions + a full glossary, sourced from the [Turner SPO Production Monitor Business Logic & Calculation Guide](https://aedocds.notion.site/Atlas-312ab7317eb380e482b4ff49ed84ab4e) (March 2026 snapshot). Each entry has:
```js
{
  id, name, page, section,
  meaning,      // plain-language business definition
  calculation,  // how the number is produced
  interpret,    // how to read and act on it (where applicable)
  tags          // for search
}
```

### Demo (`demo/index.html`)
A mock Atlas app shell — simulated Power BI report layout with KPI cards, sidebar nav, and the web component embedded — for testing and stakeholder review without needing the live PBI embed.

---

## Project structure

```
spo-atlas-app/
├── src/
│   ├── atlas-help.js        ← web component (single file, no build step)
│   └── data/
│       └── metrics.js       ← all metric definitions
├── demo/
│   └── index.html           ← standalone demo page
├── index.html               ← root redirect → demo/index.html
├── vercel.json              ← Vercel rewrite config
└── .claude/
    └── launch.json          ← local dev server config (npx serve, port 3000)
```

---

## Running locally

```bash
npx serve .
# → open http://localhost:3000/demo/index.html
```

No build step, no bundler, no framework. The component uses native ES modules.

---

## What needs to happen next

### 1. Keep metrics in sync with the Notion guide

`src/data/metrics.js` was hand-authored from the March 2026 guide snapshot. As the guide evolves, the metric definitions need to be updated to match.

**Short-term:** manually update `metrics.js` when the guide changes.  
**Longer-term:** the Notion API could be used to pull the guide content programmatically and regenerate `metrics.js` — removing the manual step and ensuring the help content is always in sync.

The Notion page to watch: https://aedocds.notion.site/Atlas-312ab7317eb380e482b4ff49ed84ab4e

---

### 2. Sharpen calculations with the Excel Production Monitor

The current formulas in `metrics.js` come from the prose guide. The Excel Production Monitor (the file produced by Turner's SAP bot) contains the actual calculation logic — more precise formulas, edge case handling, and the 5-gate Savings/Overrun logic in its exact form.

Once access to the Excel is available:
- Review each `calculation` field in `metrics.js` against the actual Excel formulas
- Pay particular attention to: the 5-gate Savings/Overrun logic, GAP hours costing, the OT% calculation, and the Earned Labor formula
- Update or expand the `interpret` fields with any additional guidance from the spreadsheet

---

### 3. Embed in the SPO Monitor / Aedo Flow environment

The component is designed to drop into the existing app with minimal changes. The integration has two parts:

**A. Add the component to the host page**

```html
<!-- In the <head> -->
<script type="module" src="./atlas-help.js"></script>

<!-- Before </body> -->
<atlas-help id="atlas-help"></atlas-help>
```

Copy `src/atlas-help.js` and `src/data/metrics.js` to wherever static assets live in the Aedo Flow environment. The import path in `atlas-help.js` (line 1) references `./data/metrics.js` — keep both files in the same directory.

**B. Wire to Power BI page navigation**

The component accepts a `page` attribute (`p1`–`p6`) that pre-filters the help panel to the active report page. Hook this to the Power BI JavaScript SDK's `pageChanged` event:

```js
const report = powerbi.embed(container, embedConfig);
const helpEl = document.getElementById('atlas-help');

const PAGE_MAP = {
  'Summary':            'p1',
  'Target Projection':  'p2',
  'Production Graphs':  'p3',
  'Top 5 WBS':          'p4',
  'Labor Summary':      'p5',
  'Production Details': 'p6',
};

report.on('pageChanged', event => {
  const page = PAGE_MAP[event.detail.newPage.displayName] ?? 'all';
  helpEl.setAttribute('page', page);
});
```

The display names in `PAGE_MAP` need to match the exact page names configured in the PBI report.

---

### 4. Future: AI chat interface

The metric lookup covers "what is this metric" questions. A Claude-powered chat tab in the same panel would handle more complex questions like:

> "Why is my cost code showing a loss even though no one has worked on it?"  
> "My % Complete Labor is way higher than % Complete Qty — what does that mean?"

The knowledge base (guide content + metrics.js) is already structured for this. Implementation would use the Anthropic API with the guide as a system prompt or RAG source. This was deliberately scoped out of v1 but the data layer is ready for it.

---

## Deployment

| Environment | URL | How to update |
|---|---|---|
| GitHub Pages (current) | https://coaedo.github.io/spo-atlas-app/ | `git push` to `main` — auto-deploys |
| Vercel (preview) | https://spo-atlas-app.vercel.app | `npx vercel --prod` |
| Aedo Flow / SPO Monitor | TBD | See section 3 above |

---

*Built with the [Claude Agent SDK](https://anthropic.com) · Content sourced from the Turner SPO Production Monitor Business Logic & Calculation Guide · March 2026*
