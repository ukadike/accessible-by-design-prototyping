/**
 * "Audit this page" bookmarklet payload.
 *
 * Injected into whatever page the user is viewing, so it must be fully
 * self-contained (axe-core is bundled in) and must not depend on — or
 * collide with — the host page's styles. All UI lives in a shadow root.
 */
import axe from 'axe-core';
import { axeImpactToSeverity, sortBySeverity } from '../core/severity.js';
import { extractWcagFromAxeTags } from '../core/wcag-map.js';
import { generateNextSteps } from '../core/next-step-generator.js';
import type { Severity } from '../core/types.js';

interface PageFinding {
  title: string;
  severity: Severity;
  wcag: string[];
  explanation: string;
  nextSteps: string[];
  affectedCount: number;
}

const HOST_ID = 'a11y-lab-overlay-host';

const OVERLAY_CSS = `
  .panel {
    position: fixed;
    top: 16px;
    right: 16px;
    width: min(420px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    background: #ffffff;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    padding: 16px 18px;
    z-index: 2147483647;
  }
  h1 {
    font-size: 18px;
    margin: 0 24px 4px 0;
  }
  h2 {
    font-size: 15px;
    margin: 14px 0 6px;
  }
  p { margin: 4px 0; }
  ul { margin: 4px 0 0; padding-left: 20px; }
  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    border: 2px solid #1a1a1a;
    background: #ffffff;
    color: #1a1a1a;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    padding: 2px 8px;
    cursor: pointer;
  }
  .close:hover { background: #1a1a1a; color: #ffffff; }
  .close:focus-visible { outline: 3px solid #0b5fff; outline-offset: 2px; }
  .summary-ok { color: #1a6b3c; font-weight: 700; }
  .summary-problems { color: #a3132f; font-weight: 700; }
  .finding {
    border-left: 4px solid #a3132f;
    background: #f7f6f3;
    border-radius: 0 8px 8px 0;
    padding: 8px 12px;
    margin: 8px 0;
  }
  .finding.moderate, .finding.minor { border-left-color: #8a5a00; }
  .finding .count { font-size: 13px; color: #444444; }
  .footer { font-size: 12px; color: #444444; margin-top: 12px; font-style: italic; }
`;

function severityWord(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'Very important to fix';
    case 'serious':
      return 'Important to fix';
    case 'moderate':
      return 'Worth fixing';
    default:
      return 'Small improvement';
  }
}

function removeExistingOverlay(): void {
  document.getElementById(HOST_ID)?.remove();
}

function renderOverlay(findings: PageFinding[]): void {
  removeExistingOverlay();

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = OVERLAY_CSS;
  shadow.append(style);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Accessibility check results');
  shadow.append(panel);

  const close = document.createElement('button');
  close.className = 'close';
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', () => host.remove());
  panel.append(close);

  const heading = document.createElement('h1');
  heading.textContent = 'Accessibility check';
  panel.append(heading);

  const summary = document.createElement('p');
  if (findings.length === 0) {
    summary.className = 'summary-ok';
    summary.textContent = 'Good news — the automatic checks found no problems on this page.';
  } else {
    summary.className = 'summary-problems';
    summary.textContent = `The automatic checks found ${findings.length} ${
      findings.length === 1 ? 'thing' : 'things'
    } to fix on this page.`;
  }
  panel.append(summary);

  for (const finding of findings) {
    const card = document.createElement('div');
    card.className = `finding ${finding.severity}`;

    const title = document.createElement('h2');
    title.textContent = finding.title;
    card.append(title);

    const meta = document.createElement('p');
    meta.className = 'count';
    meta.textContent =
      `${severityWord(finding.severity)}. Affects ${finding.affectedCount} ` +
      `${finding.affectedCount === 1 ? 'place' : 'places'} on this page.` +
      (finding.wcag.length ? ` (WCAG ${finding.wcag.join(', ')})` : '');
    card.append(meta);

    const explanation = document.createElement('p');
    explanation.textContent = finding.explanation;
    card.append(explanation);

    const list = document.createElement('ul');
    for (const step of finding.nextSteps) {
      const item = document.createElement('li');
      item.textContent = step;
      list.append(item);
    }
    card.append(list);

    panel.append(card);
  }

  const reminder = document.createElement('p');
  reminder.textContent =
    'Automatic checks can’t catch everything — reviewing your page with a keyboard and a screen reader is still worth doing.';
  panel.append(reminder);

  const footer = document.createElement('p');
  footer.className = 'footer';
  footer.textContent = 'Accessibility Audit Lab · an accessibility aid, not a legal certification.';
  panel.append(footer);

  document.body.append(host);

  const escListener = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      host.remove();
      document.removeEventListener('keydown', escListener);
    }
  };
  document.addEventListener('keydown', escListener);
  close.focus();
}

async function run(): Promise<void> {
  const results = await axe.run(document);

  const findings: PageFinding[] = results.violations.map((violation) => ({
    title: violation.help,
    severity: axeImpactToSeverity(violation.impact),
    wcag: extractWcagFromAxeTags(violation.tags),
    explanation: violation.description,
    nextSteps: generateNextSteps(violation.id, violation.help),
    affectedCount: violation.nodes.length || 1,
  }));

  renderOverlay(sortBySeverity(findings));
}

void run();
