import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, addDays, differenceInDays, parseISO, isPast, isToday } from 'date-fns'

// Demo preparations
const today = new Date()
const DEMO_PREPARATIONS = [
    {
        id: 'prep_1',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '수학 수행평가',
        description: '2단원 문제집 풀어오기',
        category: 'exam',
        dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
        isCompleted: false,
        createdBy: 'user_parent_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'prep_2',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '미술 준비물',
        description: '스케치북, 물감, 붓',
        category: 'school',
        dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
        isCompleted: false,
        createdBy: 'user_parent_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'prep_3',
        familyId: 'family_demo_1',
        childId: 'user_child_2',
        title: '피아노 교재',
        description: '새 교재 구입',
        category: 'academy',
        dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        isCompleted: false,
        createdBy: 'user_parent_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'prep_4',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '체험학습 동의서',
        description: '부모님 서명 필요',
        category: 'school',
        dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
        isCompleted: true,
        createdBy: 'user_child_1',
        createdAt: new Date().toISOString()
    }
]

export const usePrepStore = create(
    persist(
        (set, get) => ({
            preparations: DEMO_PREPARATIONS,
            isLoading: false,
            error: null,

            // Get all preparations (filtered)
            getPreparations: (options = {}) => {
                const { childId = null, showCompleted = true } = options

                return get().preparations
                    .filter(prep => {
                        if (childId && prep.childId !== childId) return false
                        if (!showCompleted && prep.isCompleted) return false
                        return true
                    })
                    .sort((a, b) => {
                        // Completed items last
                        if (a.isCompleted !== b.isCompleted) {
                            return a.isCompleted ? 1 : -1
                        }
                        // Then by due date
                        return new Date(a.dueDate) - new Date(b.dueDate)
                    })
            },

            // Get pending (incomplete) preparations
            getPendingPreparations: (options = {}) => {
                const { childId = null, limit = null } = options

                const pending = get().preparations
                    .filter(prep => {
                        if (prep.isCompleted) return false
                        if (childId && prep.childId !== childId) return false
                        return true
                    })
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

                return limit ? pending.slice(0, limit) : pending
            },

            // Get urgent preparations (due in 2 days or overdue)
            getUrgentPreparations: (options = {}) => {
                const { childId = null } = options

                return get().preparations.filter(prep => {
                    if (prep.isCompleted) return false
                    if (childId && prep.childId !== childId) return false

                    const dueDate = parseISO(prep.dueDate)
                    const daysUntil = differenceInDays(dueDate, new Date())

                    return daysUntil <= 2
                })
            },

            // Calculate D-day
            getDday: (dueDate) => {
                const due = parseISO(dueDate)
                const diff = differenceInDays(due, new Date())

                if (diff < 0) return `D+${Math.abs(diff)}`
                if (diff === 0) return 'D-Day'
                return `D-${diff}`
            },

            // Check if urgent (due in 2 days or less)
            isUrgent: (dueDate) => {
                const due = parseISO(dueDate)
                return differenceInDays(due, new Date()) <= 2
            },

            // Check if overdue
            isOverdue: (dueDate) => {
                const due = parseISO(dueDate)
                return isPast(due) && !isToday(due)
            },

            // Add preparation
            addPreparation: async (prepData) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    const newPrep = {
                        id: 'prep_' + Date.now(),
                        ...prepData,
                        isCompleted: false,
                        createdAt: new Date().toISOString()
                    }

                    set(state => ({
                        preparations: [...state.preparations, newPrep],
                        isLoading: false
                    }))
                    return { success: true, preparation: newPrep }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Update preparation
            updatePreparation: async (prepId, updates) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        preparations: state.preparations.map(p =>
                            p.id === prepId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                        ),
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Toggle completion
            toggleCompletion: async (prepId) => {
                const prep = get().preparations.find(p => p.id === prepId)
                if (!prep) return { success: false, error: 'Preparation not found' }

                return get().updatePreparation(prepId, { isCompleted: !prep.isCompleted })
            },

            // Delete preparation
            deletePreparation: async (prepId) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        preparations: state.preparations.filter(p => p.id !== prepId),
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Get preparation by ID
            getPrepById: (prepId) => {
                return get().preparations.find(p => p.id === prepId)
            }
        }),
        {
            name: 'iharu-preparations',
            partialize: (state) => ({ preparations: state.preparations })
        }
    )
)
