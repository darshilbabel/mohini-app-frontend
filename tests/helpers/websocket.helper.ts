import { Page } from "@playwright/test"

/**
 * WebSocket message interface
 */
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

/**
 * WebSocketHelper provides utilities for monitoring and validating WebSocket connections
 * This is crucial for testing real-time chat interactions
 */
export class WebSocketHelper {
  private page: Page
  private messages: WebSocketMessage[]
  private isMonitoring: boolean

  /**
   * Constructor for WebSocketHelper
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page
    this.messages = []
    this.isMonitoring = false
  }

  /**
   * Start monitoring WebSocket connections and messages
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.messages = []

    // Inject script to capture WebSocket messages
    await this.page.addInitScript(() => {
      // Store original WebSocket
      const OriginalWebSocket = window.WebSocket

      // Override WebSocket constructor
      ;(window as any).WebSocket = function (url: string, protocols?: string | string[]) {
        const ws = new OriginalWebSocket(url, protocols)

        // Store websocket reference for testing
        ;(window as any).__wsInstance = ws
        ;(window as any).__wsMessages = []

        // Capture sent messages
        const originalSend = ws.send.bind(ws)
        ws.send = function (data: any) {
          ;(window as any).__wsMessages.push({
            type: "sent",
            data: data,
            timestamp: Date.now(),
          })
          return originalSend(data)
        }

        // Capture received messages
        ws.addEventListener("message", event => {
          ;(window as any).__wsMessages.push({
            type: "received",
            data: event.data,
            timestamp: Date.now(),
          })
        })

        return ws
      }
    })
  }

  /**
   * Get all captured WebSocket messages
   * @returns Array of WebSocket messages
   */
  async getMessages(): Promise<WebSocketMessage[]> {
    const messages = await this.page.evaluate(() => {
      return (window as any).__wsMessages || []
    })
    return messages
  }

  /**
   * Get sent messages only
   * @returns Array of sent messages
   */
  async getSentMessages(): Promise<WebSocketMessage[]> {
    const allMessages = await this.getMessages()
    return allMessages.filter(msg => msg.type === "sent")
  }

  /**
   * Get received messages only
   * @returns Array of received messages
   */
  async getReceivedMessages(): Promise<WebSocketMessage[]> {
    const allMessages = await this.getMessages()
    return allMessages.filter(msg => msg.type === "received")
  }

  /**
   * Wait for a WebSocket message matching a condition
   * @param predicate - Function to test each message
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The matching message
   */
  async waitForMessage(predicate: (message: WebSocketMessage) => boolean, timeout: number = 30000): Promise<WebSocketMessage> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages()
      const matchingMessage = messages.find(predicate)

      if (matchingMessage) {
        return matchingMessage
      }

      // Wait before checking again
      await this.page.waitForTimeout(500)
    }

    throw new Error("Timeout waiting for WebSocket message")
  }

  /**
   * Wait for a received message containing specific text
   * @param text - Text to search for in message
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The matching message
   */
  async waitForReceivedMessageContaining(text: string, timeout: number = 30000): Promise<WebSocketMessage> {
    return this.waitForMessage(msg => msg.type === "received" && String(msg.data).includes(text), timeout)
  }

  /**
   * Wait for a specific number of messages to be received
   * @param count - Number of messages to wait for
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForMessageCount(count: number, timeout: number = 30000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages()

      if (messages.length >= count) {
        return
      }

      await this.page.waitForTimeout(500)
    }

    throw new Error(`Timeout waiting for ${count} messages`)
  }

  /**
   * Check if WebSocket connection is open
   * @returns True if connection is open
   */
  async isConnected(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const ws = (window as any).__wsInstance
      return ws && ws.readyState === WebSocket.OPEN
    })
  }

  /**
   * Get WebSocket connection state
   * @returns Connection state (CONNECTING, OPEN, CLOSING, CLOSED)
   */
  async getConnectionState(): Promise<string> {
    const state = await this.page.evaluate(() => {
      const ws = (window as any).__wsInstance
      if (!ws) return "NONE"

      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          return "CONNECTING"
        case WebSocket.OPEN:
          return "OPEN"
        case WebSocket.CLOSING:
          return "CLOSING"
        case WebSocket.CLOSED:
          return "CLOSED"
        default:
          return "UNKNOWN"
      }
    })
    return state
  }

  /**
   * Wait for WebSocket connection to be established
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForConnection(timeout: number = 10000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await this.isConnected()) {
        return
      }
      await this.page.waitForTimeout(500)
    }

    throw new Error("Timeout waiting for WebSocket connection")
  }

  /**
   * Clear all captured messages
   */
  async clearMessages(): Promise<void> {
    await this.page.evaluate(() => {
      ;(window as any).__wsMessages = []
    })
    this.messages = []
  }

  /**
   * Get the last received message
   * @returns Last received message or null if none
   */
  async getLastReceivedMessage(): Promise<WebSocketMessage | null> {
    const receivedMessages = await this.getReceivedMessages()
    return receivedMessages.length > 0 ? receivedMessages[receivedMessages.length - 1] : null
  }

  /**
   * Parse message data as JSON
   * @param message - WebSocket message
   * @returns Parsed JSON object or original data if not JSON
   */
  parseMessageData(message: WebSocketMessage): any {
    try {
      return JSON.parse(message.data)
    } catch {
      return message.data
    }
  }

  /**
   * Stop monitoring WebSocket connections
   */
  stopMonitoring(): void {
    this.isMonitoring = false
  }
}
