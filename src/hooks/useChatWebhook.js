import { useRef, useState, useCallback, useEffect } from "react"

export const useChatWebhook = (url, options = {}) => {
  const { onOpen, onMessage, onError, onClose, reconnect = true, reconnectInterval = 3000, reconnectAttempts = 5 } = options

  const ws = useRef(null)
  const reconnectCount = useRef(0)
  const reconnectTimeout = useRef(null)

  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (!url) return

    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      return
    }

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = event => {
        setIsConnected(true)
        reconnectCount.current = 0
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
          reconnectTimeout.current = setTimeout(() => {
            reconnectCount.current++
            connect()
          }, reconnectInterval)
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

  const sendMessage = useCallback(message => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === "string" ? message : JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
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
