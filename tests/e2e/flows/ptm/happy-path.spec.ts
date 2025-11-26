// import { test, expect } from '../../../fixtures';
import { test, expect } from '@playwright/test';
import { FlowSelectionPage } from '../../../pages/flow-selection.page';
import { ChatInterfacePage } from '../../../pages/chat-interface.page';
import { SITE_ROUTES } from 'tests/constant/site_routes';
import { ChatInterfacePtm } from 'tests/pages/chat-interface-ptm';
import { PTM_CHAT_CONVERSATION_EN } from 'tests/constant/ptm-chat';

/**
 * Happy Path Test Suite for Flow Example 1
 * Tests the complete user journey from flow selection to story download
 */
test.describe('PTM Flow - Happy Path', () => {
  let flowSelectionPage: FlowSelectionPage;
  let chatInterfacePage: ChatInterfacePage;
  let chatInterfacePtmPage: ChatInterfacePtm;

  /**
   * Setup before each test
   * Initialize page objects and navigate to the application
   */
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();

    // Initialize page objects
    flowSelectionPage = new FlowSelectionPage(page);
    chatInterfacePage = new ChatInterfacePage(page);
    chatInterfacePtmPage = new ChatInterfacePtm(page);

    // Navigate to the application
    await flowSelectionPage.navigateToFlowSelection(SITE_ROUTES.PTM_START)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  /**
   * Test: Complete happy path flow
   * Verifies user can complete entire flow from start to finish
   */
  test('should complete full flow with submission of form and navigated back to home page', async () => {
    // Step 1: Select language
    await test.step('Select language', async () => {
      await flowSelectionPage.navigateToFlowSelection(SITE_ROUTES.PTM_START)
      await flowSelectionPage.waitForLanguageSelectionPageLoad();
      const languageCount = await flowSelectionPage.getLanguageCount();
      expect(languageCount).toBe(2);
      await flowSelectionPage.selectLanguageByIndex(0);
    });

    await test.step('Complete chat conversation', async () => {
      await chatInterfacePtmPage.waitForPtmChatInterfaceLoad();
      await chatInterfacePtmPage.wait(2000);

      for (let i=0; i < PTM_CHAT_CONVERSATION_EN.length; i++) {
        await chatInterfacePage.sendMessage(PTM_CHAT_CONVERSATION_EN[i]);
        await chatInterfacePage.wait(5000)
        if (i != PTM_CHAT_CONVERSATION_EN.length - 1) {
          await chatInterfacePage.waitForChatContainerCount(2*i + 3, 20000);
        }
      }
    });

    await test.step('Click confirm button', async () => {
      await chatInterfacePtmPage.clickConfirmButton();
    });

    await test.step('Navigated back to home page', async () => {
      await chatInterfacePage.wait(5000);
      expect(chatInterfacePage.checkRoute(SITE_ROUTES.PTM_START)).toBeTruthy();
    });
  });
});

