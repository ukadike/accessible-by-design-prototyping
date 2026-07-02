# Site Map

A complete index of this repository's documentation, tooling, rule data, and examples. Use this page as the starting point if you're not sure where something lives.

## Start here

- [README.md](README.md) — project overview, what the tool does, install/run instructions, repository structure
- [CHANGELOG.md](CHANGELOG.md) — release history
- [SCHEMA_CARD.md](SCHEMA_CARD.md) — project summary card: purpose, audience, data structures, interfaces, dependencies
- [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md) — this restoration pass: structure, orphans, broken links, gaps, fixes made

## Principles & methodology (docs/)

- [docs/audit-methodology.md](docs/audit-methodology.md) — how an audit runs, adapter → scan → normalization → WCAG 2+ layer → summary → reporting
- [docs/wcag-2-plus-framework.md](docs/wcag-2-plus-framework.md) — the WCAG 2+ extension layer this project adds on top of WCAG 2.2, and where the underlying rule files live
- [docs/human-review-guide.md](docs/human-review-guide.md) — how to run the manual-review prompts that automated checks can't cover
- [docs/funding-language.md](docs/funding-language.md) — positioning language describing the gap this project addresses (not a roadmap)

## Tool-specific guides (docs/)

- [docs/p5-accessibility-guide.md](docs/p5-accessibility-guide.md) — p5.js / canvas sketch auditing (`a11y-lab audit-p5`)
- [docs/pdf-accessibility-guide.md](docs/pdf-accessibility-guide.md) — PDF structural auditing (`a11y-lab audit-pdf`)

## Workshop (origin material)

- [docs/workshop-guide.md](docs/workshop-guide.md) — "Accessible by Design: Prototyping Meaning, Not Just Interfaces," the original workshop guide this toolkit grew out of

## Rule data (rules/)

- [rules/wcag-core.json](rules/wcag-core.json) — WCAG principle mapping used to interpret axe-core results
- [rules/wcag-2-plus.json](rules/wcag-2-plus.json) — automated-or-manual rules (p5/canvas patterns, PDF structural checks)
- [rules/human-review-prompts.json](rules/human-review-prompts.json) — the full set of manual-review prompts, tagged by context
- [rules/p5-canvas-rules.json](rules/p5-canvas-rules.json) — detection patterns the p5 sketch auditor scans for

## Data structures (schemas/)

- [schemas/accessibility-rule.schema.json](schemas/accessibility-rule.schema.json) — shape of a rule entry (used by `rules/wcag-2-plus.json`)
- [schemas/audit-result.schema.json](schemas/audit-result.schema.json) — shape of a full audit result (used by the JSON reporter)

## Examples (examples/)

- [examples/simple-html-site/index.html](examples/simple-html-site/index.html) — plain HTML fixture with several common issues
- [examples/p5-sketch-good/index.html](examples/p5-sketch-good/index.html) — p5.js sketch with description, keyboard control, and pause control
- [examples/p5-sketch-needs-work/index.html](examples/p5-sketch-needs-work/index.html) — p5.js sketch with none of the above, for contrast
- [examples/pdf-good/document.pdf](examples/pdf-good/document.pdf) — PDF fixture with tagging, language, and title
- [examples/pdf-needs-work/document.pdf](examples/pdf-needs-work/document.pdf) — PDF fixture missing those properties

## Sample output (reports/)

- [reports/sample-report.md](reports/sample-report.md) — a full Markdown report generated against `examples/simple-html-site`
- [reports/sample-report.json](reports/sample-report.json) — the same audit as structured JSON

## Source (src/)

- `src/core/` — audit orchestration, WCAG mapping, severity, rules engine
- `src/adapters/` — Playwright + axe-core adapters (URL, HTML file, p5 sketch), pdf-lib adapter
- `src/reporters/` — Markdown, JSON, and console report generators
- `src/p5-plugin/` — optional in-browser helper for p5.js sketch authors
- `src/cli/` — the `a11y-lab` command-line tool
- `src/web/` — the Vite + React web UI

## Tests (tests/)

- `tests/audit-runner.test.ts`, `tests/p5-sketch-auditor.test.ts`, `tests/pdf-auditor.test.ts`, `tests/reporter.test.ts`

## Contributing & community

- [CONTRIBUTING.md](CONTRIBUTING.md) — dev setup, PR checklist, how to add a rule
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Contributor Covenant, adapted
- [SECURITY.md](SECURITY.md) — how to report a vulnerability, scope notes
- [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) — PR template
- [.github/ISSUE_TEMPLATE/bug_report.yml](.github/ISSUE_TEMPLATE/bug_report.yml), [.github/ISSUE_TEMPLATE/feature_request.yml](.github/ISSUE_TEMPLATE/feature_request.yml) — issue templates
- [LICENSE](LICENSE) — MIT

## Ecosystem

- [Small Systems Lab](https://github.com/ukadike/Small-Systems-Lab) — the ecosystem hub this project is part of ([hub site](https://ukadike.github.io/small-systems-lab/))

## Gaps (not fabricated — noted here rather than invented)

- No "case studies" section exists yet.
- No standalone "examples index" page exists; example fixtures are documented individually above and referenced from the p5/PDF guides.
- No `ROADMAP.md` exists; `docs/funding-language.md` is positioning language, not a dated roadmap. See `docs/REPO_AUDIT.md` for detail.
