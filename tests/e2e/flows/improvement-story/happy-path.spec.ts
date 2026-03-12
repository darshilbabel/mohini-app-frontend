// import { test, expect } from '../../../fixtures';
import { test, expect } from "@playwright/test"
import { FlowSelectionPage } from "../../../pages/flow-selection.page"
import { ChatInterfacePage } from "../../../pages/chat-interface.page"
import { IMPROVEMENT_STORY_CHAT_CONVERSATION_EN, IMPROVEMENT_STORY_CHAT_CONVERSATION_KN } from "../../../constant/improvement-story-chat"
import { SITE_ROUTES } from "../../../constant/site_routes"

/**
 * Happy Path Test Suite for Flow Example 1
 * Tests the complete user journey from flow selection to story download
 */
test.describe("Share Improvement Story Flow - Happy Path", () => {
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
    await flowSelectionPage.navigateToFlowSelection()
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
      await flowSelectionPage.navigateToFlowSelection()
      await flowSelectionPage.waitForLanguageSelectionPageLoad()
      const languageCount = await flowSelectionPage.getLanguageCount()
      expect(languageCount).toBe(4)
      await flowSelectionPage.selectLanguageByIndex(0)
    })

    // Step 2: Select flow
    await test.step("Select flow", async () => {
      await flowSelectionPage.waitForFlowSelectionPageLoad()
      const flowCount = await flowSelectionPage.getFlowCount()
      expect(flowCount).toBe(2)
      await flowSelectionPage.selectFlowByIndex(1)
      await flowSelectionPage.wait(1000)
      await flowSelectionPage.clickContinue()
    })

    await test.step("Accept terms and conditions", async () => {
      await chatInterfacePage.wait(3000)
      await chatInterfacePage.acceptTermsAndConditions()
      expect(chatInterfacePage.checkRoute(SITE_ROUTES.GUEST_MI)).toBeTruthy()
    })

    // Step 3: Complete chat conversation
    await test.step("Complete chat conversation", async () => {
      await chatInterfacePage.waitForChatInterfaceLoad()
      await chatInterfacePage.wait(2000)

      for (let i = 0; i < IMPROVEMENT_STORY_CHAT_CONVERSATION_EN.length; i++) {
        await chatInterfacePage.sendMessage(IMPROVEMENT_STORY_CHAT_CONVERSATION_EN[i])
        await chatInterfacePage.wait(10000)
        if (i != IMPROVEMENT_STORY_CHAT_CONVERSATION_EN.length - 1) {
          await chatInterfacePage.waitForChatContainerCount(2 * i + 3, 20000)
        }
      }
    })

    await test.step("Upload image, remove and again upload", async () => {
      await chatInterfacePage.waitForUploadImageInput()
      await chatInterfacePage.uploadImage("sample_image.png")
      await chatInterfacePage.waitForUploadImageInput()
      await chatInterfacePage.waitForUploadedImage()
      await chatInterfacePage.removeUploadedImage()
      await chatInterfacePage.wait(5000)
      const imageCount = await chatInterfacePage.getImageCount()
      expect(imageCount).toBe(0)
    })

    await test.step("Edit story", async () => {
      await chatInterfacePage.waitForReportButton()
      await chatInterfacePage.openEditor()
      await chatInterfacePage.waitForEditorSaveButton()
      await chatInterfacePage.saveEditor()
      await chatInterfacePage.waitForReportButton()
    })

    await test.step("Download report", async () => {
      await chatInterfacePage.waitForReportButton()
      await chatInterfacePage.downloadReport("improvement-story-happy-flow.pdf")
      await chatInterfacePage.waitForReportButton()
    })
  })

  test("should complete full flow with story generation and download using SSO", async () => {
    await test.step("Redirect to Home Page from SSO Route", async () => {})
  })
})


/**
 * Happy Path Test Suite for Flow Example 2
 * Tests the complete user journey from flow selection to story download
 */
test.describe("Share Improvement Story Flow - Happy Path in Kannada Language", () => {
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
    await flowSelectionPage.navigateToFlowSelection()
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
      await flowSelectionPage.navigateToFlowSelection()
      await flowSelectionPage.waitForLanguageSelectionPageLoad()
      const languageCount = await flowSelectionPage.getLanguageCount()
      expect(languageCount).toBe(4)
      await flowSelectionPage.selectLanguageByIndex(3)
    })

    // Step 2: Select flow
    await test.step("Select flow", async () => {
      await flowSelectionPage.waitForFlowSelectionPageLoad()
      const flowCount = await flowSelectionPage.getFlowCount()
      expect(flowCount).toBe(2)
      await flowSelectionPage.selectFlowByIndex(1)
      await flowSelectionPage.wait(1000)
      await flowSelectionPage.clickContinue()
    })

    await test.step("Accept terms and conditions", async () => {
      await chatInterfacePage.wait(3000)
      await chatInterfacePage.acceptTermsAndConditions()
      expect(chatInterfacePage.checkRoute(SITE_ROUTES.GUEST_MI)).toBeTruthy()
    })

    // Step 3: Complete chat conversation
    await test.step("Complete chat conversation", async () => {
      await chatInterfacePage.waitForChatInterfaceLoad()
      await chatInterfacePage.wait(2000)

      for (let i = 0; i < IMPROVEMENT_STORY_CHAT_CONVERSATION_KN.length; i++) {
        await chatInterfacePage.sendMessage(IMPROVEMENT_STORY_CHAT_CONVERSATION_KN[i])
        await chatInterfacePage.wait(10000)
        if (i != IMPROVEMENT_STORY_CHAT_CONVERSATION_KN.length - 1) {
          await chatInterfacePage.waitForChatContainerCount(2 * i + 3, 20000)
        }
      }
    })

    await test.step("Upload image, remove and again upload", async () => {
      await chatInterfacePage.waitForUploadImageInput()
      await chatInterfacePage.uploadImage("sample_image.png")
      await chatInterfacePage.waitForUploadImageInput()
      await chatInterfacePage.waitForUploadedImage()
      await chatInterfacePage.removeUploadedImage()
      await chatInterfacePage.wait(5000)
      const imageCount = await chatInterfacePage.getImageCount()
      expect(imageCount).toBe(0)
    })

    await test.step("Edit story", async () => {
      await chatInterfacePage.waitForReportButton()
      await chatInterfacePage.openEditor()
      await chatInterfacePage.waitForEditorSaveButton()
      await chatInterfacePage.saveEditor()
      await chatInterfacePage.waitForReportButton()
    })

    await test.step("Download report", async () => {
      await chatInterfacePage.waitForReportButton()
      await chatInterfacePage.downloadReport("improvement-story-happy-flow.pdf")
      await chatInterfacePage.waitForReportButton()
    })
  })

  test("should complete full flow with story generation and download using SSO", async () => {
    await test.step("Redirect to Home Page from SSO Route", async () => {})
  })
})
