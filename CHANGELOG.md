# Changelog

All notable changes to this project are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

## [Unreleased]

### Added

- Public site upgraded to a multi-page lab: Home (hero, who this is for, what it checks, what it cannot do, workshop use, calls to action), Website Check, PDF Check, p5 / Creative Coding Check, and About, with consistent keyboard-accessible navigation, `aria-current` page indication, skip links, semantic landmarks, and external links opening in new tabs with `rel="noopener noreferrer"` and accessible labels.
- Website Check results are now grouped into plain-language categories (Page structure, Images and media, Links and buttons, Forms, Color and contrast, Keyboard access, Recommendations), mapped from axe-core rule tags.

- Quick website check by web address on the public site: fetches a copy of the page (direct or via a public relay), renders it in a scripts-sandboxed iframe wrapper with axe-core injected, and reports results with an explicit "quick check of a copy" note in every report. The bookmarklet remains the documented accurate path, and the site's "being upfront" section spells out the difference.
- PDF report download on the public site (`src/reporters/pdf-reporter.ts`): generates a plain-language, paginated PDF report in the browser via pdf-lib, with title and language metadata set.

- No-code public site (`src/site/`, deployed to GitHub Pages on push to `main`): check a PDF by choosing a file (analyzed entirely in the browser), check a p5.js sketch by pasting code, and audit any website with a drag-to-bookmarks "Audit this page" bookmarklet that renders plain-language results in an on-page overlay (axe-core bundled, shadow-DOM isolated).
- Browser-safe core modules (`context-filter`, `p5-checks`, `pdf-checks`, `summarize`) so the same check logic runs in the CLI and in the browser; Node adapters now delegate to them.

- Navigation human-review prompts: bypass/skip navigation (2.4.1), focus order (2.4.3), focus visibility (2.4.7 / 2.4.11), consistent navigation (3.2.3), and multiple ways to find content (2.4.5).
- PDF auditor (`a11y-lab audit-pdf`, `npm run audit:pdf`): checks a local or remote PDF's tag structure, document language, and document title using `pdf-lib` (no browser involved), plus eight PDF-specific human-review prompts (reading order, alt text, heading structure, form field labels, table headers, color contrast, link text, permissions). Adds `examples/pdf-good` and `examples/pdf-needs-work` fixtures and `docs/pdf-accessibility-guide.md`.

## [0.1.0] - 2026-07-01

### Added

- CLI (`a11y-lab audit`, `audit-p5`, `report`) for auditing public URLs and local HTML files with Playwright + axe-core.
- p5.js sketch auditor detecting missing canvas descriptions, mouse-only interaction without keyboard alternatives, and unpaused animation loops.
- WCAG 2+ rule and human-review-prompt layer covering motion, flashing, captions, transcripts, keyboard-only use, cognitive load, plain-language navigation, canvas descriptions, sound alternatives, touch target size, consistent help, accessible authentication, and multilingual labels.
- Markdown, JSON, and console reporters.
- Vite + React web UI with a dev-server audit API.
- Example fixtures (`simple-html-site`, `p5-sketch-good`, `p5-sketch-needs-work`) and a sample report.
- JSON schemas for audit results and rule definitions.
