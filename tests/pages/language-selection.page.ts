import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LanguageSelectionPage handles interactions with the language selection interface
 * where users choose their preferred language for the chat interaction
 */
export class LanguageSelectionPage extends BasePage {
  // Locators
  private readonly languageSelectionContainer: Locator;
  private readonly languageOptions: Locator;
  private readonly continueButton: Locator;
  private readonly backButton: Locator;

  /**
   * Constructor for LanguageSelectionPage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators - these should be updated based on actual application selectors
    this.languageSelectionContainer = page.locator('[data-testid="language-selection-container"]');
    this.languageOptions = page.locator('[data-testid="language-option"]');
    this.continueButton = page.locator('[data-testid="continue-button"]');
    this.backButton = page.locator('[data-testid="back-button"]');
  }

  /**
   * Wait for language selection page to be fully loaded
   */
  async waitForLanguageSelectionPageLoad(): Promise<void> {
    await this.waitForElement(this.languageSelectionContainer);
    await this.waitForPageLoad();
  }

  /**
   * Get list of available languages
   * @returns Array of language names
   */
  async getAvailableLanguages(): Promise<string[]> {
    await this.waitForElement(this.languageOptions);
    return await this.languageOptions.allTextContents();
  }

  /**
   * Select a language by its name
   * @param languageName - Name of the language to select (e.g., "English", "Hindi")
   */
  async selectLanguageByName(languageName: string): Promise<void> {
    const languageOption = this.page.locator(`[data-testid="language-option"]`, { hasText: languageName });
    await this.waitForElement(languageOption);
    await this.clickElement(languageOption);
  }

  /**
   * Select a language by its index position
   * @param index - Zero-based index of the language
   */
  async selectLanguageByIndex(index: number): Promise<void> {
    const languageOption = this.languageOptions.nth(index);
    await this.waitForElement(languageOption);
    await this.clickElement(languageOption);
  }

  /**
   * Select a language by code
   * @param languageCode - Language code (e.g., "en", "hi")
   */
  async selectLanguageByCode(languageCode: string): Promise<void> {
    const languageOption = this.page.locator(`[data-language-code="${languageCode}"]`);
    await this.waitForElement(languageOption);
    await this.clickElement(languageOption);
  }

  /**
   * Check if a specific language is available
   * @param languageName - Name of the language to check
   * @returns True if language is available, false otherwise
   */
  async isLanguageAvailable(languageName: string): Promise<boolean> {
    const languageOption = this.page.locator(`[data-testid="language-option"]`, { hasText: languageName });
    return await this.isElementVisible(languageOption);
  }

  /**
   * Get the number of available languages
   * @returns Number of languages displayed
   */
  async getLanguageCount(): Promise<number> {
    return await this.languageOptions.count();
  }

  /**
   * Click the continue button after selecting a language
   */
  async clickContinue(): Promise<void> {
    await this.waitForElement(this.continueButton);
    await this.clickElement(this.continueButton);
  }

  /**
   * Click the back button to return to flow selection
   */
  async clickBack(): Promise<void> {
    await this.waitForElement(this.backButton);
    await this.clickElement(this.backButton);
  }

  /**
   * Check if continue button is enabled
   * @returns True if enabled, false otherwise
   */
  async isContinueButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.continueButton.isDisabled();
    return !isDisabled;
  }

  /**
   * Get the currently selected language
   * @returns Name of the selected language or null if none selected
   */
  async getSelectedLanguageName(): Promise<string | null> {
    const selectedLanguage = this.page.locator('[data-testid="language-option"][data-selected="true"]');
    if (await this.isElementPresent(selectedLanguage)) {
      return await this.getTextContent(selectedLanguage);
    }
    return null;
  }

  /**
   * Complete language selection process (select language and continue)
   * @param languageName - Name of the language to select
   */
  async completeLanguageSelection(languageName: string): Promise<void> {
    await this.selectLanguageByName(languageName);
    await this.wait(500); // Brief wait for UI state update
    await this.clickContinue();
  }

  /**
   * Complete language selection by index
   * @param index - Zero-based index of the language
   */
  async completeLanguageSelectionByIndex(index: number): Promise<void> {
    await this.selectLanguageByIndex(index);
    await this.wait(500); // Brief wait for UI state update
    await this.clickContinue();
  }

  /**
   * Verify language selection page is displayed
   * @returns True if page is displayed
   */
  async isLanguageSelectionDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.languageSelectionContainer);
  }
}

