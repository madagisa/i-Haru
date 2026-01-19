import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Demo family data
const DEMO_FAMILY = {
    id: 'family_demo_1',
    name: '우리 가족',
    inviteCode: 'HARU2026',
    members: [
        { id: 'user_parent_1', name: '부모님', role: 'parent', color: '#FF6B6B' },
        { id: 'user_child_1', name: '지윤', role: 'child', color: '#4ECDC4' },
        { id: 'user_child_2', name: '민준', role: 'child', color: '#A18CD1' }
    ]
}

export const useFamilyStore = create(
    persist(
        (set, get) => ({
            family: null,
            members: [],
            children: [],
            selectedChildId: null, // For parent view: which child to filter (null = all)
            isLoading: false,
            error: null,

            // Load family data
            loadFamily: async (familyId) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    // Demo data (replace with API call)
                    if (familyId === 'family_demo_1') {
                        const children = DEMO_FAMILY.members.filter(m => m.role === 'child')
                        set({
                            family: DEMO_FAMILY,
                            members: DEMO_FAMILY.members,
                            children,
                            isLoading: false
                        })
                    }
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Create a new family
            createFamily: async (name) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    const newFamily = {
                        id: 'family_' + Date.now(),
                        name,
                        inviteCode: generateInviteCode(),
                        members: []
                    }

                    set({
                        family: newFamily,
                        members: [],
                        children: [],
                        isLoading: false
                    })
                    return { success: true, family: newFamily }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Join family with invite code
            joinFamily: async (inviteCode) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    // Demo: check invite code
                    if (inviteCode === 'HARU2026') {
                        set({
                            family: DEMO_FAMILY,
                            members: DEMO_FAMILY.members,
                            children: DEMO_FAMILY.members.filter(m => m.role === 'child'),
                            isLoading: false
                        })
                        return { success: true }
                    } else {
                        throw new Error('유효하지 않은 초대 코드입니다.')
                    }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Add a child to family
            addChild: async (childData) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    const newChild = {
                        id: 'user_child_' + Date.now(),
                        name: childData.name,
                        role: 'child',
                        color: childData.color || getNextChildColor(get().children.length)
                    }

                    set(state => ({
                        members: [...state.members, newChild],
                        children: [...state.children, newChild],
                        isLoading: false
                    }))
                    return { success: true, child: newChild }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Remove a child
            removeChild: async (childId) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        members: state.members.filter(m => m.id !== childId),
                        children: state.children.filter(c => c.id !== childId),
                        selectedChildId: state.selectedChildId === childId ? null : state.selectedChildId,
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Set selected child filter (for parent view)
            setSelectedChild: (childId) => {
                set({ selectedChildId: childId })
            },

            // Get child by ID
            getChildById: (childId) => {
                return get().children.find(c => c.id === childId)
            },

            // Clear family data
            clearFamily: () => {
                set({
                    family: null,
                    members: [],
                    children: [],
                    selectedChildId: null,
                    error: null
                })
            }
        }),
        {
            name: 'iharu-family',
            partialize: (state) => ({
                family: state.family,
                members: state.members,
                children: state.children,
                selectedChildId: state.selectedChildId
            })
        }
    )
)

// Helper functions
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'HARU'
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

function getNextChildColor(index) {
    const colors = ['#4ECDC4', '#A18CD1', '#FFB347', '#87CEEB', '#FF6B6B']
    return colors[index % colors.length]
}
