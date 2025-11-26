import { Page } from '@playwright/test';

/**
 * Story metadata interface
 */
export interface StoryMetadata {
  title: string | null;
  content: string | null;
  wordCount: number;
  hasImages: boolean;
  imageCount: number;
  createdAt?: string;
}

/**
 * StoryHelper provides utilities for story validation and manipulation
 */
export class StoryHelper {
  private page: Page;

  /**
   * Constructor for StoryHelper
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get comprehensive story metadata
   * @param titleSelector - CSS selector for story title
   * @param contentSelector - CSS selector for story content
   * @param imageSelector - CSS selector for uploaded images
   * @returns Story metadata object
   */
  async getStoryMetadata(
    titleSelector: string = '[data-testid="story-title"]',
    contentSelector: string = '[data-testid="story-content"]',
    imageSelector: string = '[data-testid="uploaded-image"]'
  ): Promise<StoryMetadata> {
    const title = await this.page.locator(titleSelector).textContent();
    const content = await this.page.locator(contentSelector).textContent();
    const imageCount = await this.page.locator(imageSelector).count();
    
    const wordCount = content ? this.countWords(content) : 0;
    
    return {
      title,
      content,
      wordCount,
      hasImages: imageCount > 0,
      imageCount,
    };
  }

  /**
   * Count words in text
   * @param text - Text to count words in
   * @returns Number of words
   */
  countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count characters in text
   * @param text - Text to count characters in
   * @param includeSpaces - Whether to include spaces in count
   * @returns Number of characters
   */
  countCharacters(text: string, includeSpaces: boolean = true): number {
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  }

  /**
   * Verify story has minimum content
   * @param content - Story content text
   * @param minWords - Minimum number of words required
   * @returns True if content meets minimum requirement
   */
  verifyMinimumContent(content: string | null, minWords: number = 10): boolean {
    if (!content) return false;
    return this.countWords(content) >= minWords;
  }

  /**
   * Verify story title is present and valid
   * @param title - Story title
   * @param minLength - Minimum title length
   * @returns True if title is valid
   */
  verifyTitle(title: string | null, minLength: number = 3): boolean {
    if (!title) return false;
    return title.trim().length >= minLength;
  }

  /**
   * Check if story content contains specific keywords
   * @param content - Story content
   * @param keywords - Array of keywords to search for
   * @param requireAll - Whether all keywords must be present (default: at least one)
   * @returns True if keywords are found according to requirements
   */
  containsKeywords(content: string | null, keywords: string[], requireAll: boolean = false): boolean {
    if (!content) return false;
    
    const lowerContent = content.toLowerCase();
    
    if (requireAll) {
      return keywords.every(keyword => lowerContent.includes(keyword.toLowerCase()));
    } else {
      return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
    }
  }

  /**
   * Extract sentences from story content
   * @param content - Story content
   * @returns Array of sentences
   */
  extractSentences(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Get reading time estimate in minutes
   * @param content - Story content
   * @param wordsPerMinute - Average reading speed (default: 200 WPM)
   * @returns Estimated reading time in minutes
   */
  getReadingTime(content: string, wordsPerMinute: number = 200): number {
    const wordCount = this.countWords(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Verify story structure is valid (has both title and content)
   * @param titleSelector - CSS selector for story title
   * @param contentSelector - CSS selector for story content
   * @returns True if story structure is valid
   */
  async verifyStoryStructure(
    titleSelector: string = '[data-testid="story-title"]',
    contentSelector: string = '[data-testid="story-content"]'
  ): Promise<boolean> {
    const title = await this.page.locator(titleSelector).textContent();
    const content = await this.page.locator(contentSelector).textContent();
    
    return this.verifyTitle(title) && this.verifyMinimumContent(content);
  }

  /**
   * Wait for story generation to complete
   * @param contentSelector - CSS selector for story content
   * @param minWords - Minimum word count to consider story complete
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForStoryGeneration(
    contentSelector: string = '[data-testid="story-content"]',
    minWords: number = 10,
    timeout: number = 60000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const content = await this.page.locator(contentSelector).textContent();
      
      if (content && this.verifyMinimumContent(content, minWords)) {
        return;
      }
      
      await this.page.waitForTimeout(1000);
    }
    
    throw new Error('Timeout waiting for story generation');
  }

  /**
   * Compare two story contents for similarity
   * Simple comparison based on word overlap
   * @param content1 - First story content
   * @param content2 - Second story content
   * @returns Similarity score between 0 and 1
   */
  calculateSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Extract potential tags or topics from story content
   * Simple extraction based on word frequency
   * @param content - Story content
   * @param topN - Number of top words to return
   * @returns Array of potential tags
   */
  extractPotentialTags(content: string, topN: number = 5): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }

  /**
   * Verify story format (paragraphs, line breaks, etc.)
   * @param content - Story content
   * @returns Object with format information
   */
  analyzeFormat(content: string): {
    paragraphs: number;
    sentences: number;
    avgWordsPerSentence: number;
    hasLineBreaks: boolean;
  } {
    const sentences = this.extractSentences(content);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const totalWords = this.countWords(content);
    
    return {
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? totalWords / sentences.length : 0,
      hasLineBreaks: content.includes('\n'),
    };
  }

  /**
   * Validate story against quality criteria
   * @param metadata - Story metadata
   * @param criteria - Quality criteria object
   * @returns Validation result with details
   */
  validateStoryQuality(
    metadata: StoryMetadata,
    criteria: {
      minWords?: number;
      maxWords?: number;
      requireTitle?: boolean;
      minTitleLength?: number;
    } = {}
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const {
      minWords = 10,
      maxWords = 10000,
      requireTitle = true,
      minTitleLength = 3,
    } = criteria;
    
    if (requireTitle && !this.verifyTitle(metadata.title, minTitleLength)) {
      errors.push(`Title is missing or too short (min: ${minTitleLength} characters)`);
    }
    
    if (metadata.wordCount < minWords) {
      errors.push(`Content too short: ${metadata.wordCount} words (min: ${minWords})`);
    }
    
    if (metadata.wordCount > maxWords) {
      errors.push(`Content too long: ${metadata.wordCount} words (max: ${maxWords})`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

