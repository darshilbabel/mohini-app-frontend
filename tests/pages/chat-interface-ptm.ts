import { BasePage } from "./base.page";
import { Locator, Page } from "@playwright/test";

export class ChatInterfacePtm extends BasePage {

  private readonly messageInput: Locator;
  private readonly introMessage: Locator;
  private readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators - these should be updated based on actual application selectors
    this.messageInput = page.locator('textarea#textBoxID.input-2.input-1');
    this.introMessage = page.locator("ul.div11.pb-6")
    this.confirmButton = page.locator('.swal2-confirm.swal2-styled');
  }

  async waitForPtmChatInterfaceLoad(): Promise<void> {
    await this.waitForElement(this.introMessage);
    await this.waitForElement(this.messageInput);
    await this.waitForPageLoad();
  }

  async clickConfirmButton(): Promise<void> {
    await this.waitForElement(this.confirmButton);
    await this.clickElement(this.confirmButton);
  }
}