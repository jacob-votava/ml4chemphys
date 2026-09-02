# ML in ChemPhys @ Princeton

Static site for our journal club. Plain HTML/CSS/JS so GitHub Pages can serve it without a build step.

## Repo layout
- `index.html`, `about.html`, `season-*.html` — top-level pages.
- `assets/data/site.json` — global copy (nav, hero text, about blurbs, organizers, sponsors, season list).
- `assets/data/seasons/season-*.json` — talks, resources, and metadata for each season.
- `assets/images/` — hero art, headshots, paper screenshots.
- `assets/slides/` — local slide decks linked from the JSON.
- `assets/js/` and `assets/css/` — small helpers and shared styling.

## How rendering works (read before editing!)
Each page ships static HTML, then JS fetches the JSON and re-renders the same content.
The static HTML is a mirror of the JSON: **when you change copy in a JSON file, make the
same change in the matching HTML file** (hero text, session list header, presentation
counts/date range). If they drift apart, the page briefly flashes the old text on load.
The presentation/organizer/sponsor card grids are empty in the HTML and rendered purely
by JS, so those only need JSON edits.

## Editing content
- Nav labels, hero copy, organizers, and sponsors: `site.json` (+ mirror hero text in the HTML).
- New season: clone the latest `season-N.html`, update its `data-season` attribute and static
  text, add `assets/data/seasons/season-N.json`, and add the season to the `seasons` array
  and `currentSeason` in `site.json` (demote the old season's `status`/`eyebrow`).
- Each presentation supports `title`, `date` (YYYY-MM-DD), `presenter`, `time`, `location`,
  `summary`, an optional `paper` block (`title`, `authors`, `link`, `screenshot`), and a list
  of `resources` (`label` + `url`, e.g. slide decks). Leave `title` empty for TBD talks.

## Preview
The pages load their content with `fetch()`, so opening the files directly (`file://`)
shows only the static shell. Run a local server instead:
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy
Pushing to `main` triggers `.github/workflows/pages.yml`, which publishes the repo root to
GitHub Pages at `https://<user>.github.io/<repo>/`.
