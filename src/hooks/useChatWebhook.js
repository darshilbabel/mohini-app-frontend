import { useRef, useState, useCallback, useEffect } from "react"

export const useChatWebhook = (url, options = {}) => {
  const { onFinalReconnectAttempt, onOpen, onMessage, onError, onClose, reconnect = true, reconnectInterval = 3000, reconnectAttempts = 5, autoConnect = true } = options

  const ws = useRef(null)
  const reconnectCount = useRef(0)
  const reconnectTimeout = useRef(null)
  const socketQueue = useRef([])

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
        if (socketQueue.current.length > 0) {
          socketQueue.current.forEach(message => {
            ws.current.send(typeof message === "string" ? message : JSON.stringify(message))
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
          console.log(reconnectCount.current, "reconnectCount.current")
          reconnectCount.current = reconnectCount.current + 1
          console.log(reconnectCount.current, "reconnectCount.current")
          console.log(reconnectAttempts, "reconnectAttempts")
          reconnectTimeout.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }

        if (reconnectCount.current >= reconnectAttempts) {
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

  const sendMessage = useCallback(message => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === "string" ? message : JSON.stringify(message))
      return true
    } else if (ws.current.readyState == WebSocket.CONNECTING) {
      socketQueue.current.push(message)
    }
    return false
  }, [])

  useEffect(() => {
    reconnectCount.current = 0
    if (autoConnect) connect()

    /**
     * * NOTE: This is for testing purposes only
     */
    // const test_timeout = setInterval(() => {
    //   ws.current.close()
    // }, 20000)

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }

      /**
       * * NOTE: This is for testing purposes only
       */
      // clearInterval(test_timeout)
    }
  }, [connect])

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  }
}
