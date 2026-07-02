# Repository Audit — Accessibility Audit Lab

Restoration pass performed as part of the Small Systems Lab ecosystem-wide repository restoration effort (priority #2 of ~8, also serving as the "WCAG / Accessibility Auditor" priority item since this repo is that tool). Date: 2026-07-02.

## Repository purpose

Accessibility Audit Lab is an open-source WCAG 2.2+ auditing toolkit for websites, p5.js sketches, PDFs, creative coding projects, civic media, and experimental interfaces. It combines automated accessibility checks (Playwright + axe-core), p5/canvas-specific pattern review, PDF structural checks (pdf-lib), plain-language remediation guidance, and Markdown/JSON/console reports. It also hosts the original "Accessible by Design" workshop guide the tool grew out of. It is explicitly not a legal accessibility certification tool.

## Current structure (verified)

```
README.md, CHANGELOG.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, LICENSE
package.json, package-lock.json, tsconfig.json, tsconfig.web.json, vite.config.ts, vitest.config.ts, .editorconfig
INDEX.md, SCHEMA_CARD.md               (added by this pass)
docs/         audit-methodology.md, funding-language.md, human-review-guide.md,
              p5-accessibility-guide.md, pdf-accessibility-guide.md,
              wcag-2-plus-framework.md, workshop-guide.md, REPO_AUDIT.md (this file)
rules/        human-review-prompts.json, p5-canvas-rules.json, wcag-2-plus.json, wcag-core.json
schemas/      accessibility-rule.schema.json, audit-result.schema.json
reports/      sample-report.json, sample-report.md
examples/     p5-sketch-good/, p5-sketch-needs-work/, pdf-good/, pdf-needs-work/, simple-html-site/
assets/       accessibility-principles.png, interaction-example.png, sketch-prototype.png,
              workshop-hero.png, .gitkeep
src/          core/, adapters/, reporters/, p5-plugin/, cli/, web/
tests/        audit-runner.test.ts, p5-sketch-auditor.test.ts, pdf-auditor.test.ts, reporter.test.ts
.github/      PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE/bug_report.yml,
              ISSUE_TEMPLATE/feature_request.yml, workflows/test.yml
```

## Homepage / entry point

`README.md` is the correct and functional entry point. It states purpose, what the tool does/doesn't do, install/run instructions, and (after this pass) a full documentation index.

## Important pages and whether they were discoverable before this pass

| File | Linked from README (before) | Status |
|---|---|---|
| docs/audit-methodology.md | Yes | OK |
| docs/wcag-2-plus-framework.md | Yes | OK |
| docs/p5-accessibility-guide.md | Yes | OK |
| docs/pdf-accessibility-guide.md | Yes | OK |
| docs/workshop-guide.md | Yes | OK |
| docs/human-review-guide.md | **No** | Orphan — fixed (added to README docs index and INDEX.md) |
| docs/funding-language.md | **No** | Orphan — fixed (added to README docs index and INDEX.md; also referenced from SCHEMA_CARD.md) |
| rules/*.json (4 files) | Mentioned only as a directory in the structure diagram, not linked individually | Fixed — individually indexed in INDEX.md and SCHEMA_CARD.md |
| schemas/*.json (2 files) | Same as above | Fixed — individually indexed and their shapes documented in SCHEMA_CARD.md |
| reports/sample-report.md, reports/sample-report.json | Not referenced anywhere | Fixed — indexed in INDEX.md and SCHEMA_CARD.md as sample output |
| examples/* (5 fixtures) | Referenced only as CLI command arguments in README/CONTRIBUTING/p5 guide, not as a page a reader could browse to | Fixed — each fixture individually listed in INDEX.md |
| CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, CHANGELOG.md, LICENSE | Yes | OK, and now also cross-linked from INDEX.md |
| .github/PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE/* | Not linked from README/CONTRIBUTING | Not fixed in README body (these are GitHub-native surfaces users reach automatically when opening an issue/PR, not pages people browse to) — indexed in INDEX.md for completeness |

**Root cause of "inner pages not discoverable"**: `docs/human-review-guide.md` and `docs/funding-language.md` existed and were substantively complete but had zero inbound links from README.md or any other doc — the only way to find them was browsing the `docs/` folder directly on GitHub. The `rules/`, `schemas/`, and `reports/` directories were named in README's structure diagram as directories but none of their individual files were ever linked, so a reader had no path to e.g. `schemas/audit-result.schema.json` short of guessing the filename.

## Navigation added

Per the task's requested categories, mapped to what actually exists in this repo (nothing fabricated):

- **Home** → README.md
- **Principles** → docs/wcag-2-plus-framework.md (WCAG 2+ principles/extension areas), docs/audit-methodology.md
- **Tools** → CLI (`a11y-lab audit`/`audit-p5`/`audit-pdf`) and web UI, documented in README "Getting Started" and SCHEMA_CARD.md "Interfaces"
- **Examples** → examples/* fixtures, now indexed individually in INDEX.md
- **Audits** → docs/audit-methodology.md, docs/human-review-guide.md, reports/sample-report.md, reports/sample-report.json
- **Resources** → docs/p5-accessibility-guide.md, docs/pdf-accessibility-guide.md, rules/*.json, schemas/*.json
- **Case studies** → **Gap.** No case-study content exists in the repo. Not fabricated; noted as a gap in INDEX.md.
- **Contact / contribution path** → CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md — already existed and already linked from README

New files: `INDEX.md` (full site map), `SCHEMA_CARD.md` (project card), this file (`docs/REPO_AUDIT.md`). README.md gained a "Documentation" section linking all of the above.

## Broken links

None found. Every relative Markdown link checked (README.md, all docs/*.md, CONTRIBUTING.md, CHANGELOG.md, CODE_OF_CONDUCT.md, SECURITY.md) resolves to an existing file. The one image link in docs/workshop-guide.md (`../assets/workshop-hero.png`) resolves correctly.

## Duplicated / outdated / dead files

- **`workshop-hero.png` (root)** — byte-for-byte identical (matching MD5) to `assets/workshop-hero.png`, which is the file actually referenced by `docs/workshop-guide.md`. Confirmed via repo-wide search that nothing referenced the root copy. **Removed** in this pass; the real asset remains at `assets/workshop-hero.png` and continues to render correctly in the workshop guide.
- **`assets-temp.md` (root)** — an empty file (one blank line, no content). Confirmed via repo-wide search that nothing referenced it. **Removed** in this pass. Nothing was lost — it had no content to preserve.

No other duplicated or outdated files were found. `assets/.gitkeep` is intentional (keeps the directory tracked before other assets existed; harmless to leave since the directory is no longer empty, but not removed here as it's not causing any problem).

## Missing documentation

- No case studies exist (see Navigation section above) — flagged as a gap, not fabricated.
- No standalone "getting started with the API/library" doc — `src/core/` and `src/adapters/` are used internally by the CLI and web UI but aren't documented as a standalone importable library surface. Noted in SCHEMA_CARD.md under Interfaces. **Needs Kemi review** if a public library API is intended.
- `rules/p5-canvas-rules.json` has no schema file (unlike `wcag-2-plus.json`/`human-review-prompts.json`, which conform to `accessibility-rule.schema.json`). This is likely fine since it's a plain detection-pattern config, not a rule list, but flagged here in case it was meant to be schema'd. **Needs Kemi review.**

## Accessibility issues (in the repo's own docs)

- `docs/workshop-guide.md` already uses descriptive alt text for its three images (not generic like "image1") — good, no change needed.
- Checked all Markdown files touched or created in this pass (README.md, INDEX.md, SCHEMA_CARD.md, this file) for logical heading order (no skipped levels) and descriptive link text (no bare "click here" links) — all pass.
- Checked the entire repo for `<a href>` usage in HTML/TSX to see if `target="_blank"` / `rel="noopener noreferrer"` guidance applies: **no anchor tags exist anywhere in the codebase** (the only HTML files are `src/web/index.html`, a bare Vite shell with no links, and the three `examples/*/index.html` audit fixtures, which intentionally contain accessibility issues as test material and also have no `<a>` tags). This guidance does not currently apply; noted here so it isn't silently skipped.

## Code quality issues

Out of scope for a documentation/navigation restoration pass — no source code was modified. Existing `CONTRIBUTING.md` already documents the build/test gate (`npm run build`, `npm run test`) and code style expectations. No issues were identified that block this pass's deliverables.

## Recommended changes (not yet made — for Kemi review)

- Consider whether `src/core/` should be documented as a standalone library surface (see Missing documentation above).
- Consider whether `rules/p5-canvas-rules.json` needs its own schema.
- If a real, dated roadmap is ever drafted, add `ROADMAP.md` at the root and link it from `README.md` and `INDEX.md` — see "No roadmap" below.

## No roadmap — explicitly not created

The task brief asked for `ROADMAP.md` only if there's genuine roadmap content to draw from. `docs/funding-language.md` was reviewed in full: it is positioning/problem-statement language ("the project addresses a gap...") with no dates, version targets, or committed future features. No other file in the repo contains roadmap content. Per instructions, no `ROADMAP.md` was created — fabricating one with invented dates/features would violate the no-fabrication rule.

## Completed changes (this pass)

1. Removed duplicate `workshop-hero.png` from repo root (kept `assets/workshop-hero.png`, the one actually referenced).
2. Removed empty `assets-temp.md` from repo root.
3. Added `INDEX.md` — full site map of every doc, rule file, schema, example, and report in the repo.
4. Added `SCHEMA_CARD.md` — project card covering purpose, audience, data structures, interfaces, inputs/outputs, dependencies, related repos, accessibility considerations, and future-implementation notes.
5. Added this file, `docs/REPO_AUDIT.md`.
6. Updated `README.md`:
   - Added a link to the Small Systems Lab ecosystem hub (previously absent).
   - Added a "Documentation" section linking every doc in `docs/`, plus `SCHEMA_CARD.md` and `INDEX.md`, including the two previously-orphaned docs (`human-review-guide.md`, `funding-language.md`).
   - Added `reports/` to the repository-structure diagram (previously omitted).

## What remains / Kemi review items

- Whether `src/core/` should be published/documented as a standalone library API.
- Whether `rules/p5-canvas-rules.json` should get its own JSON Schema.
- Whether "case studies" content is planned; currently a genuine gap, not filled here.
- Whether `assets/.gitkeep` should be removed now that the directory is populated (left in place as non-harmful).
