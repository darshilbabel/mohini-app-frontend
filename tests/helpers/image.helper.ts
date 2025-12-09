import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';

/**
 * ImageHelper provides utilities for image upload, validation, and management in tests
 */
export class ImageHelper {
  private page: Page;

  /**
   * Constructor for ImageHelper
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify that an image file exists and is valid
   * @param imagePath - Path to the image file
   * @returns True if file exists and is readable
   */
  verifyImageExists(imagePath: string): boolean {
    try {
      const absolutePath = path.isAbsolute(imagePath) 
        ? imagePath 
        : path.resolve(process.cwd(), imagePath);
      
      return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Get image file size in bytes
   * @param imagePath - Path to the image file
   * @returns File size in bytes
   */
  getImageSize(imagePath: string): number {
    const absolutePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.resolve(process.cwd(), imagePath);
    
    const stats = fs.statSync(absolutePath);
    return stats.size;
  }

  /**
   * Get image file size in human-readable format
   * @param imagePath - Path to the image file
   * @returns File size as string (e.g., "2.5 MB")
   */
  getImageSizeFormatted(imagePath: string): string {
    const bytes = this.getImageSize(imagePath);
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Verify image file extension
   * @param imagePath - Path to the image file
   * @param allowedExtensions - Array of allowed extensions (default: common image formats)
   * @returns True if extension is allowed
   */
  verifyImageExtension(
    imagePath: string,
    allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  ): boolean {
    const ext = path.extname(imagePath).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * Create a sample test image (simple PNG)
   * This is useful for generating test fixtures on the fly
   * @param outputPath - Path where to save the image
   * @param width - Image width in pixels
   * @param height - Image height in pixels
   */
  async createSampleImage(outputPath: string, width: number = 100, height: number = 100): Promise<void> {
    // Use Playwright's page to generate a simple image via canvas
    const dataUrl = await this.page.evaluate(({ w, h }) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create a gradient
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(1, '#4ECDC4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Add some text
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Image', w / 2, h / 2);
      }
      
      return canvas.toDataURL('image/png');
    }, { w: width, h: height });

    // Convert data URL to buffer and save
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Verify that an image was successfully uploaded by checking the DOM
   * @param expectedCount - Expected number of images
   * @param selector - CSS selector for uploaded images
   * @returns True if the expected number of images are present
   */
  async verifyImageUploadedInDOM(expectedCount: number, selector: string = '[data-testid="uploaded-image"]'): Promise<boolean> {
    const count = await this.page.locator(selector).count();
    return count === expectedCount;
  }

  /**
   * Wait for an image to finish loading
   * @param selector - CSS selector for the image
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForImageLoad(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (sel) => {
        const img = document.querySelector(sel) as HTMLImageElement;
        return img && img.complete && img.naturalHeight > 0;
      },
      selector,
      { timeout }
    );
  }

  /**
   * Get image dimensions from the DOM
   * @param selector - CSS selector for the image
   * @returns Object with width and height
   */
  async getImageDimensions(selector: string): Promise<{ width: number; height: number }> {
    return await this.page.evaluate((sel) => {
      const img = document.querySelector(sel) as HTMLImageElement;
      return {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
    }, selector);
  }

  /**
   * Verify image source attribute
   * @param selector - CSS selector for the image
   * @returns Image src attribute value
   */
  async getImageSource(selector: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute('src');
  }

  /**
   * Check if image source is a valid data URL or HTTP URL
   * @param src - Image source attribute
   * @returns True if source appears valid
   */
  isValidImageSource(src: string | null): boolean {
    if (!src) return false;
    
    return src.startsWith('data:image/') || 
           src.startsWith('http://') || 
           src.startsWith('https://') ||
           src.startsWith('blob:');
  }

  /**
   * Verify all uploaded images have valid sources
   * @param selector - CSS selector for uploaded images
   * @returns True if all images have valid sources
   */
  async verifyAllImagesHaveValidSources(selector: string = '[data-testid="uploaded-image"]'): Promise<boolean> {
    const images = await this.page.locator(selector).all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (!this.isValidImageSource(src)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get test image path from fixtures
   * @param filename - Name of the test image file
   * @returns Absolute path to the test image
   */
  getTestImagePath(filename: string): string {
    return path.resolve(process.cwd(), 'tests', 'fixtures', 'images', filename);
  }

  /**
   * Get multiple test image paths
   * @param filenames - Array of test image filenames
   * @returns Array of absolute paths
   */
  getTestImagePaths(filenames: string[]): string[] {
    return filenames.map(filename => this.getTestImagePath(filename));
  }

  /**
   * Clean up downloaded files
   * @param downloadDir - Directory containing downloads
   */
  cleanupDownloads(downloadDir: string = 'downloads'): void {
    const dir = path.resolve(process.cwd(), downloadDir);
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }

  /**
   * Verify a file was downloaded
   * @param downloadDir - Directory containing downloads
   * @param filename - Expected filename (can be partial)
   * @returns True if file exists
   */
  verifyFileDownloaded(downloadDir: string = 'downloads', filename?: string): boolean {
    const dir = path.resolve(process.cwd(), downloadDir);
    
    if (!fs.existsSync(dir)) {
      return false;
    }
    
    const files = fs.readdirSync(dir);
    
    if (!filename) {
      return files.length > 0;
    }
    
    return files.some(file => file.includes(filename));
  }
}

