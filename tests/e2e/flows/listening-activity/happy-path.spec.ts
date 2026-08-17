// import { test, expect } from '../../../fixtures';
import { test, expect } from "@playwright/test"
import { FlowSelectionPage } from "../../../pages/flow-selection.page"
import { ChatInterfacePage } from "../../../pages/chat-interface.page"
import { SITE_ROUTES } from "../../../constant/site_routes"
import { GUEST_LISTEN_CONVERSATION_EN } from "../../../constant/guest-listen"

/**
 * Happy Path Test Suite for Flow Example 1
 * Tests the complete user journey from flow selection to story download
 */
test.describe("Listening Activity Flow - Happy Path", () => {
  let flowSelectionPage: FlowSelectionPage
  let chatInterfacePage: ChatInterfacePage

  /**
   * Setup before each test
   * Initialize page objects and navigate to the application
   */
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies()

    // Initialize page objects
    flowSelectionPage = new FlowSelectionPage(page)
    chatInterfacePage = new ChatInterfacePage(page)

    // Navigate to the application
    await flowSelectionPage.navigateToFlowSelection(SITE_ROUTES.LISTENING_ACTIVITY_HOME)

    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

  })

  /**
   * Test: Complete happy path flow
   * Verifies user can complete entire flow from start to finish
   */
  test("should complete full flow with story generation and download", async () => {
    // Step 1: Select language
    await test.step("Select language", async () => {
      await flowSelectionPage.navigateToFlowSelection(SITE_ROUTES.LISTENING_ACTIVITY_HOME)
      await flowSelectionPage.waitForLanguageSelectionPageLoad()
      const languageCount = await flowSelectionPage.getLanguageCount()
      expect(languageCount).toBe(3)
      await flowSelectionPage.selectLanguageByIndex(0)
    })

    await test.step("Accept terms and conditions", async () => {
      await chatInterfacePage.wait(3000)
      await chatInterfacePage.acceptTermsAndConditions()
      expect(chatInterfacePage.checkRoute(SITE_ROUTES.LISTENING_ACTIVITY)).toBeTruthy()
    })

    // Step 3: Complete chat conversation
    await test.step("Complete chat conversation", async () => {
      await chatInterfacePage.waitForChatInterfaceLoad()
      await chatInterfacePage.wait(2000)

      for (let i = 0; i < GUEST_LISTEN_CONVERSATION_EN.length; i++) {
        await chatInterfacePage.sendMessage(GUEST_LISTEN_CONVERSATION_EN[i])
        await chatInterfacePage.wait(10000)
        if (i !== GUEST_LISTEN_CONVERSATION_EN.length - 1) {
          await chatInterfacePage.waitForChatContainerCount(2 * i + 3, 20000)
        }
      }
    })

    await test.step("Download report", async () => {
      await chatInterfacePage.waitForReportButton()
      await chatInterfacePage.downloadReport("listening-activity-happy-flow.pdf")
      await chatInterfacePage.waitForReportButton()
    })
  })

})
