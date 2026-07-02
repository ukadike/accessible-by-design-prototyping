# Accessibility Audit Lab

[![test](https://github.com/ukadike/accessible-by-design-prototyping/actions/workflows/test.yml/badge.svg)](https://github.com/ukadike/accessible-by-design-prototyping/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-blue.svg)](CODE_OF_CONDUCT.md)

Accessibility Audit Lab is an open-source WCAG 2.2+ auditing toolkit for websites, p5.js sketches, PDFs, creative coding projects, civic media, and experimental interfaces.

It combines automated accessibility checks, p5/canvas-specific review, PDF structural checks, plain-language remediation guidance, and structured reports that help teams understand what to fix next.

This repository also hosts the original [Accessible by Design workshop guide](docs/workshop-guide.md), which this tool grew out of.

## No coding needed — use it in your browser

**→ [ukadike.github.io/accessible-by-design-prototyping](https://ukadike.github.io/accessible-by-design-prototyping/)**

The hosted version requires no installation and no terminal:

- **Check your website** with a drag-to-bookmarks-bar "Audit this page" button — results appear right on your page
- **Check a PDF** by choosing a file — it's analyzed in your browser and never uploaded
- **Check a p5.js sketch** by pasting your code

Everything below this point is for developers who want the command-line tool, the source, or to contribute.

## What It Does

- Audits public URLs
- Audits local HTML files
- Reviews p5.js sketches for canvas accessibility patterns
- Audits PDFs (local files or public URLs) for tagging, language, and title
- Maps issues to WCAG 2.0, 2.1, and 2.2 where possible
- Adds a WCAG 2+ layer for creative and multimodal accessibility
- Generates Markdown and JSON reports
- Provides next-step guidance for designers, developers, educators, and artists

## What It Does Not Do

This tool does not provide legal certification. Automated testing can only catch some accessibility issues. Human review with disabled users and assistive technology testing is still necessary.

## Why p5.js?

Creative coding, education, and civic media often use canvas-based interfaces that ordinary web audits may not fully understand. This project adds support for reviewing sketches, descriptions, keyboard access, motion, sound, and multimodal interaction.

## Getting Started

```bash
npm install
npm run build
npm run test
npm run audit -- https://example.com
npm run audit:p5 -- ./examples/p5-sketch-needs-work/index.html
npm run audit:pdf -- ./examples/pdf-needs-work/document.pdf
npm run dev
```

`npm run audit`, `npm run audit:p5`, and `npm run audit:pdf` print a console summary and write Markdown/JSON reports to `./reports`. `npm run dev` starts the web UI at the URL Vite prints in the terminal.

## Repository Structure

See [docs/audit-methodology.md](docs/audit-methodology.md) for how audits work, [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md) for the WCAG 2+ extension layer, [docs/p5-accessibility-guide.md](docs/p5-accessibility-guide.md) for p5.js-specific guidance, and [docs/pdf-accessibility-guide.md](docs/pdf-accessibility-guide.md) for PDF-specific guidance.

```txt
src/
  core/       audit orchestration, WCAG mapping, severity, rules engine (browser-safe check logic lives here too)
  adapters/   Playwright + axe-core adapters for URLs/HTML/p5 sketches, plus a pdf-lib adapter for PDFs
  reporters/  Markdown, JSON, and console report generators
  p5-plugin/  optional in-browser helper for p5.js sketch authors
  cli/        the a11y-lab command-line tool
  web/        the Vite + React developer web UI
  site/       the public no-code site (GitHub Pages) + "Audit this page" bookmarklet
rules/        WCAG core mapping and WCAG 2+ rule/prompt definitions
schemas/      JSON schemas for audit results and rule definitions
examples/     sample HTML, p5.js, and PDF fixtures used in docs and tests
docs/         methodology, WCAG 2+ framework, p5.js guide, PDF guide, and workshop guide
tests/        Vitest unit tests
```

The public site is built with `npm run build:site` and deployed to GitHub Pages automatically by `.github/workflows/deploy-pages.yml` on every push to `main`.

## Disclaimer

This tool is an accessibility aid, not a legal compliance certification.

## Contributing

Contributions are welcome — new WCAG 2+ rules and human-review prompts especially. See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, the PR checklist, and how to add a rule. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

Security issues should be reported privately — see [SECURITY.md](SECURITY.md).

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Credits

Adekemi (Kemi) Hanna Sijuwade-Ukadike

## License

MIT — see [LICENSE](LICENSE).
