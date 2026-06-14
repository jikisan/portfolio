# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Site

No build step. Serve locally (required for `fetch()` calls to work):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly via `file://` will fail — browser blocks `fetch()` requests to local JSON files due to CORS.

## Architecture

Static portfolio site. No framework, no package manager, no build tooling.

**Data flow:** `index.html` is a shell with empty placeholders. On `DOMContentLoaded`, `PortfolioApp` (`portfolio_app.js`) fetches all three JSON files in parallel, then renders each section by injecting HTML into the DOM.

**Content lives entirely in JSON:**
- `data/portfolio_config.json` — personal info, skills, navigation
- `data/experience_data.json` — work experience entries + certificates
- `data/projects_data.json` — project cards + GitHub URL

**To update content, only edit the JSON files** — never the HTML directly.

**PDF generation:** `resume_generator.js` exposes `window.resumeGenerator.generatePDF()`. It re-fetches the same JSON files and uses jsPDF (CDN) to build the resume PDF client-side. Some fields in the PDF are hardcoded (phone number, education, skills text, location default) and are not driven by JSON — edit `resume_generator.js` directly for those.

**CSS:** Split across `assets/css/main.css` (base theme, Strata HTML5UP template), `assets/css/nav_menu.css` (sidebar nav), and `assets/css/experiences_section.css` (timeline-style experience list with `--accent-color` CSS variable per entry).

**Skills rendering:** Each skill in `portfolio_config.json` has a `class` field that maps to a CSS class in `main.css` for color theming of the chip.
