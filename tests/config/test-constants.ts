/**
 * Test constants and configuration values
 * Centralized location for all test-related constants
 */

/**
 * Timeout values in milliseconds
 */
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  WEBSOCKET_CONNECTION: 10000,
  WEBSOCKET_MESSAGE: 30000,
  STORY_GENERATION: 60000,
  IMAGE_UPLOAD: 20000,
  PAGE_LOAD: 30000,
  DOWNLOAD: 30000,
} as const;

/**
 * Default test data values
 */
export const DEFAULT_VALUES = {
  LANGUAGE: 'English',
  FLOW_INDEX: 0, // Default to first flow
  WAIT_BETWEEN_MESSAGES: 1000,
  TYPING_DELAY: 100,
} as const;

/**
 * Selector constants for common elements
 * These should be updated based on actual application
 */
export const SELECTORS = {
  // Flow Selection
  FLOW_SELECTION_CONTAINER: '[data-testid="flow-selection-container"]',
  FLOW_CARD: '[data-testid="flow-card"]',
  
  // Language Selection
  LANGUAGE_SELECTION_CONTAINER: '[data-testid="language-selection-container"]',
  LANGUAGE_OPTION: '[data-testid="language-option"]',
  
  // Chat Interface
  CHAT_CONTAINER: '[data-testid="chat-container"]',
  MESSAGE_INPUT: '[data-testid="message-input"]',
  SEND_BUTTON: '[data-testid="send-button"]',
  CHAT_MESSAGE: '[data-testid="chat-message"]',
  USER_MESSAGE: '[data-testid="user-message"]',
  BOT_MESSAGE: '[data-testid="bot-message"]',
  LOADING_INDICATOR: '[data-testid="loading-indicator"]',
  CHAT_COMPLETE: '[data-testid="chat-complete"]',
  VIEW_STORY_BUTTON: '[data-testid="view-story-button"]',
  
  // Story View
  STORY_CONTAINER: '[data-testid="story-container"]',
  STORY_TITLE: '[data-testid="story-title"]',
  STORY_CONTENT: '[data-testid="story-content"]',
  IMAGE_UPLOAD_BUTTON: '[data-testid="image-upload-button"]',
  UPLOADED_IMAGE: '[data-testid="uploaded-image"]',
  REMOVE_IMAGE_BUTTON: '[data-testid="remove-image-button"]',
  DOWNLOAD_BUTTON: '[data-testid="download-story-button"]',
  
  // Common
  CONTINUE_BUTTON: '[data-testid="continue-button"]',
  BACK_BUTTON: '[data-testid="back-button"]',
} as const;

/**
 * File paths for test fixtures
 */
export const FIXTURE_PATHS = {
  IMAGES_DIR: 'tests/fixtures/images',
  TEST_IMAGE_1: 'tests/fixtures/images/test-image-1.png',
  TEST_IMAGE_2: 'tests/fixtures/images/test-image-2.png',
  TEST_IMAGE_3: 'tests/fixtures/images/test-image-3.png',
  DOWNLOADS_DIR: 'downloads',
} as const;

/**
 * Image validation constants
 */
export const IMAGE_VALIDATION = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  MIN_DIMENSION: 50,
  MAX_DIMENSION: 4096,
} as const;

/**
 * Story validation constants
 */
export const STORY_VALIDATION = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_WORDS: 10,
  MAX_CONTENT_WORDS: 10000,
  MIN_CONTENT_CHARACTERS: 50,
} as const;

/**
 * WebSocket related constants
 */
export const WEBSOCKET = {
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 2000,
  MESSAGE_RETRY_ATTEMPTS: 3,
  MESSAGE_RETRY_DELAY: 1000,
} as const;

/**
 * Test user data samples
 */
export const TEST_USERS = {
  DEFAULT: {
    name: 'Test User',
    email: 'test@example.com',
    age: '25',
  },
  ALTERNATIVE: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: '30',
  },
} as const;

/**
 * Sample chat responses for different flows
 * These should be updated based on actual flow requirements
 */
export const SAMPLE_RESPONSES = {
  GREETING: ['Hello', 'Hi', 'Hey'],
  YES: ['Yes', 'yeah', 'sure', 'okay'],
  NO: ['No', 'nope', 'not really'],
  COMPLETE: ['done', 'finished', 'complete', 'that\'s all'],
  POSITIVE_FEEDBACK: ['Good', 'Great', 'Excellent', 'Perfect'],
  NEGATIVE_FEEDBACK: ['Bad', 'Poor', 'Not good'],
} as const;

/**
 * Browser viewport configurations
 */
export const VIEWPORTS = {
  DESKTOP: {
    width: 1920,
    height: 1080,
  },
  LAPTOP: {
    width: 1366,
    height: 768,
  },
  TABLET: {
    width: 768,
    height: 1024,
  },
  MOBILE: {
    width: 375,
    height: 667,
  },
} as const;

/**
 * API endpoints (if needed for direct API testing)
 */
export const API_ENDPOINTS = {
  WEBSOCKET: '/ws',
  UPLOAD_IMAGE: '/api/upload',
  DOWNLOAD_STORY: '/api/story/download',
  GET_FLOWS: '/api/flows',
  GET_LANGUAGES: '/api/languages',
} as const;

/**
 * Environment configuration
 */
export const ENV = {
  BASE_URL: process.env.SHIKSHALOKAM_FE_URL || 'http://localhost:3000',
  WEBSOCKET_TIMEOUT: parseInt(process.env.WEBSOCKET_TIMEOUT || '30000'),
  STORY_GENERATION_TIMEOUT: parseInt(process.env.STORY_GENERATION_TIMEOUT || '60000'),
  HEADED: process.env.HEADED === 'true',
  SLOW_MO: process.env.SLOW_MO === 'true' ? 100 : 0,
} as const;

/**
 * Retry configuration for flaky operations
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Screenshot configuration
 */
export const SCREENSHOT_CONFIG = {
  FULL_PAGE: true,
  TYPE: 'png' as const,
  QUALITY: 90,
  PATH: 'screenshots/',
} as const;

/**
 * Video recording configuration
 */
export const VIDEO_CONFIG = {
  SIZE: { width: 1920, height: 1080 },
  PATH: 'videos/',
} as const;

