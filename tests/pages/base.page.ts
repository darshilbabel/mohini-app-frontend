import { Page, Locator } from '@playwright/test';

/**
 * BasePage class provides common functionality for all page objects
 * This includes navigation, waiting, element interactions, and utility methods
 */
export class BasePage {
  protected page: Page
  protected baseURL: string

  /**
   * Constructor for BasePage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page
    this.baseURL = process.env.SHIKSHALOKAM_FE_URL || "http://localhost:3000"
  }

  /**
   * Navigate to a specific path
   * @param path - URL path to navigate to (relative to baseURL)
   */
  async navigate(path: string = "/"): Promise<void> {
    const url = path.startsWith("http") ? path : `${this.baseURL}${path}`
    await this.page.goto(url, { waitUntil: "domcontentloaded" })
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout: 30000 })
  }

  /**
   * Wait for a specific element to be visible
   * @param selector - CSS selector or locator
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForElement(selector: string | Locator, timeout: number = 10000, state: "attached" | "detached" | "visible" | "hidden" | undefined = "visible"): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.waitFor({ state, timeout })
  }

  /**
   * Wait for a specific element to be hidden
   * @param selector - CSS selector or locator
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForElementHidden(selector: string | Locator, timeout: number = 10000): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.waitFor({ state: "hidden", timeout })
  }

  /**
   * Click on an element with retry logic
   * @param selector - CSS selector or locator
   * @param options - Click options
   */
  async clickElement(selector: string | Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.click(options)
  }

  /**
   * Fill input field with text
   * @param selector - CSS selector or locator
   * @param text - Text to fill
   */
  async fillInput(selector: string | Locator, text: string): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.fill(text)
  }

  /**
   * Type text with a delay between keystrokes (useful for simulating real user input)
   * @param selector - CSS selector or locator
   * @param text - Text to type
   * @param delay - Delay in milliseconds between keystrokes
   */
  async typeText(selector: string | Locator, text: string, delay: number = 100): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.type(text, { delay })
  }

  /**
   * Get text content from an element
   * @param selector - CSS selector or locator
   * @returns Text content of the element
   */
  async getTextContent(selector: string | Locator): Promise<string | null> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    return await locator.textContent()
  }

  /**
   * Check if an element is visible
   * @param selector - CSS selector or locator
   * @returns True if element is visible, false otherwise
   */
  async isElementVisible(selector: string | Locator): Promise<boolean> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if an element exists in the DOM
   * @param selector - CSS selector or locator
   * @returns True if element exists, false otherwise
   */
  async isElementPresent(selector: string | Locator): Promise<boolean> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    return (await locator.count()) > 0
  }

  /**
   * Wait for specific amount of time
   * @param milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds)
  }

  /**
   * Scroll element into view
   * @param selector - CSS selector or locator
   */
  async scrollIntoView(selector: string | Locator): Promise<void> {
    const locator = typeof selector === "string" ? this.page.locator(selector) : selector
    await locator.scrollIntoViewIfNeeded()
  }

  /**
   * Take a screenshot
   * @param filename - Name of the screenshot file
   */
  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${filename}`, fullPage: true })
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * Press a specific key
   * @param key - Key to press (e.g., 'Enter', 'Escape')
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key)
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" })
  }

  /**
   * Wait for a network request to complete
   * @param urlPattern - URL pattern to wait for
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForRequest(urlPattern: string | RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForRequest(urlPattern, { timeout })
  }

  /**
   * Wait for a network response to complete
   * @param urlPattern - URL pattern to wait for
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForResponse(urlPattern: string | RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout })
  }

  /**
   * Get all text from multiple elements
   * @param selector - CSS selector
   * @returns Array of text contents
   */
  async getAllTextContents(selector: string): Promise<string[]> {
    return await this.page.locator(selector).allTextContents()
  }

  /**
   * Count number of elements matching selector
   * @param selector - CSS selector
   * @returns Number of matching elements
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count()
  }
}

