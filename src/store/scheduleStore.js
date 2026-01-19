import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, addDays, isToday, isBefore, startOfDay, parseISO } from 'date-fns'

// Demo schedules
const today = new Date()
const DEMO_SCHEDULES = [
    {
        id: 'schedule_1',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '수학학원',
        description: '2단원 복습하기',
        category: 'academy',
        startDate: format(today, 'yyyy-MM-dd'),
        startTime: '16:00',
        endTime: '18:00',
        isAllDay: false,
        color: '#A29BFE',
        createdBy: 'user_parent_1',
        recurrence: {
            frequency: 'weekly',
            daysOfWeek: [1, 3, 5], // 월, 수, 금
            endDate: null
        }
    },
    {
        id: 'schedule_2',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '영어학원',
        description: '',
        category: 'academy',
        startDate: format(today, 'yyyy-MM-dd'),
        startTime: '14:00',
        endTime: '15:30',
        isAllDay: false,
        color: '#A29BFE',
        createdBy: 'user_parent_1',
        recurrence: {
            frequency: 'weekly',
            daysOfWeek: [2, 4], // 화, 목
            endDate: null
        }
    },
    {
        id: 'schedule_3',
        familyId: 'family_demo_1',
        childId: 'user_child_2',
        title: '피아노 레슨',
        description: '악보 가져가기',
        category: 'academy',
        startDate: format(today, 'yyyy-MM-dd'),
        startTime: '17:00',
        endTime: '18:00',
        isAllDay: false,
        color: '#A29BFE',
        createdBy: 'user_parent_1',
        recurrence: {
            frequency: 'weekly',
            daysOfWeek: [3, 6], // 수, 토
            endDate: null
        }
    },
    {
        id: 'schedule_4',
        familyId: 'family_demo_1',
        childId: 'user_child_1',
        title: '학교 체험학습',
        description: '과학관 견학',
        category: 'school',
        startDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        startTime: null,
        endTime: null,
        isAllDay: true,
        color: '#74B9FF',
        createdBy: 'user_parent_1',
        recurrence: null
    },
    {
        id: 'schedule_5',
        familyId: 'family_demo_1',
        childId: null, // Family event
        title: '가족 외식',
        description: '할머니 생신',
        category: 'family',
        startDate: format(addDays(today, 5), 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '20:00',
        isAllDay: false,
        color: '#00B894',
        createdBy: 'user_parent_1',
        recurrence: null
    }
]

export const useScheduleStore = create(
    persist(
        (set, get) => ({
            schedules: DEMO_SCHEDULES,
            isLoading: false,
            error: null,

            // Get schedules for a specific date (with recurrence expansion)
            getSchedulesForDate: (date, options = {}) => {
                const { childId = null, includeFamily = true } = options
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayOfWeek = date.getDay()

                const schedules = get().schedules.filter(schedule => {
                    // Filter by child if specified
                    if (childId && schedule.childId !== childId && schedule.childId !== null) {
                        return false
                    }

                    // Include family events if requested
                    if (!includeFamily && schedule.childId === null) {
                        return false
                    }

                    // Check if date matches directly
                    if (schedule.startDate === dateStr) {
                        return true
                    }

                    // Check recurrence
                    if (schedule.recurrence) {
                        const startDate = parseISO(schedule.startDate)
                        if (isBefore(date, startOfDay(startDate))) {
                            return false
                        }

                        if (schedule.recurrence.endDate) {
                            const endDate = parseISO(schedule.recurrence.endDate)
                            if (isBefore(endDate, date)) {
                                return false
                            }
                        }

                        if (schedule.recurrence.frequency === 'weekly') {
                            return schedule.recurrence.daysOfWeek.includes(dayOfWeek)
                        }

                        if (schedule.recurrence.frequency === 'daily') {
                            return true
                        }
                    }

                    return false
                })

                // Sort by time
                return schedules.sort((a, b) => {
                    if (a.isAllDay && !b.isAllDay) return -1
                    if (!a.isAllDay && b.isAllDay) return 1
                    if (a.startTime && b.startTime) {
                        return a.startTime.localeCompare(b.startTime)
                    }
                    return 0
                })
            },

            // Get today's schedules
            getTodaySchedules: (options = {}) => {
                return get().getSchedulesForDate(new Date(), options)
            },

            // Get upcoming schedules (next 7 days)
            getUpcomingSchedules: (options = {}) => {
                const upcoming = []
                for (let i = 1; i <= 7; i++) {
                    const date = addDays(new Date(), i)
                    const schedules = get().getSchedulesForDate(date, options)
                    schedules.forEach(s => {
                        upcoming.push({ ...s, displayDate: date })
                    })
                }
                return upcoming
            },

            // Add schedule
            addSchedule: async (scheduleData) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    const newSchedule = {
                        id: 'schedule_' + Date.now(),
                        ...scheduleData,
                        createdAt: new Date().toISOString()
                    }

                    set(state => ({
                        schedules: [...state.schedules, newSchedule],
                        isLoading: false
                    }))
                    return { success: true, schedule: newSchedule }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Update schedule
            updateSchedule: async (scheduleId, updates) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        schedules: state.schedules.map(s =>
                            s.id === scheduleId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
                        ),
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Delete schedule
            deleteSchedule: async (scheduleId) => {
                set({ isLoading: true })

                try {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    set(state => ({
                        schedules: state.schedules.filter(s => s.id !== scheduleId),
                        isLoading: false
                    }))
                    return { success: true }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    return { success: false, error: error.message }
                }
            },

            // Get schedule by ID
            getScheduleById: (scheduleId) => {
                return get().schedules.find(s => s.id === scheduleId)
            }
        }),
        {
            name: 'iharu-schedules',
            partialize: (state) => ({ schedules: state.schedules })
        }
    )
)
