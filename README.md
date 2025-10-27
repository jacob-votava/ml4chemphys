# Machine Learning in Chemical Physics @ Princeton

Static site for the ML in ChemPhys journal club, structured around seasonal themes. The site is lightweight, works out of the box on GitHub Pages, and uses a JSON file to keep presentations organized.

## Project structure

```
.
├── index.html                  # Landing page rendered by GitHub Pages
├── about.html                  # Standalone About page
├── season-1.html               # Season 1 detail page (duplicate for new seasons)
├── assets
│   ├── css
│   │   └── style.css           # Shared visual system
│   ├── data
│   │   ├── site.json           # Global copy (nav, join link, home hero, about, sponsors, season list)
│   │   └── seasons
│   │       └── season-1.json   # Per-season content and presentations
│   ├── images
│   │   ├── organizers_and_sponsors
│   │   │   ├── jacob-votava.svg
│   │   │   ├── mortiz-obenauer.svg
│   │   │   ├── pistm.svg
│   │   │   └── princeton-chemistry.svg
│   │   └── season-1            # Paper screenshots for Season 1
│   │       ├── paper-1.png
│   │       └── paper-6.png
│   └── slides
│       └── season-1            # Season slide decks referenced from JSON
│           └── README.txt
│   └── js
│       ├── site.js             # Shared navigation + sponsors renderer
│       ├── home.js             # Home-page hero + season cards
│       ├── about.js            # About-page copy + organizers
│       └── season.js           # Season detail rendering
└── README.md
```

## Editing content

1. Update `assets/data/site.json` for global copy:
   - `pages`: navigation labels + destinations
   - `mailingList`: label + URL for the “Join Us” button (set `openInNewTab` to `false` for same-tab navigation)
   - `home.hero`: landing page headline and call-to-action
   - `about`: about-page hero, body paragraphs, and `organizers`
     - Each organizer supports `name`, `affiliation`, `bio`, `headshot`, and optional `linkedin`
   - `sponsors`: supporters shown on the About page (each supports `logo`, `note`, and `url`)
   - `seasons`: metadata for each season card (id, title, description, `page` link, status)
2. Edit or add per-season files under `assets/data/seasons/` (e.g., `season-1.json`). Each file can include:
   - `title`, `lead`, `listTitle`, `listDescription`
   - `presentations`: array of talks with `title`, `presenter`, optional `presenterLink`, `date`, `summary`, `paper`, `resources`, and `tags`
     - `paper.screenshot` should point to an asset in `assets/images/<season-id>/`
     - To link local slide decks, place the files in `assets/slides/<season-id>/` and use a relative URL such as `assets/slides/season-1/my-talk.pdf`
3. Place paper screenshots (PNG/JPG/SVG) inside `assets/images/<season-id>/` and reference them via `paper.screenshot`.
   - Organizer headshots live in `assets/images/organizers_and_sponsors/`
4. Optional resource buttons are generated from the `resources` array. Example resource object:
   ```json
   {
     "type": "slides",
     "label": "Slide deck",
     "url": "https://example.com/slides.pdf"
   }
   ```
   If you omit a `paper` resource, the renderer will automatically add one using `paper.link`.

The data renderer sorts presentations by date (newest first). It also builds the season selector, hero statistics, and per-talk resource buttons automatically.

## Local preview

Because this is a completely static site, you can open `index.html` directly in a browser. When testing locally with the file protocol, some browsers block `fetch` requests. If that happens, run a tiny static server instead:

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Deploying to GitHub Pages

1. Push the contents of this repository to GitHub.
2. In repository settings, enable GitHub Pages with the `main` branch and `/ (root)` folder.
3. The site will be available at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Extending later

- Add a new season by duplicating `season-1.html` (rename to `season-N.html`), creating `assets/data/seasons/season-N.json`, and appending metadata to the `seasons` array in `assets/data/site.json`.
- Keep About copy and organizer roster fresh by editing the `about` block in `assets/data/site.json`.
- Surface additional supporters by appending to the `sponsors` array in `assets/data/site.json`.
- If you adopt a static-site generator later, this structure maps directly to layouts + data collections; `site.json` can become global config while the season JSON files become collections.
- Tune the visual identity (colors, typography, spacing) by editing the CSS custom properties at the top of `assets/css/style.css`.

## License

Feel free to adapt the layout and code for other journal clubs or reading groups.
