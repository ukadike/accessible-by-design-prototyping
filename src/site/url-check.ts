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

const ALL_ORIGINS_RAW_URL = 'https://api.allorigins.win/raw?url=';
const CORS_DEV_PREFIX = 'https://proxy.cors.dev/';
const DIRECT_TIMEOUT_MS = 8000;
const RELAY_TIMEOUT_MS = 12000;
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

async function fetchWithTimeout(input: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function describeFetchFailure(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') return 'timed out';
  return error instanceof Error ? error.message : 'network error';
}

async function fetchPageCopy(url: string): Promise<string> {
  try {
    const direct = await fetchWithTimeout(url, DIRECT_TIMEOUT_MS);
    if (direct.ok) return await direct.text();
  } catch {
    // Most sites block direct cross-origin reads — try public relays below.
  }

  const relays = [
    {
      name: 'cors.dev',
      url: `${CORS_DEV_PREFIX}${url}`,
    },
    {
      name: 'AllOrigins',
      url: `${ALL_ORIGINS_RAW_URL}${encodeURIComponent(url)}`,
    },
  ];
  const failures: string[] = [];

  for (const relay of relays) {
    try {
      const response = await fetchWithTimeout(relay.url, RELAY_TIMEOUT_MS);
      if (!response.ok) {
        failures.push(`${relay.name} returned HTTP ${response.status}`);
        continue;
      }
      const html = await response.text();
      if (!html.trim()) {
        failures.push(`${relay.name} returned an empty response`);
        continue;
      }
      return html;
    } catch (error) {
      failures.push(`${relay.name} ${describeFetchFailure(error)}`);
    }
  }

  const details = failures.length ? ` Relay results: ${failures.join('; ')}.` : '';
  throw new Error(
    `Quick check couldn't fetch this page.${details} This is a fetch failure, not an accessibility result. Try again later or use the "Audit this page" bookmark.`,
  );
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
