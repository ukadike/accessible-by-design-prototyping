import { chromium } from 'playwright';
import axeCore from 'axe-core';
import type { AxeResults } from '../core/issue-normalizer.js';
import { isPublicWebUrl } from '../security/public-url.js';

export interface PageAuditData {
  axeResults: AxeResults;
  html: string;
}

const PLAYWRIGHT_CHROMIUM_EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export async function runAxeOnPage(target: string): Promise<PageAuditData> {
  const browser = await chromium.launch(
    PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: PLAYWRIGHT_CHROMIUM_EXECUTABLE } : undefined,
  );
  try {
    const page = await browser.newPage();
    if (process.env.A11Y_PUBLIC_URL_ONLY === 'true') {
      await page.route('**/*', async (route) => {
        const requestUrl = route.request().url();
        if (/^(about|blob|data):/i.test(requestUrl) || (await isPublicWebUrl(requestUrl))) {
          await route.continue();
        } else {
          await route.abort('blockedbyclient');
        }
      });
    }
    await page.goto(target, { waitUntil: 'load' });
    await page.addScriptTag({ content: axeCore.source });
    const axeResults = (await page.evaluate(() => {
      // @ts-expect-error axe is injected into the page at runtime
      return window.axe.run();
    })) as AxeResults;
    const html = await page.content();
    return { axeResults, html };
  } finally {
    await browser.close();
  }
}
