import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import * as path from 'path';

/**
 * StoryViewPage handles interactions with the story view interface
 * including viewing the generated story, uploading images, and downloading the story
 */
export class StoryViewPage extends BasePage {
  // Locators
  private readonly storyContainer: Locator;
  private readonly storyTitle: Locator;
  private readonly storyContent: Locator;
  private readonly imageUploadButton: Locator;
  private readonly imageInput: Locator;
  private readonly uploadedImages: Locator;
  private readonly imageRemoveButtons: Locator;
  private readonly downloadButton: Locator;
  private readonly backToChatButton: Locator;
  private readonly imagePreview: Locator;
  private readonly uploadProgress: Locator;

  /**
   * Constructor for StoryViewPage
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators - these should be updated based on actual application selectors
    this.storyContainer = page.locator('[data-testid="story-container"]');
    this.storyTitle = page.locator('[data-testid="story-title"]');
    this.storyContent = page.locator('[data-testid="story-content"]');
    this.imageUploadButton = page.locator('[data-testid="image-upload-button"]');
    this.imageInput = page.locator('input[type="file"]');
    this.uploadedImages = page.locator('[data-testid="uploaded-image"]');
    this.imageRemoveButtons = page.locator('[data-testid="remove-image-button"]');
    this.downloadButton = page.locator('[data-testid="download-story-button"]');
    this.backToChatButton = page.locator('[data-testid="back-to-chat-button"]');
    this.imagePreview = page.locator('[data-testid="image-preview"]');
    this.uploadProgress = page.locator('[data-testid="upload-progress"]');
  }

  /**
   * Wait for story view page to be fully loaded
   */
  async waitForStoryViewLoad(): Promise<void> {
    await this.waitForElement(this.storyContainer);
    await this.waitForElement(this.storyContent);
    await this.waitForPageLoad();
  }

  /**
   * Check if story view is displayed
   * @returns True if story view is visible
   */
  async isStoryViewDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.storyContainer);
  }

  /**
   * Get the story title
   * @returns Story title text
   */
  async getStoryTitle(): Promise<string | null> {
    return await this.getTextContent(this.storyTitle);
  }

  /**
   * Get the story content
   * @returns Story content text
   */
  async getStoryContent(): Promise<string | null> {
    return await this.getTextContent(this.storyContent);
  }

  /**
   * Check if story has content
   * @returns True if story has content
   */
  async hasStoryContent(): Promise<boolean> {
    const content = await this.getStoryContent();
    return content !== null && content.trim().length > 0;
  }

  /**
   * Upload a single image
   * @param imagePath - Absolute path to the image file
   */
  async uploadImage(imagePath: string): Promise<void> {
    // Resolve the path to absolute if it's relative
    const absolutePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.resolve(process.cwd(), imagePath);
    
    // Set the file input
    await this.imageInput.setInputFiles(absolutePath);
    
    // Wait for upload to complete
    await this.waitForUploadComplete();
  }

  /**
   * Upload multiple images
   * @param imagePaths - Array of absolute paths to image files
   */
  async uploadMultipleImages(imagePaths: string[]): Promise<void> {
    const absolutePaths = imagePaths.map(imagePath =>
      path.isAbsolute(imagePath) ? imagePath : path.resolve(process.cwd(), imagePath)
    );
    
    // Upload images one by one or all at once depending on implementation
    for (const imagePath of absolutePaths) {
      await this.uploadImage(imagePath);
      await this.wait(500); // Brief wait between uploads
    }
  }

  /**
   * Click the image upload button (if file input is hidden)
   */
  async clickUploadButton(): Promise<void> {
    await this.waitForElement(this.imageUploadButton);
    await this.clickElement(this.imageUploadButton);
  }

  /**
   * Wait for image upload to complete
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForUploadComplete(timeout: number = 30000): Promise<void> {
    // Wait for upload progress to appear and disappear
    try {
      await this.waitForElement(this.uploadProgress, 5000);
      await this.waitForElementHidden(this.uploadProgress, timeout);
    } catch {
      // If progress indicator doesn't appear, wait briefly
      await this.wait(1000);
    }
  }

  /**
   * Get the number of uploaded images
   * @returns Number of uploaded images
   */
  async getUploadedImageCount(): Promise<number> {
    return await this.uploadedImages.count();
  }

  /**
   * Check if any images are uploaded
   * @returns True if images are present
   */
  async hasUploadedImages(): Promise<boolean> {
    return await this.getUploadedImageCount() > 0;
  }

  /**
   * Remove an image by its index
   * @param index - Zero-based index of the image to remove
   */
  async removeImageByIndex(index: number): Promise<void> {
    const removeButton = this.imageRemoveButtons.nth(index);
    await this.waitForElement(removeButton);
    await this.clickElement(removeButton);
    
    // Wait for removal animation/update
    await this.wait(500);
  }

  /**
   * Remove all uploaded images
   */
  async removeAllImages(): Promise<void> {
    const imageCount = await this.getUploadedImageCount();
    
    // Remove images from last to first to avoid index shifting issues
    for (let i = imageCount - 1; i >= 0; i--) {
      await this.removeImageByIndex(i);
    }
  }

  /**
   * Remove the first image
   */
  async removeFirstImage(): Promise<void> {
    await this.removeImageByIndex(0);
  }

  /**
   * Remove the last image
   */
  async removeLastImage(): Promise<void> {
    const count = await this.getUploadedImageCount();
    if (count > 0) {
      await this.removeImageByIndex(count - 1);
    }
  }

  /**
   * Check if image preview is visible
   * @param index - Index of the image to check
   * @returns True if preview is visible
   */
  async isImagePreviewVisible(index: number): Promise<boolean> {
    const preview = this.imagePreview.nth(index);
    return await this.isElementVisible(preview);
  }

  /**
   * Click the download story button
   * @returns Promise that resolves when download starts
   */
  async downloadStory(): Promise<void> {
    await this.waitForElement(this.downloadButton);
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    
    await this.clickElement(this.downloadButton);
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Optionally save the download
    const downloadPath = path.join(process.cwd(), 'downloads', await download.suggestedFilename());
    await download.saveAs(downloadPath);
  }

  /**
   * Check if download button is visible
   * @returns True if download button is visible
   */
  async isDownloadButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.downloadButton);
  }

  /**
   * Check if download button is enabled
   * @returns True if enabled, false otherwise
   */
  async isDownloadButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.downloadButton.isDisabled();
    return !isDisabled;
  }

  /**
   * Click back to chat button
   */
  async clickBackToChat(): Promise<void> {
    await this.waitForElement(this.backToChatButton);
    await this.clickElement(this.backToChatButton);
  }

  /**
   * Verify story was generated successfully
   * @returns True if story has title and content
   */
  async verifyStoryGenerated(): Promise<boolean> {
    const hasTitle = (await this.getStoryTitle()) !== null;
    const hasContent = await this.hasStoryContent();
    return hasTitle && hasContent;
  }

  /**
   * Complete image upload workflow (upload multiple images and verify)
   * @param imagePaths - Array of image paths to upload
   * @returns True if all images were uploaded successfully
   */
  async completeImageUpload(imagePaths: string[]): Promise<boolean> {
    const initialCount = await this.getUploadedImageCount();
    await this.uploadMultipleImages(imagePaths);
    const finalCount = await this.getUploadedImageCount();
    return finalCount === initialCount + imagePaths.length;
  }

  /**
   * Get all uploaded image sources
   * @returns Array of image src attributes
   */
  async getUploadedImageSources(): Promise<string[]> {
    const images = await this.uploadedImages.all();
    const sources: string[] = [];
    
    for (const image of images) {
      const src = await image.getAttribute('src');
      if (src) {
        sources.push(src);
      }
    }
    
    return sources;
  }
}

