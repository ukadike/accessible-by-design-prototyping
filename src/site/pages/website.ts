import humanReviewPromptsData from '../../../rules/human-review-prompts.json';
import { filterPromptsByContext } from '../../core/context-filter.js';
import { runUrlCheck } from '../url-check.js';
import { el, buildResult, renderResults } from '../results.js';
import type { HumanReviewPrompt } from '../../core/types.js';

const humanReviewPrompts = humanReviewPromptsData as HumanReviewPrompt[];

const QUICK_CHECK_NOTE =
  'This was a quick check of a copy of the page, so some problems (especially on sites built with heavy scripting) may not show up. For complete results, use the "Audit this page" bookmark.';

/* ---------- bookmarklet link ---------- */

const bookmarkletLink = document.getElementById('bookmarklet-link') as HTMLAnchorElement | null;
if (bookmarkletLink) {
  const scriptUrl = new URL('bookmarklet.js', document.baseURI).href;
  bookmarkletLink.href = `javascript:(function(){var s=document.createElement('script');s.src=${JSON.stringify(
    scriptUrl,
  )}+'?t='+Date.now();document.body.appendChild(s);})();`;
  bookmarkletLink.addEventListener('click', (event) => {
    // Clicking the button on this page shouldn't run it here — it's meant to be dragged.
    event.preventDefault();
    window.alert(
      'Drag this button up into your bookmarks bar instead of clicking it. Then visit the site you want to check and click the bookmark there.',
    );
  });
}

/* ---------- quick URL check ---------- */

const urlInput = document.getElementById('url-input') as HTMLInputElement | null;
const urlButton = document.getElementById('url-check-button') as HTMLButtonElement | null;
const urlResults = document.getElementById('url-results');

if (urlInput && urlButton && urlResults) {
  const runCheck = () => {
    const value = urlInput.value.trim();
    urlResults.textContent = '';
    if (!value) {
      urlResults.append(el('p', 'result-summary problems', 'Type a web address first, then press the button.'));
      return;
    }
    urlButton.disabled = true;
    urlResults.textContent = 'Fetching a copy of the page and checking it — this can take a few seconds…';
    void (async () => {
      try {
        const { issues, finalUrl, looksEmpty, categories } = await runUrlCheck(value);
        const prompts = filterPromptsByContext(humanReviewPrompts, ['html']);
        const result = buildResult(finalUrl, issues, prompts);
        if (looksEmpty) {
          urlResults.textContent = '';
          urlResults.append(
            el(
              'p',
              'result-summary problems',
              'The copy of this page came back almost empty — it is probably built with scripting that the quick check can’t see. Please use the "Audit this page" bookmark for this site.',
            ),
          );
          return;
        }
        const slug =
          finalUrl
            .replace(/^https?:\/\//i, '')
            .replace(/[^a-z0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || 'page';
        renderResults(urlResults, issues, prompts, result, slug, { note: QUICK_CHECK_NOTE, categories });
      } catch (checkError) {
        urlResults.textContent = '';
        urlResults.append(
          el(
            'p',
            'result-summary problems',
            checkError instanceof Error ? checkError.message : 'Sorry — that page could not be checked.',
          ),
        );
      } finally {
        urlButton.disabled = false;
      }
    })();
  };

  urlButton.addEventListener('click', runCheck);
  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runCheck();
    }
  });
}
