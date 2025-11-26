/**
 * Central export file for all test fixtures
 * Import test data and utilities from this file
 */

export * from './test-data';

export { default as testData } from './test-data';

/**
 * Browser fixture for connecting to existing Chrome browser
 * Use this when CHROME_DEBUG_PORT is set in your .env file
 * 
 * Example:
 * import { test, expect } from '../fixtures';
 * 
 * Or import directly:
 * import { test, expect } from '../fixtures/browser.fixture';
 */
export { test, expect } from './browser.fixture';

