import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Demo user data for testing without backend
const DEMO_USERS = {
    'parent@demo.com': {
        id: 'user_parent_1',
        email: 'parent@demo.com',
        password: 'demo1234',
        name: '부모님',
        role: 'parent',
        familyId: 'family_demo_1',
        color: '#FF6B6B'
    },
    'child1@demo.com': {
        id: 'user_child_1',
        email: 'child1@demo.com',
        password: 'demo1234',
        name: '지윤',
        role: 'child',
        familyId: 'family_demo_1',
        color: '#4ECDC4'
    },
    'child2@demo.com': {
        id: 'user_child_2',
        email: 'child2@demo.com',
        password: 'demo1234',
        name: '민준',
        role: 'child',
        familyId: 'family_demo_1',
        color: '#A18CD1'
    }
}

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            // Check if user is authenticated
            isAuthenticated: () => !!get().user,

            // Login
            login: async (email, password) => {
                set({ isLoading: true, error: null })

                try {
                    // Simulate API call delay
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // Demo login (replace with actual API call)
                    const user = DEMO_USERS[email]
                    if (user && user.password === password) {
                        const { password: _, ...userWithoutPassword } = user
                        set({
                            user: userWithoutPassword,
                            token: 'demo_token_' + Date.now(),
                            isLoading: false
                        })
                        return { success: true }
                    } else {
                        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
                    }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Signup
            signup: async (data) => {
                set({ isLoading: true, error: null })

                try {
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // Demo signup - in production, this would call the API
                    if (DEMO_USERS[data.email]) {
                        throw new Error('이미 가입된 이메일입니다.')
                    }

                    const newUser = {
                        id: 'user_' + Date.now(),
                        email: data.email,
                        name: data.name,
                        role: data.role,
                        familyId: data.role === 'parent' ? 'family_' + Date.now() : null,
                        color: data.role === 'parent' ? '#FF6B6B' : '#4ECDC4'
                    }

                    set({
                        user: newUser,
                        token: 'demo_token_' + Date.now(),
                        isLoading: false
                    })
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Logout
            logout: () => {
                set({ user: null, token: null, error: null })
            },

            // Update user profile
            updateProfile: async (data) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        user: { ...state.user, ...data },
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Clear error
            clearError: () => set({ error: null })
        }),
        {
            name: 'iharu-auth',
            partialize: (state) => ({ user: state.user, token: state.token })
        }
    )
)
