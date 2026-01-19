import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

// Demo messages
const DEMO_MESSAGES = [
    {
        id: 'msg_1',
        familyId: 'family_demo_1',
        fromUserId: 'user_parent_1',
        fromUserName: '부모님',
        toUserId: null, // null = broadcast to all family
        content: '오늘 저녁 7시에 외식해요! 🍕',
        isRead: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'msg_2',
        familyId: 'family_demo_1',
        fromUserId: 'user_child_1',
        fromUserName: '지윤',
        toUserId: 'user_parent_1',
        content: '학원 끝나고 편의점 가도 돼요?',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
    }
]

export const useMessageStore = create(
    persist(
        (set, get) => ({
            messages: DEMO_MESSAGES,
            isLoading: false,
            error: null,

            // Get messages for current user
            getMessages: (userId) => {
                return get().messages.filter(msg =>
                    msg.toUserId === null ||
                    msg.toUserId === userId ||
                    msg.fromUserId === userId
                ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            },

            // Get unread messages count
            getUnreadCount: (userId) => {
                return get().messages.filter(msg =>
                    !msg.isRead &&
                    msg.fromUserId !== userId &&
                    (msg.toUserId === null || msg.toUserId === userId)
                ).length
            },

            // Get recent messages (for today screen)
            getRecentMessages: (userId, limit = 3) => {
                return get().getMessages(userId).slice(0, limit)
            },

            // Send message
            sendMessage: async (messageData) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    const newMessage = {
                        id: 'msg_' + Date.now(),
                        ...messageData,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    }

                    set(state => ({
                        messages: [newMessage, ...state.messages],
                        isLoading: false
                    }))
                    return { success: true, message: newMessage }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Mark as read
            markAsRead: async (messageId) => {
                set(state => ({
                    messages: state.messages.map(m =>
                        m.id === messageId ? { ...m, isRead: true } : m
                    )
                }))
                return { success: true }
            },

            // Mark all as read
            markAllAsRead: async (userId) => {
                set(state => ({
                    messages: state.messages.map(m =>
                        (m.toUserId === null || m.toUserId === userId) && m.fromUserId !== userId
                            ? { ...m, isRead: true }
                            : m
                    )
                }))
                return { success: true }
            },

            // Delete message
            deleteMessage: async (messageId) => {
                set(state => ({
                    messages: state.messages.filter(m => m.id !== messageId)
                }))
                return { success: true }
            }
        }),
        {
            name: 'iharu-messages',
            partialize: (state) => ({ messages: state.messages })
        }
    )
)
