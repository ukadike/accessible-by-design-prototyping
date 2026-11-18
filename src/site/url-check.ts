/**
 * "Quick check by web address" — fetches a COPY of the page (directly when the
 * site allows it, otherwise through a public relay) and renders it in a hidden,
 * sandboxed iframe wrapper. axe-core is injected into the wrapped copy, runs
 * inside it, and posts its findings back to this page.
 *
 * The sandbox has no `allow-same-origin`, so the copy runs in an opaque origin:
 * it cannot touch this page, its storage, or its cookies. This is still an
 * honest-but-partial check — resources that refuse to load for a copied page
 * mean some problems can be missed. The bookmarklet remains the accurate path.
 */
// The official self-contained axe build, embedded as text so it can be
// injected into the wrapped page copy untouched by our bundler's minifier.
import axeSource from 'axe-core/axe.min.js?raw';
import { normalizeAxeViolations, type AxeResults } from '../core/issue-normalizer.js';
import { categorizeAxeRule } from './categorize.js';
import type { AuditIssue } from '../core/types.js';

const RELAY_URL = 'https://api.allorigins.win/raw?url=';
const RESULT_TIMEOUT_MS = 30000;
const MESSAGE_TYPE = 'a11y-lab-axe-results';

export interface UrlCheckOutcome {
  issues: AuditIssue[];
  finalUrl: string;
  /** True when the fetched copy rendered almost nothing — the check likely saw an empty shell. */
  looksEmpty: boolean;
  /** issue.id → plain-language result category (Page structure, Forms, ...). */
  categories: Record<string, string>;
}

export function normalizeUrlInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Please type a web address first.');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function fetchPageCopy(url: string): Promise<string> {
  try {
    const direct = await fetch(url, { mode: 'cors' });
    if (direct.ok) return await direct.text();
  } catch {
    // Most sites block direct cross-origin reads — fall through to the relay.
  }

  const relayed = await fetch(`${RELAY_URL}${encodeURIComponent(url)}`);
  if (!relayed.ok) {
    throw new Error(
      'That page could not be fetched. The site may be blocking automated tools — try the "Audit this page" bookmark instead.',
    );
  }
  return relayed.text();
}

function buildWrappedCopy(html: string, url: string): string {
  const baseTag = `<base href="${url.replace(/"/g, '&quot;')}">`;
  const withBase = /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, (match) => `${match}${baseTag}`)
    : `${baseTag}${html}`;

  const runner = `
    <script>
      (function () {
        var started = false;
        function report() {
          if (started) return;
          started = true;
          var body = document.body || document.createElement('body');
          var textLength = (body.textContent || '').trim().length;
          var elementCount = body.querySelectorAll('*').length;
          window.axe.run(document, { rules: { 'meta-viewport': { enabled: false } } })
            .then(function (results) {
              parent.postMessage({
                type: ${JSON.stringify(MESSAGE_TYPE)},
                violations: JSON.parse(JSON.stringify(results.violations)),
                textLength: textLength,
                elementCount: elementCount
              }, '*');
            })
            .catch(function (error) {
              parent.postMessage({ type: ${JSON.stringify(MESSAGE_TYPE)}, error: String(error) }, '*');
            });
        }
        if (document.readyState === 'complete') {
          setTimeout(report, 800);
        } else {
          window.addEventListener('load', function () { setTimeout(report, 800); });
          setTimeout(report, 8000); // fallback if load never fires
        }
      })();
    </script>`;

  // Escape `</` so sequences like "</script>" inside the embedded JS can't
  // terminate the script tag early when parsed as HTML.
  const safeAxeSource = axeSource.replace(/<\//g, '<\\/');
  const payload = `<script>${safeAxeSource}</script>${runner}`;
  if (/<\/body>/i.test(withBase)) {
    return withBase.replace(/<\/body>/i, `${payload}</body>`);
  }
  return `${withBase}${payload}`;
}

interface RunnerMessage {
  type?: string;
  violations?: AxeResults['violations'];
  textLength?: number;
  elementCount?: number;
  error?: string;
}

export async function runUrlCheck(input: string): Promise<UrlCheckOutcome> {
  const url = normalizeUrlInput(input);
  const wrapped = buildWrappedCopy(await fetchPageCopy(url), url);

  const iframe = document.createElement('iframe');
  // allow-scripts only, no allow-same-origin: the copy runs in an opaque
  // origin and cannot reach this page, its cookies, or its storage.
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.style.position = 'absolute';
  iframe.style.left = '-10000px';
  iframe.style.width = '1200px';
  iframe.style.height = '2000px';

  try {
    const resultPromise = new Promise<RunnerMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        window.removeEventListener('message', onMessage);
        reject(new Error('The check timed out. This site may not work with the quick check — try the "Audit this page" bookmark.'));
      }, RESULT_TIMEOUT_MS);

      function onMessage(event: MessageEvent) {
        const data = event.data as RunnerMessage;
        if (event.source === iframe.contentWindow && data && data.type === MESSAGE_TYPE) {
          clearTimeout(timer);
          window.removeEventListener('message', onMessage);
          resolve(data);
        }
      }
      window.addEventListener('message', onMessage);
    });

    document.body.append(iframe);
    iframe.srcdoc = wrapped;

    const message = await resultPromise;
    if (message.error || !message.violations) {
      throw new Error('The page copy could not be checked. Try the "Audit this page" bookmark for this site.');
    }

    const looksEmpty = (message.textLength ?? 0) < 40 && (message.elementCount ?? 0) < 5;
    const issues = normalizeAxeViolations({ violations: message.violations });
    const categories: Record<string, string> = {};
    for (const violation of message.violations) {
      categories[violation.id] = categorizeAxeRule(violation.id, violation.tags);
    }
    return { issues, finalUrl: url, looksEmpty, categories };
  } finally {
    iframe.remove();
  }
}
