# WCAG 2+ Framework

WCAG 2.2 is the standards foundation for this project, with backward compatibility to WCAG 2.0 and 2.1. "WCAG 2+" is this project's own extension layer for issues that matter in creative, civic, educational, and multimodal interfaces but that conventional HTML-focused audits often miss.

## Core WCAG principles

- Perceivable
- Operable
- Understandable
- Robust

## WCAG 2+ extension areas

- Canvas accessibility
- p5.js sketch descriptions
- Keyboard-only creative interactions
- Screen-reader-readable sketch output
- Captions and transcripts
- Motion and flashing risk
- Sonification alternatives
- Cognitive load
- Plain-language labels
- Multilingual accessibility notes
- Blind editor review
- Human-review prompts
- Navigation (skip links, focus order, focus visibility, consistent navigation, multiple ways to find content)
- PDF document accessibility (tagging, reading order, PDF/UA-adjacent checks)

## Where the rules live

- `rules/wcag-core.json` documents the WCAG principle mapping used to interpret axe-core results.
- `rules/wcag-2-plus.json` holds automated-or-manual rules: p5/canvas patterns (canvas description, keyboard alternative, animation pause control) and PDF structural checks (tagged structure, document language, document title).
- `rules/human-review-prompts.json` holds the full set of manual-review prompts (motion, flashing, captions, transcripts, keyboard-only use, cognitive load, plain-language navigation, canvas descriptions, sound alternatives, touch target size, consistent help, accessible authentication, multilingual labels, navigation, and PDF-specific prompts: reading order, alt text, heading structure, form field labels, table headers, color contrast, link text, permissions), each tagged with the contexts (`html`, `p5`, `canvas`, `animation`, `pdf`) it applies to.

## Navigation rules

Navigation issues are split between what axe-core can already catch automatically (missing landmarks, non-unique link text, positive `tabindex` values) and what genuinely requires a human pass across multiple pages or an interactive keyboard walkthrough:

- **Bypass blocks (2.4.1).** Is there a working skip link or landmark structure so repeated navigation doesn't have to be tabbed through on every page?
- **Focus order (2.4.3).** Does tabbing move in an order that matches the visual/reading order?
- **Focus visible (2.4.7 / 2.4.11).** Is the focus indicator always visible and never obscured by sticky headers or other overlays?
- **Consistent navigation (3.2.3).** Do repeated navigation components appear in the same relative order across pages?
- **Multiple ways (2.4.5).** Is there more than one way to find a page (nav menu plus search or sitemap), other than a single required path?

These ship as human-review prompts (`skip-link-review`, `focus-order-review`, `focus-visible-review`, `consistent-navigation-review`, `multiple-ways-review` in `rules/human-review-prompts.json`) rather than automated rules, because they require either multi-page context or a live keyboard walkthrough that a single-page automated scan can't reliably verify.

## PDF rules

PDF documents aren't a DOM, so `audit-pdf` doesn't use axe-core at all — it reads the PDF's own catalog and metadata (via `pdf-lib`) instead. Only three things are reliably checkable without a full tag-tree walk and rendering pass, so those are the automated rules; everything about whether the tags are *correct* is a human-review prompt. See [docs/pdf-accessibility-guide.md](pdf-accessibility-guide.md) for the full breakdown.

## Extending the framework

New WCAG 2+ rules or prompts should:

1. Reference the closest matching WCAG success criterion where one exists, or state that none applies.
2. Include plain-language next steps, not just a description of the problem.
3. Declare which contexts they apply to (`appliesTo`) so the rules engine only surfaces relevant guidance.
