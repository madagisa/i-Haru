import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/client'

// Demo mode flag - set to false when D1 is connected
const USE_DEMO = false;

// Demo users for offline testing
const demoUsers = {
    'parent@demo.com': {
        id: 'demo_parent',
        email: 'parent@demo.com',
        password: 'demo1234',
        name: '김부모',
        role: 'parent',
        familyId: 'demo_family',
        color: '#FF6B6B'
    },
    'child1@demo.com': {
        id: 'demo_child1',
        email: 'child1@demo.com',
        password: 'demo1234',
        name: '지윤',
        role: 'child',
        familyId: 'demo_family',
        color: '#4ECDC4'
    },
    'child2@demo.com': {
        id: 'demo_child2',
        email: 'child2@demo.com',
        password: 'demo1234',
        name: '민준',
        role: 'child',
        familyId: 'demo_family',
        color: '#A18CD1'
    }
};

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });

                try {
                    if (USE_DEMO) {
                        // Demo mode login
                        const demoUser = demoUsers[email];
                        if (demoUser && demoUser.password === password) {
                            const { password: _, ...userData } = demoUser;
                            set({
                                user: userData,
                                token: 'demo_token_' + Date.now(),
                                isAuthenticated: true,
                                isLoading: false
                            });
                            return { success: true };
                        } else {
                            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
                        }
                    }

                    // API login
                    const response = await authApi.login(email, password);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return { success: true };
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            signup: async (userData) => {
                set({ isLoading: true, error: null });

                try {
                    if (USE_DEMO) {
                        // Demo mode - just simulate success
                        const newUser = {
                            id: 'new_user_' + Date.now(),
                            email: userData.email,
                            name: userData.name,
                            role: userData.role,
                            familyId: userData.role === 'parent' ? 'new_family_' + Date.now() : null,
                            color: userData.role === 'parent' ? '#FF6B6B' : '#4ECDC4'
                        };
                        set({
                            user: newUser,
                            token: 'demo_token_' + Date.now(),
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return { success: true };
                    }

                    const response = await authApi.signup(userData);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return { success: true };
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                if (USE_DEMO) {
                    // Demo mode - trust local state
                    return;
                }

                try {
                    const response = await authApi.me();
                    set({ user: response.user, isAuthenticated: true });
                } catch {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            updateProfile: async (updates) => {
                set(state => ({
                    user: { ...state.user, ...updates }
                }));
                return { success: true };
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'iharu-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);
