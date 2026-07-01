# Contributing to Accessibility Audit Lab

Thanks for considering a contribution. This project is small on purpose — please read this guide before opening a PR so your change lands smoothly.

## Ways to contribute

- **Report a bug** or **request a feature** using the issue templates.
- **Add a rule.** New automated or human-review rules for `rules/wcag-2-plus.json` or `rules/human-review-prompts.json` are especially welcome, particularly for creative coding, sonification, and multilingual accessibility.
- **Improve documentation**, especially the p5.js and human-review guides.
- **Add example fixtures** that exercise a rule not yet covered by `examples/` or `tests/`.
- **Fix a bug** in the CLI, web UI, or reporters.

## Development setup

```bash
git clone https://github.com/ukadike/accessible-by-design-prototyping.git
cd accessible-by-design-prototyping
npm install
npm run build
npm run test
```

Try the CLI against the bundled examples:

```bash
npm run audit -- ./examples/simple-html-site/index.html
npm run audit:p5 -- ./examples/p5-sketch-needs-work/index.html
npm run audit:pdf -- ./examples/pdf-needs-work/document.pdf
```

Run the web UI:

```bash
npm run dev
```

## Before opening a pull request

1. `npm run build` — the project must compile with no TypeScript errors.
2. `npm run test` — all Vitest tests must pass, and new logic should have a test.
3. Keep changes focused. Small, single-purpose PRs are much easier to review than large ones.
4. If you add or change a rule, update the relevant doc in `docs/` so the framework stays accurate.
5. Use plain, non-shaming, actionable language in any user-facing text (issue explanations, next steps, UI copy) — see `docs/human-review-guide.md` for the tone this project aims for.

## Code style

- TypeScript, strict mode. Avoid `any`; prefer the types in `src/core/types.ts`.
- No unused abstractions — this project favors small, direct modules over frameworks-within-the-framework.
- Comments should explain *why*, not *what* — identifiers should already make the *what* clear.

## Adding a new WCAG 2+ rule or human-review prompt

1. Add the entry to `rules/wcag-2-plus.json` (automated-or-manual rules) or `rules/human-review-prompts.json` (pure manual prompts).
2. Reference a real WCAG success criterion if one applies; otherwise leave `wcag` as an empty array and note why in the PR description.
3. Tag `appliesTo` with the contexts it's relevant to (`html`, `p5`, `canvas`, `animation`).
4. Add or update a test in `tests/` that exercises the new rule.

## Reporting security issues

Please see [SECURITY.md](SECURITY.md) rather than filing a public issue.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
