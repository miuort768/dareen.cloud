import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketService } from '../lib/socket'
import { SOCKET_EVENTS, type NewMessagePayload, type TypingPayload } from '../lib/socket-events'
import { useCurrentUser, useIsAuthenticated } from '../context/AppContext'
import { useChatStore } from '../store/chatStore'

interface ChatConversation {
  id: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  [key: string]: unknown
}

export const useChatSocketInit = () => {
  const isAuthenticated = useIsAuthenticated()
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const setIsConnected = useChatStore((s) => s.setIsConnected)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const activeConvRef = useRef(activeConversationId)

  useEffect(() => {
    activeConvRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return
    const currentUserId = String(currentUser.id)

    const socket = socketService.connect()
    if (!socket) return

    if (!audioRef.current) {
      try {
        audioRef.current = new Audio('/notification.wav')
        audioRef.current.volume = 0.45
      } catch (e) {
        console.error('Audio initialization failed', e)
      }
    }
    const audio = audioRef.current

    const playNotificationSound = () => {
      if (audio) {
        audio.currentTime = 0
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => console.warn('Autoplay prevented:', error))
        }
      }
    }

    const sendNativeNotification = (title: string, options?: NotificationOptions) => {
      if (!('Notification' in window)) return
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, options)
        } catch (e) {
          console.warn('Native notification failed', e)
        }
      }
    }

    const handleTyping = (data: TypingPayload) => {
      useChatStore
        .getState()
        .setTypingUsers(
          useChatStore
            .getState()
            .typingUsers.filter(
              (t) => t.conversationId !== data.conversationId || t.userName !== data.userName,
            ),
        )

      if (data.isTyping) {
        useChatStore
          .getState()
          .setTypingUsers([
            ...useChatStore.getState().typingUsers,
            { conversationId: data.conversationId, userName: data.userName },
          ])

        if (typingTimeoutsRef.current[data.userId]) {
          clearTimeout(typingTimeoutsRef.current[data.userId])
        }

        typingTimeoutsRef.current[data.userId] = setTimeout(() => {
          useChatStore
            .getState()
            .setTypingUsers(
              useChatStore
                .getState()
                .typingUsers.filter(
                  (t) => t.conversationId !== data.conversationId || t.userName !== data.userName,
                ),
            )
        }, 3000)
      }
    }

    const handleNewMessage = (message: NewMessagePayload) => {
      queryClient.setQueryData(['messages', message.conversationId], (old: unknown) => {
        const msgs = (Array.isArray(old) ? old : []) as NewMessagePayload[]
        if (msgs.find((m: NewMessagePayload) => m.id === message.id)) return msgs
        return [...msgs, message]
      })

      queryClient.setQueryData(['conversations', currentUserId], (old: unknown) => {
        const conversations = (Array.isArray(old) ? old : []) as ChatConversation[]
        const updated = conversations.map((conv: ChatConversation) => {
          if (conv.id === message.conversationId) {
            const isCurrentlyActive = activeConvRef.current === message.conversationId
            const isFromOthers = String(message.senderId) !== currentUserId
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: isCurrentlyActive
                ? 0
                : isFromOthers
                  ? (conv.unreadCount || 0) + 1
                  : conv.unreadCount,
            }
          }
          return conv
        })

        return [...updated].sort((a: ChatConversation, b: ChatConversation) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime()
          const timeB = new Date(b.lastMessageTime || 0).getTime()
          return timeB - timeA
        })
      })

      const isCurrentlyActive = activeConvRef.current === message.conversationId
      const isFromOthers = String(message.senderId) !== currentUserId

      if (isFromOthers) {
        if (!isCurrentlyActive || document.visibilityState === 'hidden') {
          playNotificationSound()
          sendNativeNotification(`رسالة جديدة من ${message.senderName}`, {
            body: message.content,
            tag: message.conversationId,
            renotify: true,
          } as NotificationOptions & { renotify: boolean })
        }
      }
    }

    const handleNewConversation = (conv: ChatConversation) => {
      queryClient.setQueryData(['conversations', currentUserId], (old: unknown) => {
        const conversations = (Array.isArray(old) ? old : []) as ChatConversation[]
        if (conversations.find((c: ChatConversation) => c.id === conv.id)) return conversations
        return [conv, ...conversations]
      })
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] })
    }

    const handleConnect = () => {
      setIsConnected(true)
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] })
      if (activeConvRef.current) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConvRef.current] })
      }
    }
    const handleDisconnect = () => setIsConnected(false)

    setIsConnected(socket.connected)
    socket.on(SOCKET_EVENTS.CONNECT, handleConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage)
    socket.on(SOCKET_EVENTS.TYPING, handleTyping)
    socket.on(SOCKET_EVENTS.NEW_CONVERSATION, handleNewConversation)

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage)
      socket.off(SOCKET_EVENTS.TYPING, handleTyping)
      socket.off(SOCKET_EVENTS.NEW_CONVERSATION, handleNewConversation)

      Object.values(typingTimeoutsRef.current).forEach((timeout) => clearTimeout(timeout))
      typingTimeoutsRef.current = {}
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [isAuthenticated, currentUser, queryClient, setIsConnected])
}
