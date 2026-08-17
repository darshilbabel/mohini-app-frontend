import { Page, Locator } from "@playwright/test"
import { BasePage } from "./base.page"
import path from "path"

/**
 * ChatInterfacePage handles interactions with the chat interface
 * including websocket-based message exchange with the chatbot
 */
export class ChatInterfacePage extends BasePage {
  // Locators
  private readonly chatContainer: Locator
  private readonly messageInput: Locator
  private readonly sendButton: Locator
  private readonly chatMessages: Locator
  private readonly userMessages: Locator
  private readonly botMessages: Locator
  private readonly loadingIndicator: Locator
  private readonly chatCompleteIndicator: Locator
  private readonly viewStoryButton: Locator
  private readonly termsAndConditionsContainer: Locator
  private readonly termsAndConditionsButton: Locator
  private readonly introMessage: Locator
  private readonly uploadImageInput: Locator
  private readonly uploadedImage: Locator
  private readonly reportButton: Locator
  private readonly editorSaveButton: Locator

  /**
   * Constructor for ChatInterfacePage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page)

    // Initialize locators - these should be updated based on actual application selectors
    this.chatContainer = page.locator("li.div34.div35.label1")
    this.messageInput = page.locator("textarea#textBoxID.input-2.input-1")
    this.sendButton = page.locator("button.send-btn")
    this.chatMessages = page.locator('[data-testid="chat-message"]')
    this.userMessages = page.locator('[data-testid="user-message"]')
    this.botMessages = page.locator('[data-testid="bot-message"]')
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    this.chatCompleteIndicator = page.locator('[data-testid="chat-complete"]')
    this.viewStoryButton = page.locator('[data-testid="view-story-button"]')
    this.termsAndConditionsContainer = page.locator("div.tnc-cover")
    this.termsAndConditionsButton = page.locator("button.tnc-button.accept")
    this.introMessage = page.locator("#intro_msg_id")
    this.uploadImageInput = page.locator('input#file-upload[type="file"]')
    this.uploadedImage = page.locator("li.li-2")
    this.reportButton = page.locator("div.div20 > button.clickable-button")
    this.editorSaveButton = page.locator("div.editor-button-div > button")
  }

  async waitForUploadImageInput(): Promise<void> {
    await this.waitForElement(this.uploadImageInput, 30000)
  }

  async waitForEditorSaveButton(): Promise<void> {
    await this.waitForElement(this.editorSaveButton, 30000)
  }

  async saveEditor(): Promise<void> {
    await this.clickElement(this.editorSaveButton)
  }

  async downloadReport(file_name: string | undefined = undefined): Promise<void> {
    const downloadPromise = this.page.waitForEvent("download")
    await this.clickElement(this.reportButton.first())
    const download = await downloadPromise

    await download.saveAs(path.join(process.cwd(), "downloads", file_name || (await download.suggestedFilename())))
  }

  async waitForReportButton(): Promise<void> {
    await this.waitForElement(this.reportButton.first(), 30000)
  }

  async openEditor(): Promise<void> {
    await this.clickElement(this.reportButton.nth(1))
  }

  async getImageCount(): Promise<number> {
    return await this.uploadedImage.count()
  }

  async uploadImage(file_name: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent("filechooser")
    await this.clickElement(this.uploadImageInput)
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, "..", "static", file_name))
  }

  /**
   * Wait for chat interface to be fully loaded
   */
  async waitForChatInterfaceLoad(): Promise<void> {
    await this.waitForElement(this.introMessage, 50000)
    await this.waitForElement(this.messageInput)
    await this.waitForPageLoad()
  }

  /**
   * Wait for chat container to appear multiple times in the DOM
   * @param count - Number of chat containers to wait for (default: 3)
   * @param timeout - Maximum time to wait in milliseconds (default: 10000)
   */
  async waitForChatContainerCount(count: number = 3, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      ({ selector, expectedCount }) => {
        return document.querySelectorAll(selector).length >= expectedCount
      },
      { selector: "li.div34.div35.label1", expectedCount: count },
      { timeout }
    )
  }

  async waitForUploadedImage(): Promise<void> {
    await this.waitForElement(this.uploadedImage, 60000)
  }

  async removeUploadedImage(count: number = 0): Promise<void> {
    const imageEntry = this.uploadedImage.nth(count)
    const removeButton = imageEntry.locator("button")
    await this.clickElement(removeButton)
  }

  /**
   * Check if the current page route is /mohini/guest-chat
   * @returns True if on guest chat route
   */
  checkRoute(route: string): boolean {
    const currentUrl = this.getCurrentUrl()
    return currentUrl.includes(route)
  }

  async acceptTermsAndConditions(): Promise<void> {
    await this.waitForElement(this.termsAndConditionsContainer)
    await this.clickElement(this.termsAndConditionsButton)
  }

  /**
   * Check if chat interface is displayed
   * @returns True if chat interface is visible
   */
  async isChatInterfaceDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.chatContainer)
  }

  /**
   * Send a message in the chat
   * @param message - Message text to send
   */
  async sendMessage(message: string): Promise<void> {
    await this.fillInput(this.messageInput, message)
    await this.clickElement(this.sendButton)
  }

  /**
   * Type a message with delay (simulates real user typing)
   * @param message - Message text to type
   * @param delay - Delay between keystrokes in milliseconds
   */
  async typeMessage(message: string, delay: number = 100): Promise<void> {
    await this.waitForElement(this.messageInput)
    await this.typeText(this.messageInput, message, delay)
  }

  /**
   * Click the send button
   */
  async clickSend(): Promise<void> {
    await this.clickElement(this.sendButton)
  }

  /**
   * Wait for bot response after sending a message
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForBotResponse(timeout: number = 30000): Promise<void> {
    // Wait for loading indicator to appear and disappear
    try {
      await this.waitForElement(this.loadingIndicator, 5000)
      await this.waitForElementHidden(this.loadingIndicator, timeout)
    } catch {
      // If loading indicator doesn't appear, just wait for new message
      await this.wait(1000)
    }

    // Wait for new bot message
    await this.waitForElement(this.botMessages.last(), timeout)
  }

  /**
   * Send message and wait for response
   * @param message - Message to send
   * @param timeout - Maximum time to wait for response
   */
  async sendMessageAndWaitForResponse(message: string, timeout: number = 30000): Promise<void> {
    const initialMessageCount = await this.getMessageCount()
    await this.sendMessage(message)
    await this.waitForBotResponse(timeout)

    // Verify new message appeared
    const newMessageCount = await this.getMessageCount()
    if (newMessageCount <= initialMessageCount) {
      throw new Error("No new message received after sending")
    }
  }

  /**
   * Get all chat messages
   * @returns Array of message texts
   */
  async getAllMessages(): Promise<string[]> {
    await this.waitForElement(this.chatMessages)
    return await this.chatMessages.allTextContents()
  }

  /**
   * Get all user messages
   * @returns Array of user message texts
   */
  async getUserMessages(): Promise<string[]> {
    if (await this.isElementPresent(this.userMessages)) {
      return await this.userMessages.allTextContents()
    }
    return []
  }

  /**
   * Get all bot messages
   * @returns Array of bot message texts
   */
  async getBotMessages(): Promise<string[]> {
    if (await this.isElementPresent(this.botMessages)) {
      return await this.botMessages.allTextContents()
    }
    return []
  }

  /**
   * Get the last message in the chat
   * @returns Text of the last message
   */
  async getLastMessage(): Promise<string | null> {
    return await this.getTextContent(this.chatMessages.last())
  }

  /**
   * Get the last bot message
   * @returns Text of the last bot message
   */
  async getLastBotMessage(): Promise<string | null> {
    if (await this.isElementPresent(this.botMessages)) {
      return await this.getTextContent(this.botMessages.last())
    }
    return null
  }

  /**
   * Get total number of messages in chat
   * @returns Number of messages
   */
  async getMessageCount(): Promise<number> {
    return await this.chatMessages.count()
  }

  /**
   * Check if send button is enabled
   * @returns True if enabled, false otherwise
   */
  async isSendButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.sendButton.isDisabled()
    return !isDisabled
  }

  /**
   * Check if chat is in loading state (waiting for response)
   * @returns True if loading, false otherwise
   */
  async isLoading(): Promise<boolean> {
    return await this.isElementVisible(this.loadingIndicator)
  }

  /**
   * Wait for chat to complete (conversation finished)
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForChatComplete(timeout: number = 60000): Promise<void> {
    await this.waitForElement(this.chatCompleteIndicator, timeout)
  }

  /**
   * Check if chat is complete
   * @returns True if chat is complete
   */
  async isChatComplete(): Promise<boolean> {
    return await this.isElementVisible(this.chatCompleteIndicator)
  }

  /**
   * Check if view story button is visible
   * @returns True if button is visible
   */
  async isViewStoryButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.viewStoryButton)
  }

  /**
   * Click view story button to navigate to story view
   */
  async clickViewStory(): Promise<void> {
    await this.waitForElement(this.viewStoryButton)
    await this.clickElement(this.viewStoryButton)
  }

  /**
   * Complete a full chat conversation with predefined responses
   * @param messages - Array of messages to send in sequence
   * @param waitBetweenMessages - Time to wait between messages in milliseconds
   */
  async completeConversation(messages: string[], waitBetweenMessages: number = 1000): Promise<void> {
    for (const message of messages) {
      await this.sendMessageAndWaitForResponse(message)
      await this.wait(waitBetweenMessages)
    }

    // Wait for chat to complete
    await this.waitForChatComplete()
  }

  /**
   * Clear message input
   */
  async clearMessageInput(): Promise<void> {
    await this.fillInput(this.messageInput, "")
  }

  /**
   * Get current input value
   * @returns Current text in input field
   */
  async getInputValue(): Promise<string> {
    return await this.messageInput.inputValue()
  }
}
