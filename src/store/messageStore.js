import { create } from 'zustand'
import { messagesApi } from '../api/client'

// Demo mode flag
const USE_DEMO = false;

// Demo messages
const DEMO_MESSAGES = [
    {
        id: 'msg_1',
        familyId: 'family_demo_1',
        fromUserId: 'user_parent_1',
        fromUserName: '부모님',
        toUserId: null,
        content: '오늘 저녁 7시에 외식해요! 🍕',
        isRead: false,
        createdAt: new Date().toISOString()
    }
];

export const useMessageStore = create((set, get) => ({
    messages: USE_DEMO ? DEMO_MESSAGES : [],
    isLoading: false,
    error: null,

    // Load messages from API
    loadMessages: async () => {
        if (USE_DEMO) return;

        set({ isLoading: true });
        try {
            const response = await messagesApi.getAll();
            set({ messages: response.messages || [], isLoading: false });
        } catch (error) {
            console.error('Load messages error:', error);
            set({ error: error.message, isLoading: false });
        }
    },

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
        set({ isLoading: true });

        try {
            if (USE_DEMO) {
                const newMessage = {
                    id: 'msg_' + Date.now(),
                    ...messageData,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                set(state => ({
                    messages: [newMessage, ...state.messages],
                    isLoading: false
                }));
                return { success: true, message: newMessage };
            }

            const response = await messagesApi.send({
                content: messageData.content,
                toUserId: messageData.toUserId || null
            });

            // Add the new message to local state
            set(state => ({
                messages: [response.message, ...state.messages],
                isLoading: false
            }));

            return { success: true, message: response.message };
        } catch (error) {
            console.error('Send message error:', error);
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Delete message
    deleteMessage: async (messageId) => {
        set({ isLoading: true });
        try {
            if (USE_DEMO) {
                set(state => ({
                    messages: state.messages.filter(m => m.id !== messageId),
                    isLoading: false
                }));
                return { success: true };
            }

            await messagesApi.delete(messageId);
            set(state => ({
                messages: state.messages.filter(m => m.id !== messageId),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            console.error('Delete message error:', error);
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Mark as read (local only for now)
    markAsRead: async (messageId) => {
        set(state => ({
            messages: state.messages.map(m =>
                m.id === messageId ? { ...m, isRead: true } : m
            )
        }));
        return { success: true };
    },

    // Mark all as read (local only for now)
    markAllAsRead: async (userId) => {
        set(state => ({
            messages: state.messages.map(m =>
                (m.toUserId === null || m.toUserId === userId) && m.fromUserId !== userId
                    ? { ...m, isRead: true }
                    : m
            )
        }));
        return { success: true };
    }
}));
