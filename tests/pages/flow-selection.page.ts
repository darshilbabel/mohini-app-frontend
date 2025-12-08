import { Page, Locator } from "@playwright/test"
import { BasePage } from "./base.page"
import { SITE_ROUTES } from "../constant/site_routes"

/**
 * FlowSelectionPage handles interactions with the flow selection interface
 * where users choose which chatbot flow to interact with
 */
export class FlowSelectionPage extends BasePage {
  // Locators
  private readonly flowSelectionContainer: Locator
  private readonly flowCards: Locator
  private readonly continueButton: Locator
  private readonly imageContainer: Locator
  private readonly languageContainer: Locator
  private readonly flowContinueButton: Locator

  /**
   * Constructor for FlowSelectionPage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page)

    // Initialize locators - these should be updated based on actual application selectors
    this.flowSelectionContainer = page.locator('[data-testid="flow-selection-container"]')
    this.flowCards = page.locator("span.flex.items-center.gap-3.px-3.justify-center.sm\\:py-4.py-3.rounded-2xl.cursor-pointer.w-full")
    this.continueButton = page.locator('[data-testid="continue-button"]')
    this.imageContainer = page.locator(".custom-login-image").first()
    this.languageContainer = page.locator("div.div14-lang")
    this.flowContinueButton = page.locator("button.mt-0.px-16.py-2.rounded-xl.text-white.text-lg.font-medium.flex.items-center")
  }

  /**
   * Navigate to the flow selection page
   */
  async navigateToFlowSelection(route: string = SITE_ROUTES.HOME): Promise<void> {
    await this.navigate(route)
    await this.waitForElement(this.imageContainer)
  }

  async getLanguageCount(): Promise<number> {
    // await this.waitForElement(this.languageContainer.first());
    return this.languageContainer.count()
  }

  async waitForLanguageSelectionPageLoad(): Promise<void> {
    await this.waitForElement(this.languageContainer.first())
    await this.waitForPageLoad()
  }

  /**
   * Wait for flow selection page to be fully loaded
   */
  async waitForFlowSelectionPageLoad(): Promise<void> {
    await this.waitForElement(this.flowContinueButton)
    await this.waitForPageLoad()
  }

  /**
   * Get list of available flows
   * @returns Array of flow names
   */
  async getAvailableFlows(): Promise<string[]> {
    await this.waitForElement(this.flowCards.first())
    return await this.flowCards.allTextContents()
  }

  /**
   * Select a flow by its index position
   * @param index - Zero-based index of the flow
   */
  async selectFlowByIndex(index: number): Promise<void> {
    const flowCard = this.flowCards.nth(index)
    await this.waitForElement(flowCard)
    await this.clickElement(flowCard)
  }

  async selectLanguageByIndex(index: number): Promise<void> {
    const languageCard = this.languageContainer.nth(index)
    await this.waitForElement(languageCard)
    await this.clickElement(languageCard)
  }

  /**
   * Check if a specific flow is available
   * @param flowName - Name of the flow to check
   * @returns True if flow is available, false otherwise
   */
  async isFlowAvailable(flowName: string): Promise<boolean> {
    const flowCard = this.page.locator(`[data-testid="flow-card"]`, { hasText: flowName })
    return await this.isElementVisible(flowCard)
  }

  /**
   * Get the number of available flows
   * @returns Number of flows displayed
   */
  async getFlowCount(): Promise<number> {
    return this.flowCards.count()
  }

  /**
   * Click the continue button after selecting a flow
   */
  async clickContinue(): Promise<void> {
    await this.waitForElement(this.flowContinueButton)
    await this.clickElement(this.flowContinueButton)
  }

  /**
   * Check if continue button is enabled
   * @returns True if enabled, false otherwise
   */
  async isContinueButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.continueButton.isDisabled()
    return !isDisabled
  }

  /**
   * Get the currently selected flow name
   * @returns Name of the selected flow or null if none selected
   */
  async getSelectedFlowName(): Promise<string | null> {
    const selectedFlow = this.page.locator('[data-testid="flow-card"][data-selected="true"]')
    if (await this.isElementPresent(selectedFlow)) {
      return await this.getTextContent(selectedFlow)
    }
    return null
  }

  /**
   * Complete flow selection by index
   * @param index - Zero-based index of the flow
   */
  async completeFlowSelectionByIndex(index: number): Promise<void> {
    await this.selectFlowByIndex(index)
    await this.wait(500) // Brief wait for UI state update
    await this.clickContinue()
  }
}
