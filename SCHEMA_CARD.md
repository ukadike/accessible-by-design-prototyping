# Schema Card

A one-page reference for what this project is, who it's for, and how its parts fit together. See [INDEX.md](INDEX.md) for the full site map and [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md) for the restoration audit.

## Project name

Accessibility Audit Lab (package name `accessibility-audit-lab`; GitHub repo `accessible-by-design-prototyping`; internal name "Accessibility Audit Lab"; also hosts the original "Accessible by Design" workshop guide).

## Purpose

An open-source WCAG 2.2+ auditing toolkit for websites, p5.js sketches, PDFs, creative coding projects, civic media, and experimental interfaces. It combines automated accessibility checks (via Playwright + axe-core), p5/canvas-specific pattern review, PDF structural checks (via pdf-lib), plain-language remediation guidance, and structured reports.

It is explicitly **not** a legal accessibility certification tool — see the Disclaimer in [README.md](README.md) and the "Not a certification" sections in [docs/audit-methodology.md](docs/audit-methodology.md), [docs/pdf-accessibility-guide.md](docs/pdf-accessibility-guide.md), and [docs/human-review-guide.md](docs/human-review-guide.md).

## Audience

Designers, developers, educators, and artists working on websites, creative-coding/canvas projects, PDFs, and civic or educational media who need to find and prioritize accessibility issues, and who need plain-language next steps rather than raw rule IDs.

## Core concepts

- **WCAG 2+**: this project's own extension layer on top of WCAG 2.2 (backward-compatible to 2.0/2.1), covering canvas accessibility, p5.js sketch descriptions, keyboard-only creative interaction, motion/flashing, sonification alternatives, cognitive load, plain-language labels, multilingual notes, navigation (skip links, focus order/visibility, consistent navigation, multiple ways to find content), and PDF document accessibility. See [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md).
- **Automated vs. manual-review split**: automated rules catch structural/markup issues; everything that requires judgment (is this alt text meaningful, is this motion essential, is this language really plain) ships as a human-review prompt instead. See [docs/human-review-guide.md](docs/human-review-guide.md).
- **Severity**: `critical | serious | moderate | minor | manual`, taken directly from axe-core's `impact` field for automated findings; WCAG 2+ and human-review items default to `manual`.

## Data structures

Defined as JSON Schema (draft-07) in `schemas/`:

- **[schemas/accessibility-rule.schema.json](schemas/accessibility-rule.schema.json)** — `AccessibilityRule`: `id`, `title`, `category`, `severity`, `wcag[]`, `principle` (`Perceivable|Operable|Understandable|Robust|WCAG 2+`), `testType` (`automated|manual|automated-or-manual`), `description`, `nextSteps[]`, `appliesTo[]`. Used by `rules/wcag-2-plus.json`.
- **[schemas/audit-result.schema.json](schemas/audit-result.schema.json)** — `AuditResult`: `projectName`, `target`, `auditedAt`, `summary` (counts by severity + `manualReview`), `issues[]` (each with `id`, `title`, `severity`, `wcag[]`, `principle`, `location`, `explanation`, `nextSteps[]`, `source`: `axe-core|wcag-2-plus|p5-auditor|pdf-auditor|manual-review`), `humanReviewPrompts[]`. Used by the JSON reporter; see sample at [reports/sample-report.json](reports/sample-report.json).

Rule/prompt data files in `rules/` (not separately schema'd, described in [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md)):

- `rules/wcag-core.json` — the four WCAG principles, used to interpret axe-core results.
- `rules/wcag-2-plus.json` — automated-or-manual rules conforming to `accessibility-rule.schema.json`.
- `rules/human-review-prompts.json` — manual-review prompts: `id`, `title`, `question`, `wcag[]`, `appliesTo[]`.
- `rules/p5-canvas-rules.json` — plain detection-pattern config for the p5 auditor (`descriptionFunctions`, `mouseOnlyFunctions`, `keyboardFunctions`, `animationIndicators`), not an `AccessibilityRule` list.

## Interfaces

- **CLI** (`bin: a11y-lab` → `dist/cli/index.js`, source at `src/cli/index.ts`): `a11y-lab audit <url-or-path>`, `a11y-lab audit-p5 <url-or-path>`, `a11y-lab audit-pdf <url-or-path>`. Exposed via npm scripts: `npm run audit`, `npm run audit:p5`, `npm run audit:pdf`.
- **Web UI** (`src/web/`, Vite + React): `npm run dev` starts a dev server with an audit form and report view (`src/web/components/AuditForm.tsx`, `ReportView.tsx`, `IssueCard.tsx`). The dev-server API endpoint is `/api/audit` (dev only — see the Scope note in [SECURITY.md](SECURITY.md): do not expose it to untrusted networks).
- **Library modules** under `src/core/` (`audit-runner.ts`, `rules-engine.ts`, `issue-normalizer.ts`, `wcag-map.ts`, `severity.ts`, `types.ts`) and `src/adapters/` (`url-auditor.ts`, `html-file-auditor.ts`, `p5-sketch-auditor.ts`, `pdf-auditor.ts`, `playwright-axe.ts`) — not currently published as a standalone importable package (no separate `exports`/`main` field beyond the CLI `bin` in `package.json`; Needs Kemi review if a library entry point is wanted).

## Inputs

- A public `http(s)://` URL, a local HTML file path, a local or remote p5.js sketch HTML page, or a local/remote PDF file.

## Outputs

- Console summary (`src/reporters/console-reporter.ts`).
- Markdown report conforming to the shape seen in [reports/sample-report.md](reports/sample-report.md) (`src/reporters/markdown-reporter.ts`).
- JSON report conforming to `schemas/audit-result.schema.json` (`src/reporters/json-reporter.ts`), sample at [reports/sample-report.json](reports/sample-report.json).
- Reports are written to `./reports` when run via the CLI scripts.

## Dependencies

Runtime: `axe-core`, `chalk`, `commander`, `pdf-lib`, `playwright`, `react`, `react-dom`, `zod`.
Dev: `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `tsx`, `typescript`, `vite`, `vitest`.
Full versions in [package.json](package.json) / [package-lock.json](package-lock.json).

## Related repos

- [Small Systems Lab](https://github.com/ukadike/Small-Systems-Lab) ([hub site](https://ukadike.github.io/small-systems-lab/)) — the ecosystem hub this project belongs to. This repo functions as both the "Accessible by Design" workshop origin and the "WCAG / Accessibility Auditor" tool within that ecosystem.

## Accessibility considerations

- The project audits others' accessibility, and this restoration pass also checked the project's *own* docs against the same standard: heading order, descriptive link text, and image alt text in `docs/workshop-guide.md` were reviewed as part of this pass (see [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md)).
- No HTML pages with `<a href>` navigation exist in this repo outside test fixtures and the bare web-UI shell (`src/web/index.html`), so `target="_blank"` / `rel="noopener noreferrer"` guidance does not currently apply anywhere in the codebase — confirmed by a repo-wide search during this audit.

## Future implementation notes

- No dated roadmap exists in the repo. `docs/funding-language.md` describes the problem space and positioning but does not commit to specific future features or dates — treat it as context, not a roadmap. If a real roadmap is drafted later, it should live in `ROADMAP.md` at the root and be linked from `INDEX.md` and `README.md`.
- `docs/human-review-guide.md` and `docs/funding-language.md` were previously unlinked from `README.md`; this pass added a documentation index to `README.md` covering them (see [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md)).
