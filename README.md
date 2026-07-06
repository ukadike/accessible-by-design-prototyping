# Accessibility Audit Lab

[![test](https://github.com/ukadike/accessible-by-design-prototyping/actions/workflows/test.yml/badge.svg)](https://github.com/ukadike/accessible-by-design-prototyping/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-blue.svg)](CODE_OF_CONDUCT.md)

Accessibility Audit Lab is an open-source WCAG 2.2+ auditing toolkit for websites, p5.js sketches, PDFs, creative coding projects, civic media, and experimental interfaces.

It combines automated accessibility checks, p5/canvas-specific review, PDF structural checks, plain-language remediation guidance, and structured reports that help teams understand what to fix next.

This repository also hosts the original [Accessible by Design workshop guide](docs/workshop-guide.md), which this tool grew out of.

This project is part of the [Small Systems Lab](https://github.com/ukadike/Small-Systems-Lab) ecosystem ([hub site](https://ukadike.github.io/small-systems-lab/)).

## No coding needed — use it in your browser

**→ [ukadike.github.io/accessible-by-design-prototyping](https://ukadike.github.io/accessible-by-design-prototyping/)**

The hosted version requires no installation and no terminal:

- **Check your website** two ways: a quick check by typing a web address (fast, examines a fetched copy of the page, clearly labeled as partial), or the drag-to-bookmarks-bar "Audit this page" button for complete results right on your page
- **Check a PDF** by choosing a file — it's analyzed in your browser and never uploaded
- **Check a p5.js sketch** by pasting your code
- **Download results** as a plain-language PDF report, a text report, or developer-friendly JSON

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

## Documentation

- [docs/audit-methodology.md](docs/audit-methodology.md) — how an audit runs, end to end
- [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md) — the WCAG 2+ extension layer and where its rules live
- [docs/human-review-guide.md](docs/human-review-guide.md) — how to run the manual-review prompts
- [docs/p5-accessibility-guide.md](docs/p5-accessibility-guide.md) — p5.js/canvas-specific guidance
- [docs/pdf-accessibility-guide.md](docs/pdf-accessibility-guide.md) — PDF-specific guidance
- [docs/funding-language.md](docs/funding-language.md) — the problem space this project addresses
- [docs/workshop-guide.md](docs/workshop-guide.md) — the original Accessible by Design workshop guide
- [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md) — repository structure/navigation audit and cleanup log
- [SCHEMA_CARD.md](SCHEMA_CARD.md) — project summary: purpose, data structures, interfaces, dependencies
- [INDEX.md](INDEX.md) — full site map of every doc, rule file, schema, and example in this repo
- [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md) · [CHANGELOG.md](CHANGELOG.md)

## Repository Structure

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
reports/      sample Markdown/JSON audit report output
tests/        Vitest unit tests
```

The public site is built with `npm run build:site` and deployed to GitHub Pages automatically by `.github/workflows/deploy-pages.yml` on every push to `main`.

## Disclaimer

This tool is an accessibility aid, not a legal compliance certification.

## Contributing

Contributions are welcome — new WCAG 2+ rules and human-review prompts especially. See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, the PR checklist, and how to add a rule. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

Security issues should be reported privately — see [SECURITY.md](SECURITY.md).

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Related SSL Projects

- [Small Systems Lab](https://ukadike.github.io/small-systems-lab/) — ecosystem hub
- [Omoluabi](https://ukadike.github.io/omoluabi/) — editorial intelligence
- [Earth Sensors Lab](https://ukadike.github.io/earth-sensors-lab/) — accessible STEAM research
- [Echo](https://ukadike.github.io/echo/) — AI literacy
- [Umada](https://ukadike.github.io/umada/) — speculative worldbuilding

## Credits

Adekemi (Kemi) Hanna Sijuwade-Ukadike

## License

MIT — see [LICENSE](LICENSE).
