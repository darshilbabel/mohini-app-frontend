import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Load environment variables from .env file
 */
dotenv.config();

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /**
   * Maximum time one test can run for
   * Increased to accommodate websocket interactions and story generation
   */
  timeout: 500 * 1000,
  
  /**
   * Maximum time to wait for expect() assertions
   */
  expect: {
    timeout: 10 * 1000,
  },
  
  /**
   * Run tests in files in parallel
   */
  fullyParallel: false,
  
  /**
   * Fail the build on CI if you accidentally left test.only in the source code
   */
  forbidOnly: !!process.env.CI,
  
  /**
   * Retry on CI only
   */
  retries: process.env.CI ? 2 : 0,
  
  /**
   * Number of workers for parallel execution
   * Use fewer workers for websocket-heavy tests to avoid overwhelming the server
   */
  workers: process.env.CI ? 2 : 3,
  
  /**
   * Reporter configuration
   */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /**
   * Shared settings for all projects
   */
  use: {
    /**
     * Base URL from environment variable
     */
    baseURL: process.env.SHIKSHALOKAM_FE_URL || 'http://localhost:3000',
    
    /**
     * Collect trace on failure for debugging
     */
    trace: 'on-first-retry',
    
    /**
     * Capture screenshot on failure
     */
    screenshot: 'only-on-failure',
    
    video: 'on',
    
    /**
     * Maximum time for each action (click, fill, etc.)
     */
    actionTimeout: 15 * 1000,
    
    /**
     * Maximum time for page navigation
     */
    navigationTimeout: 30 * 1000,
  },

  /**
   * Configure projects for major browsers
   */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // viewport: { width: 1280, height: 800 },
        // viewport: { width: 1920, height: 1080 },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },

    /**
     * Mobile viewports for responsive testing
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /**
   * Folder for test artifacts
   */
  outputDir: 'test-results/',
});

