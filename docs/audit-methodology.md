# Audit Methodology

## How an audit runs

1. **Adapter stage.** Depending on the target, one of three adapters loads the page:
   - `url-auditor.ts` for `http(s)://` URLs.
   - `html-file-auditor.ts` for local HTML files, resolved to a `file://` URL.
   - `p5-sketch-auditor.ts` for p5.js sketches, which also inspects the rendered HTML for p5-specific patterns.
2. **Automated scan.** Each adapter launches Playwright Chromium, injects axe-core, and runs it against the loaded page.
3. **Normalization.** `issue-normalizer.ts` converts raw axe-core violations into the project's `AuditIssue` shape: severity, WCAG references, principle, location, plain-language explanation, and next steps.
4. **WCAG 2+ layer.** The rules engine (`rules-engine.ts`) adds rules and human-review prompts from `rules/wcag-2-plus.json` and `rules/human-review-prompts.json` that apply to the target's context (`html`, `p5`, `canvas`, `animation`).
5. **Summary.** `audit-runner.ts` tallies issues by severity and counts manual-review prompts into an `AuditSummary`.
6. **Reporting.** The `AuditResult` is handed to the console, Markdown, and/or JSON reporters.

## Severity mapping

axe-core's `impact` field (`critical`, `serious`, `moderate`, `minor`) maps directly to this project's `Severity` type. WCAG 2+ rules and human-review prompts default to `manual` in the summary, tracked separately as `manualReview`.

## What automated checks can and cannot catch

Automated checks (axe-core, and the p5 pattern checks) catch structural and markup-level issues: missing alt text, missing form labels, insufficient color contrast, missing canvas descriptions, and similar. They cannot judge whether an alt description is *meaningful*, whether motion is *essential*, or whether language is genuinely *plain*. Those require the human-review prompts and a manual pass, ideally with disabled users and assistive technology.

## Not a certification

This methodology produces an aid for prioritizing remediation work. It is not a substitute for a legal accessibility audit or conformance certification.
