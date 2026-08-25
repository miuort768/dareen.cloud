import React, { useRef, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatSidebar } from '../features/chat/components/ChatSidebar'
import { ChatWindow } from '../features/chat/components/ChatWindow'
import { ChatModals } from '../features/chat/components/ChatModals'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useUnreadStore } from '../store/unreadStore'
import { useChatUIStore } from '../store/chatUIStore'
import { useChat, useMessages } from '../hooks/useChat'
import { Image } from '../shared/components/ui'
import { cn } from '../lib/utils'
import { useAcademyName } from '../context/AppContext'

export const Chat = () => {
  const academyName = useAcademyName()
  React.useEffect(() => {
    document.title = `المحادثات | ${academyName} للتعليم والتدريب`
  }, [academyName])
  const currentUser = useAuthStore((s) => s.currentUser)
  const {
    conversations,
    availableUsers,
    sendMessage,
    isSending,
    createDirectChat,
    saveGroup,
    deleteConversation,
    refetchConversations,
    typingUsers,
    setTyping,
    markAsRead,
    deleteAllConversations,
  } = useChat(String(currentUser?.id))

  const selectedConv = useChatUIStore((s) => s.selectedConv)
  const setSelectedConv = useChatUIStore((s) => s.setSelectedConv)
  const newMessage = useChatUIStore((s) => s.newMessage)
  const setNewMessage = useChatUIStore((s) => s.setNewMessage)
  const isEditingGroup = useChatUIStore((s) => s.isEditingGroup)
  const setIsEditingGroup = useChatUIStore((s) => s.setIsEditingGroup)
  const setIsCreatingGroup = useChatUIStore((s) => s.setIsCreatingGroup)
  const setShowNewChatModal = useChatUIStore((s) => s.setShowNewChatModal)
  const groupName = useChatUIStore((s) => s.groupName)
  const setGroupName = useChatUIStore((s) => s.setGroupName)
  const selectedUsers = useChatUIStore((s) => s.selectedUsers)
  const setSelectedUsers = useChatUIStore((s) => s.setSelectedUsers)
  const setSearchUser = useChatUIStore((s) => s.setSearchUser)
  const setShowDeleteConfirm = useChatUIStore((s) => s.setShowDeleteConfirm)
  const setIsDeleting = useChatUIStore((s) => s.setIsDeleting)
  const deleteType = useChatUIStore((s) => s.deleteType)
  const setDeleteType = useChatUIStore((s) => s.setDeleteType)
  const itemToDelete = useChatUIStore((s) => s.itemToDelete)
  const setItemToDelete = useChatUIStore((s) => s.setItemToDelete)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId)
  const isConnected = useChatStore((s) => s.isConnected)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  React.useEffect(() => {
    const id = selectedConv?.id || null
    setActiveConversationId(id)
    useUnreadStore.getState().setActiveConversationId(id)
  }, [selectedConv, setActiveConversationId])

  const openGroupSettings = () => {
    if (!selectedConv || !selectedConv.isGroup || currentUser?.role !== 'admin') return
    setGroupName(selectedConv.displayName || '')
    setSelectedUsers(selectedConv.members || [])
    setIsEditingGroup(true)
    setIsCreatingGroup(true)
    setShowNewChatModal(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || !selectedConv || !currentUser) return

    sendMessage({
      conversationId: selectedConv.id,
      senderId: String(currentUser.id),
      senderName: currentUser.name,
      content,
    })
    setNewMessage('')
  }

  const handleCreateConversation = async () => {
    try {
      setIsSubmitting(true)
      await saveGroup({
        id: isEditingGroup ? selectedConv?.id : undefined,
        name: groupName,
        members: selectedUsers,
        isGroup: true,
      })
      setShowNewChatModal(false)
      setGroupName('')
      setSelectedUsers([])
      setIsCreatingGroup(false)
      setIsEditingGroup(false)
      refetchConversations()
    } catch (err) {
      console.error('Failed to save group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDirectChat = useCallback(
    async (targetUserId: string) => {
      try {
        const newConv = await createDirectChat(targetUserId)
        setSelectedConv(newConv)
        setShowNewChatModal(false)
        setSearchUser('')
      } catch (err) {
        console.error('Failed to create direct chat:', err)
      }
    },
    [createDirectChat, setSelectedConv, setShowNewChatModal, setSearchUser],
  )

  React.useEffect(() => {
    const targetUserId = location.state?.startChatWith
    if (targetUserId && availableUsers.length > 0) {
      handleCreateDirectChat(targetUserId)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, availableUsers, handleCreateDirectChat])

  const handleDeleteAllClick = () => {
    setDeleteType('all_conversations')
    setItemToDelete({ displayName: 'جميع المحادثات' })
    setShowDeleteConfirm(true)
  }

  const handleDeleteAction = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      if (
        deleteType === 'conversation' &&
        itemToDelete &&
        'id' in itemToDelete &&
        itemToDelete.id
      ) {
        await deleteConversation(itemToDelete.id)
        if (selectedConv?.id === itemToDelete.id) setSelectedConv(null)
      } else if (deleteType === 'all_conversations') {
        await deleteAllConversations()
        setSelectedConv(null)
      }
      setShowDeleteConfirm(false)
      setItemToDelete(null)
      refetchConversations()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError: isMessagesError,
  } = useMessages(selectedConv?.id)

  return (
    <div
      dir="rtl"
      style={{ paddingTop: 'var(--safe-area-top, 0px)' }}
      className={cn(
        'flex flex-col overflow-hidden bg-card',
        'fixed inset-x-0 top-0 z-10 transition-all duration-300 lg:relative lg:inset-auto lg:bottom-auto lg:h-screen lg:w-full',
        selectedConv ? 'bottom-0' : 'bottom-[max(76px,calc(64px+env(safe-area-inset-bottom)))]',
      )}
    >
      <div className="relative hidden shrink-0 flex-row items-center justify-between gap-4 overflow-hidden border-b border-border bg-background px-4 py-6 md:px-8 lg:flex">
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-success-soft bg-surface">
            <Image
              src="/chat-avatar.webp"
              alt="الشعار"
              className="h-full w-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/chat-avatar.jpg'
              }}
            />
          </div>
          <div>
            <div className="flex flex-col">
              <h1 className="text-lg font-medium uppercase tracking-tighter text-main md:text-2xl">
                {selectedConv ? `محادثات - ${selectedConv.displayName}` : 'محادثات'}
              </h1>
              <p className="mt-0.5 text-xs font-light uppercase tracking-widest text-muted md:text-sm">
                تواصل آمن ومباشر
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-0 w-full flex-1">
        <ChatSidebar
          conversations={conversations}
          selectedConv={selectedConv}
          currentUser={currentUser}
          onDeleteAll={handleDeleteAllClick}
          typingUsers={typingUsers}
        />

        {selectedConv ? (
          <ChatWindow
            selectedConv={selectedConv}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isMessagesError={isMessagesError}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            currentUser={currentUser}
            openGroupSettings={openGroupSettings}
            menuRef={menuRef}
            setTyping={setTyping}
            markAsRead={markAsRead}
          />
        ) : (
          <div className="relative hidden flex-1 flex-col items-center justify-center border-s border-border bg-background lg:flex">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            />

            <div className="z-10 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
                <Image
                  src="/logo.png"
                  alt={academyName}
                  className="h-12 w-12"
                  imgClassName="object-contain"
                />
              </div>
              <h2 className="mb-3 text-3xl font-medium uppercase tracking-tighter text-main">
                واتساب {academyName} للكمبيوتر
              </h2>
              <div className="mb-6 flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 bg-primary/30"></span>
                <p className="text-micro font-medium uppercase tracking-label text-primary">
                  تواصل آمن • مشفر
                </p>
                <span className="h-[1px] w-8 bg-primary/30"></span>
              </div>
              <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-muted">
                أرسل واستقبل الرسائل على التابلت والكمبيوتر بتجربة متكاملة.
              </p>
            </div>

            <div className="absolute bottom-10 flex items-center gap-2 text-muted">
              <div
                className={cn(
                  'h-1.5 w-1.5 animate-pulse rounded-full',
                  isConnected ? 'bg-success shadow-[0_0_6px_var(--bg-success)]' : 'bg-error',
                )}
              ></div>
              <span className="text-micro font-medium uppercase tracking-widest">
                {isConnected ? 'النظام متصل وآمن' : 'غير متصل'}
              </span>
            </div>
          </div>
        )}
      </div>

      <ChatModals
        availableUsers={availableUsers}
        handleCreateConversation={handleCreateConversation}
        handleCreateDirectChat={handleCreateDirectChat}
        handleDeleteAction={handleDeleteAction}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
