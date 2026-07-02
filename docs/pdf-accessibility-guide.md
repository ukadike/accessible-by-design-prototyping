# PDF Accessibility Guide

A PDF is not a DOM. `a11y-lab audit-pdf` doesn't use Playwright or axe-core at all — it reads the PDF's own object structure directly (via `pdf-lib`) and checks the handful of things that are reliably detectable without rendering the page: whether the document is tagged, whether it declares a language, and whether it has a title. Everything else — the parts that decide whether the tags are actually *correct* — needs a human pass, which is why most of the PDF checklist ships as manual-review prompts rather than automated rules.

## What `audit-pdf` checks automatically

- **Tagged structure (`pdf-tagged-structure`, WCAG 1.3.1 / 4.1.2).** Is the PDF's catalog `/MarkInfo` dictionary present with `/Marked true`? Without a tag tree, screen readers have no reliable way to determine reading order, headings, lists, tables, or alt text — this is the single most important accessibility gate for PDF and is treated as a critical finding.
- **Document language (`pdf-document-language`, WCAG 3.1.1).** Is `/Lang` set on the document catalog? Without it, screen readers can't choose the right pronunciation rules or voice.
- **Document title (`pdf-document-title`, WCAG 2.4.2).** Is a document title set in the PDF's metadata (not just the file name)?

These three checks run against any local PDF file or public PDF URL:

```bash
npm run audit:pdf -- ./examples/pdf-needs-work/document.pdf
npm run audit:pdf -- https://example.com/report.pdf
```

## What still needs a human pass

Being tagged doesn't mean the tags are right. The manual-review prompts cover what automated inspection can't safely judge from the object structure alone:

- **Reading order** — does the tag tree's order match how a sighted reader would actually read the page (columns, sidebars, footnotes)?
- **Alt text** — does every meaningful image/figure have it, and is decorative art marked as an artifact?
- **Heading structure and bookmarks** — real heading tags that nest logically, plus bookmarks for navigation.
- **Form field labels** — do interactive form fields have a name/tooltip a screen reader will announce?
- **Table headers** — real `Table`/`TH`/`TR` structure, not tab-aligned text made to look like a table.
- **Color contrast** — including text baked into images or charts, which no automated PDF check here can measure.
- **Link text** — descriptive, not "click here" or a bare URL.
- **Permissions** — if the PDF is encrypted or permission-restricted, does the accessibility (screen-reading) permission flag stay enabled even when copy/print are restricted?

## Fixing common findings

Most PDF accessibility problems are fixed upstream, in the authoring tool that produced the PDF, not in the PDF itself:

- **Word/Google Docs/InDesign**: use built-in heading styles, alt text fields, and table markup before exporting — "Export accessible PDF" (Word) or equivalent options carry these through as real tags.
- **Acrobat Pro**: `Tools > Accessibility > Autotag Document` gives a starting tag tree, but always review and correct it — autotagging routinely gets reading order and table structure wrong.
- **Document properties**: set the title and language under `File > Properties`, and check `Permissions` to make sure the "Enable text access for screen reader devices" option is on if the document is otherwise restricted.

## Not a certification

A clean automated result here means the document is tagged, has a language, and has a title — it does not mean the document is fully accessible or PDF/UA-conformant. Pair it with the manual-review prompts and, where possible, a real screen reader pass.
