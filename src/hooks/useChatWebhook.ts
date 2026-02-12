import { useRef, useState, useCallback, useEffect } from "react"

type UseChatWebhookOptions = {
  onFinalReconnectAttempt?: () => unknown
  onOpen?: (event: Event) => unknown
  onMessage?: (event: MessageEvent) => unknown
  onError?: (event: Event) => unknown
  onClose?: (event: CloseEvent) => unknown
  reconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
  autoConnect?: boolean
}

type UseChatWebhookReturn = {
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  sendMessage: (message: string | object) => void
}

export function useChatWebhook(url: string, options: UseChatWebhookOptions = {}): UseChatWebhookReturn {
  const { onFinalReconnectAttempt, onOpen, onMessage, onError, onClose, reconnect = true, reconnectInterval = 3000, reconnectAttempts = 5, autoConnect = true } = options
  const ws = useRef<null | WebSocket>(null)
  const reconnectCount = useRef(1)
  const reconnectTimeout = useRef<null | NodeJS.Timeout>(null)
  const socketQueue = useRef<any[]>([])

  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (!url) return

    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      return
    }

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = event => {
        if (!ws.current) return

        setIsConnected(true)
        if (socketQueue.current.length) {
          socketQueue.current.forEach(message => {
            ;(ws.current as WebSocket).send(typeof message === "string" ? message : JSON.stringify(message))
          })
          socketQueue.current = []
        }
        socketQueue.current = []
        // reconnectCount.current = 0
        if (onOpen) onOpen(event)
      }

      ws.current.onmessage = event => {
        if (onMessage) onMessage(event)
      }

      ws.current.onerror = event => {
        if (onError) onError(event)
      }

      ws.current.onclose = event => {
        setIsConnected(false)
        if (onClose) onClose(event)

        // Reconnect logic
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current = reconnectCount.current + 1
          reconnectTimeout.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (reconnectCount.current >= reconnectAttempts) {
          if (onFinalReconnectAttempt) onFinalReconnectAttempt()
        }
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
    }
  }, [url, onOpen, onMessage, onError, onClose, reconnect, reconnectInterval, reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    if (ws.current) {
      ws.current.close()
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === "string" ? message : JSON.stringify(message))
      return true
    } else if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      socketQueue.current.push(message)
    }
    return false
  }, [])

  useEffect(() => {
    reconnectCount.current = 0
    if (autoConnect) connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
    }
  }, [connect])

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  }
}
