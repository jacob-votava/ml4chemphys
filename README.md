# ML in ChemPhys @ Princeton

Static site for our journal club. Plain HTML/CSS/JS so GitHub Pages can serve it without a build step.

## Repo layout
- `index.html`, `about.html`, `season-*.html` — top-level pages.
- `assets/data/site.json` — global copy (nav, hero text, about blurbs, sponsors, season list).
- `assets/data/seasons/season-1.json` — talks, resources, and metadata for each season.
- `assets/images/` — hero art, headshots, paper screenshots.
- `assets/slides/` — local slide decks linked from the JSON.
- `assets/js/` and `assets/css/` — small helpers and shared styling.

## Editing content
- Update nav labels, hero copy, organizers, and sponsors in `site.json`.
- Add seasons by cloning `season-1.html`, dropping a new JSON file in `assets/data/seasons/`, and listing it in the `seasons` array.
- For each presentation, include `title`, `date`, `presenter`, `summary`, optional `paper` block (with `link` and `screenshot`), and any extra `resources`.

## Preview quickly
Open `index.html` in a browser or run a tiny server:
```bash
python3 -m http.server 8000
```

## Deploy
Push to GitHub and enable Pages on the `main` branch (root folder). The site will publish at `https://<user>.github.io/<repo>/`.
