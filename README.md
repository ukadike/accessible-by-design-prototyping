# Accessibility Audit Lab

Accessibility Audit Lab is an open-source WCAG 2.2+ auditing toolkit for websites, p5.js sketches, creative coding projects, civic media, and experimental interfaces.

It combines automated accessibility checks, p5/canvas-specific review, plain-language remediation guidance, and structured reports that help teams understand what to fix next.

This repository also hosts the original [Accessible by Design workshop guide](docs/workshop-guide.md), which this tool grew out of.

## What It Does

- Audits public URLs
- Audits local HTML files
- Reviews p5.js sketches for canvas accessibility patterns
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
npm run dev
```

`npm run audit` and `npm run audit:p5` print a console summary and write Markdown/JSON reports to `./reports`. `npm run dev` starts the web UI at the URL Vite prints in the terminal.

## Repository Structure

See [docs/audit-methodology.md](docs/audit-methodology.md) for how audits work, [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md) for the WCAG 2+ extension layer, and [docs/p5-accessibility-guide.md](docs/p5-accessibility-guide.md) for p5.js-specific guidance.

```txt
src/
  core/       audit orchestration, WCAG mapping, severity, rules engine
  adapters/   Playwright + axe-core adapters for URLs, HTML files, and p5 sketches
  reporters/  Markdown, JSON, and console report generators
  p5-plugin/  optional in-browser helper for p5.js sketch authors
  cli/        the a11y-lab command-line tool
  web/        the Vite + React web UI
rules/        WCAG core mapping and WCAG 2+ rule/prompt definitions
schemas/      JSON schemas for audit results and rule definitions
examples/     sample HTML and p5.js fixtures used in docs and tests
docs/         methodology, WCAG 2+ framework, and workshop guide
tests/        Vitest unit tests
```

## Disclaimer

This tool is an accessibility aid, not a legal compliance certification.

## Credits

Adekemi (Kemi) Hanna Sijuwade-Ukadike

## License

MIT
