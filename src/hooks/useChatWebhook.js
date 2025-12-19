import { API_ENDPOINTS } from "../constants/urls"
import { getFlowInfoApi } from "api/endpoints"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState, useCallback, useEffect } from "react"
import useUrlFlow from "./useUrlFlow"
import env from "../utils/env"

export const useChatWebhook = (options = {}) => {
  const { flow: storageFlow } = useUrlFlow()
  const { onFinalReconnectAttempt, onOpen, onMessage, onError, onClose, reconnect = true, reconnectInterval = 3000, reconnectAttempts = 5, autoConnect = true } = options

  const ws = useRef(null)
  const reconnectCount = useRef(1)
  const reconnectTimeout = useRef(null)
  const socketQueue = useRef([])

  const [isConnected, setIsConnected] = useState(false)

  const { data: flowInfo } = useQuery({
    queryKey: [API_ENDPOINTS.FLOW_CONNECTION_INFO, storageFlow],
    queryFn: () => getFlowInfoApi(storageFlow),
    // staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const url = useMemo(() => {
    return `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}/${flowInfo?.websocket_url ? flowInfo.websocket_url : ""}`
  }, [flowInfo])

  const connect = useCallback(() => {
    if (!url) return

    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      return
    }

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = event => {
        setIsConnected(true)
        if (socketQueue.current.length) {
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

  const sendMessage = useCallback(message => {
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
