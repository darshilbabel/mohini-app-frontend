/**
 * Test data fixtures for different flow scenarios
 * This file contains sample test data that can be used across different test cases
 */

/**
 * Flow configuration interface
 */
export interface FlowConfig {
  name: string;
  id?: string;
  language: string;
  conversationFlow: ConversationStep[];
  expectedStoryKeywords?: string[];
  minStoryWords?: number;
}

/**
 * Conversation step interface
 */
export interface ConversationStep {
  userMessage: string;
  expectedBotResponseContains?: string;
  waitForResponse?: boolean;
  delay?: number;
}

/**
 * Image upload test data interface
 */
export interface ImageUploadTestData {
  images: string[];
  description: string;
  expectedCount: number;
}

/**
 * Sample conversation flow for Flow Example 1
 * This is a generic template that should be customized for each actual flow
 */
export const FLOW_EXAMPLE_1: FlowConfig = {
  name: 'Flow Example 1',
  language: 'English',
  conversationFlow: [
    {
      userMessage: 'Hello',
      expectedBotResponseContains: 'welcome',
      waitForResponse: true,
    },
    {
      userMessage: 'My name is John',
      expectedBotResponseContains: 'John',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'I am 25 years old',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'I live in New York',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'Yes, that is correct',
      waitForResponse: true,
      delay: 500,
    },
  ],
  expectedStoryKeywords: ['John', 'New York'],
  minStoryWords: 20,
};

/**
 * Sample conversation flow for Flow Example 2
 */
export const FLOW_EXAMPLE_2: FlowConfig = {
  name: 'Flow Example 2',
  language: 'English',
  conversationFlow: [
    {
      userMessage: 'Hi there',
      waitForResponse: true,
    },
    {
      userMessage: 'Jane Smith',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'I work as a teacher',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'I have 5 years of experience',
      waitForResponse: true,
      delay: 500,
    },
    {
      userMessage: 'Yes, continue',
      waitForResponse: true,
      delay: 500,
    },
  ],
  expectedStoryKeywords: ['Jane', 'teacher'],
  minStoryWords: 20,
};

/**
 * Multi-language test data
 */
export const MULTI_LANGUAGE_FLOWS: Record<string, FlowConfig> = {
  English: {
    name: 'Test Flow',
    language: 'English',
    conversationFlow: [
      { userMessage: 'Hello', waitForResponse: true },
      { userMessage: 'My name is Alice', waitForResponse: true },
      { userMessage: 'I am a software developer', waitForResponse: true },
    ],
    minStoryWords: 15,
  },
  Hindi: {
    name: 'Test Flow',
    language: 'Hindi',
    conversationFlow: [
      { userMessage: 'नमस्ते', waitForResponse: true },
      { userMessage: 'मेरा नाम राज है', waitForResponse: true },
      { userMessage: 'मैं एक इंजीनियर हूँ', waitForResponse: true },
    ],
    minStoryWords: 15,
  },
};

/**
 * Image upload test scenarios
 */
export const IMAGE_UPLOAD_SCENARIOS: Record<string, ImageUploadTestData> = {
  singleImage: {
    images: ['test-image-1.png'],
    description: 'Upload a single image',
    expectedCount: 1,
  },
  multipleImages: {
    images: ['test-image-1.png', 'test-image-2.png', 'test-image-3.png'],
    description: 'Upload multiple images',
    expectedCount: 3,
  },
  twoImages: {
    images: ['test-image-1.png', 'test-image-2.png'],
    description: 'Upload two images',
    expectedCount: 2,
  },
};

/**
 * Image removal test scenarios
 */
export const IMAGE_REMOVAL_SCENARIOS = {
  removeFirst: {
    description: 'Remove the first image',
    action: 'removeFirst' as const,
  },
  removeLast: {
    description: 'Remove the last image',
    action: 'removeLast' as const,
  },
  removeAll: {
    description: 'Remove all images',
    action: 'removeAll' as const,
  },
  removeByIndex: {
    description: 'Remove specific image by index',
    action: 'removeByIndex' as const,
    index: 1,
  },
};

/**
 * Expected story validation criteria
 */
export const STORY_VALIDATION_CRITERIA = {
  default: {
    minWords: 10,
    maxWords: 5000,
    requireTitle: true,
    minTitleLength: 3,
  },
  strict: {
    minWords: 50,
    maxWords: 3000,
    requireTitle: true,
    minTitleLength: 5,
  },
  relaxed: {
    minWords: 5,
    maxWords: 10000,
    requireTitle: false,
    minTitleLength: 1,
  },
};

/**
 * Common user responses for different question types
 */
export const COMMON_RESPONSES = {
  name: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia'],
  age: ['25', '30', '35', '40'],
  occupation: ['Teacher', 'Engineer', 'Doctor', 'Designer'],
  location: ['New York', 'London', 'Tokyo', 'Mumbai'],
  yesNo: {
    yes: ['Yes', 'Yeah', 'Sure', 'Okay', 'Definitely'],
    no: ['No', 'Nope', 'Not really', 'I don\'t think so'],
  },
  greeting: ['Hello', 'Hi', 'Hey', 'Good morning', 'Greetings'],
  completion: ['Done', 'Finished', 'Complete', 'That\'s all', 'No more'],
};

/**
 * Error scenarios for negative testing
 */
export const ERROR_SCENARIOS = {
  emptyMessage: {
    description: 'Send empty message',
    message: '',
    shouldFail: true,
  },
  veryLongMessage: {
    description: 'Send extremely long message',
    message: 'Lorem ipsum '.repeat(1000),
    shouldFail: false, // May or may not fail depending on implementation
  },
  specialCharacters: {
    description: 'Send message with special characters',
    message: '!@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`',
    shouldFail: false,
  },
  sqlInjection: {
    description: 'Attempt SQL injection',
    message: '\' OR 1=1; DROP TABLE users; --',
    shouldFail: false,
  },
  xssAttempt: {
    description: 'Attempt XSS',
    message: '<script>alert("XSS")</script>',
    shouldFail: false,
  },
};

/**
 * Performance test data
 */
export const PERFORMANCE_SCENARIOS = {
  rapidMessages: {
    description: 'Send multiple messages rapidly',
    messages: Array(10).fill('Test message'),
    delayBetween: 100,
  },
  largeImageUpload: {
    description: 'Upload large images',
    // These would need to be created or referenced
    images: ['large-image-1.jpg', 'large-image-2.jpg'],
  },
};

/**
 * Accessibility test data
 */
export const ACCESSIBILITY_SCENARIOS = {
  keyboardNavigation: {
    description: 'Navigate using keyboard only',
    keys: ['Tab', 'Enter', 'ArrowDown', 'ArrowUp'],
  },
  screenReader: {
    description: 'Screen reader compatibility',
    checkAriaLabels: true,
    checkAltText: true,
  },
};

/**
 * Helper function to get flow configuration by name
 * @param flowName - Name of the flow
 * @returns Flow configuration or undefined
 */
export function getFlowConfig(flowName: string): FlowConfig | undefined {
  const flows: Record<string, FlowConfig> = {
    'Flow Example 1': FLOW_EXAMPLE_1,
    'Flow Example 2': FLOW_EXAMPLE_2,
  };
  
  return flows[flowName];
}

/**
 * Helper function to get random response from a list
 * @param responses - Array of possible responses
 * @returns Random response from the array
 */
export function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Helper function to generate random user data
 * @returns Random user data object
 */
export function generateRandomUserData(): Record<string, string> {
  return {
    name: getRandomResponse(COMMON_RESPONSES.name),
    age: getRandomResponse(COMMON_RESPONSES.age),
    occupation: getRandomResponse(COMMON_RESPONSES.occupation),
    location: getRandomResponse(COMMON_RESPONSES.location),
  };
}

export default {
  FLOW_EXAMPLE_1,
  FLOW_EXAMPLE_2,
  MULTI_LANGUAGE_FLOWS,
  IMAGE_UPLOAD_SCENARIOS,
  IMAGE_REMOVAL_SCENARIOS,
  STORY_VALIDATION_CRITERIA,
  COMMON_RESPONSES,
  ERROR_SCENARIOS,
  PERFORMANCE_SCENARIOS,
  ACCESSIBILITY_SCENARIOS,
  getFlowConfig,
  getRandomResponse,
  generateRandomUserData,
};
