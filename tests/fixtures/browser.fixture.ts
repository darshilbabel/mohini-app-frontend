import { test as base, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Load environment variables
 */
dotenv.config();

/**
 * Custom fixtures for connecting to existing Chrome browser via CDP
 * 
 * Usage:
 * 1. Start Chrome with remote debugging: 
 *    chrome --remote-debugging-port=9222
 *    Or on macOS:
 *    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 * 2. Set CHROME_DEBUG_PORT=9222 in your .env file
 * 3. Import and use this test fixture in your test files:
 *    import { test, expect } from '../fixtures/browser.fixture';
 * 
 * Note: When CHROME_DEBUG_PORT is not set, this fixture behaves like the default Playwright test
 */
/**
 * Only extend fixtures if CHROME_DEBUG_PORT is set
 * Otherwise, use the base test which has default Playwright behavior
 */
const debugPort = process.env.CHROME_DEBUG_PORT;

export const test = debugPort
  ? base.extend<{
      browser: Browser;
      context: BrowserContext;
      page: Page;
    }>({
      browser: async ({ }, use) => {
        // Connect to existing browser via CDP
        const browser = await chromium.connectOverCDP(`http://localhost:${debugPort}`);
        await use(browser);
        // Don't close the browser as it's externally managed
      },
      
      context: async ({ browser, contextOptions }, use) => {
        // Get existing context or create a new one from the connected browser
        const contexts = browser.contexts();
        let context: BrowserContext;
        
        if (contexts.length > 0) {
          // Use the first existing context
          context = contexts[0];
        } else {
          // Create a new context with the provided options
          context = await browser.newContext(contextOptions);
        }
        
        await use(context);
        // Don't close the context if connected to existing browser
      },
      
      page: async ({ context }, use) => {
        // Get existing page or create a new one
        const pages = context.pages();
        const page = pages.length > 0 ? pages[0] : await context.newPage();
        await use(page);
        // Don't close the page if connected to existing browser
      },
    })
  : base; // Use default Playwright test when CHROME_DEBUG_PORT is not set

export { expect } from '@playwright/test';

