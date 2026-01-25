import { create } from 'zustand'
import { messagesApi } from '../api/client'

// Demo mode flag
const USE_DEMO = false;

// Helper to get local storage item
const getStoredReadTime = () => {
    return localStorage.getItem('haru-last-read-time') || new Date(0).toISOString();
};

export const useMessageStore = create((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,
    lastReadTime: getStoredReadTime(),

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
    // Logic: Count messages created AFTER lastReadTime
    getUnreadCount: (userId) => {
        const { messages, lastReadTime } = get();
        const lastReadCalls = new Date(lastReadTime).getTime();

        return messages.filter(msg => {
            // My messages are always read
            if (msg.fromUserId === userId) return false;

            // Only count if created AFTER my last read time
            const msgTime = new Date(msg.createdAt).getTime();
            const isNew = msgTime > lastReadCalls;

            // Targeting me or public
            const isRelevant = msg.toUserId === null || msg.toUserId === userId;

            return isNew && isRelevant;
        }).length
    },

    // Get recent messages (for today screen)
    getRecentMessages: (userId, limit = 3) => {
        return get().getMessages(userId).slice(0, limit)
    },

    // Send message
    sendMessage: async (messageData) => {
        set({ isLoading: true });

        try {
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

    // Mark as read (Update local timestamp)
    markAsRead: async () => {
        const now = new Date().toISOString();
        localStorage.setItem('haru-last-read-time', now);
        set({ lastReadTime: now });
        return { success: true };
    },

    // Mark all as read (Same as markAsRead for timestamp logic)
    markAllAsRead: async (userId) => {
        const now = new Date().toISOString();
        localStorage.setItem('haru-last-read-time', now);
        set({ lastReadTime: now });
        return { success: true };
    }
}));
