import { create } from 'zustand'
import { schedulesApi } from '../api/client'
import { format, addDays, isSameDay, parseISO } from 'date-fns'

// Demo mode flag
const USE_DEMO = false;

// Demo schedules
const today = format(new Date(), 'yyyy-MM-dd');
const demoSchedules = [
    {
        id: 'demo_schedule_1',
        familyId: 'demo_family',
        childId: 'demo_child1',
        title: '영어학원',
        description: '원어민 회화 수업',
        category: 'academy',
        startDate: today,
        startTime: '14:00',
        endTime: '15:30',
        isAllDay: false,
        color: '#A29BFE',
        recurrence: { frequency: 'weekly', daysOfWeek: [1, 3, 5], endDate: null }
    },
    {
        id: 'demo_schedule_2',
        familyId: 'demo_family',
        childId: 'demo_child1',
        title: '수학학원',
        description: '심화반 수업',
        category: 'academy',
        startDate: today,
        startTime: '16:00',
        endTime: '18:00',
        isAllDay: false,
        color: '#A29BFE',
        recurrence: { frequency: 'weekly', daysOfWeek: [2, 4], endDate: null }
    },
    {
        id: 'demo_schedule_3',
        familyId: 'demo_family',
        childId: 'demo_child2',
        title: '피아노 레슨',
        description: '기초 레슨',
        category: 'academy',
        startDate: today,
        startTime: '17:00',
        endTime: '18:00',
        isAllDay: false,
        color: '#A29BFE',
        recurrence: { frequency: 'weekly', daysOfWeek: [1, 4], endDate: null }
    }
];

export const useScheduleStore = create((set, get) => ({
    schedules: USE_DEMO ? demoSchedules : [],
    isLoading: false,
    error: null,

    loadSchedules: async (params = {}) => {
        set({ isLoading: true });

        try {
            if (USE_DEMO) {
                set({ isLoading: false });
                return;
            }

            const response = await schedulesApi.getAll(params);
            set({ schedules: response.schedules, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addSchedule: async (scheduleData) => {
        try {
            if (USE_DEMO) {
                const newSchedule = {
                    id: 'schedule_' + Date.now(),
                    ...scheduleData
                };
                set(state => ({
                    schedules: [...state.schedules, newSchedule]
                }));
                return { success: true, schedule: newSchedule };
            }

            const response = await schedulesApi.create(scheduleData);
            await get().loadSchedules();
            return { success: true, schedule: response.schedule };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateSchedule: async (id, updates) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    schedules: state.schedules.map(s =>
                        s.id === id ? { ...s, ...updates } : s
                    )
                }));
                return { success: true };
            }

            await schedulesApi.update(id, updates);
            await get().loadSchedules();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteSchedule: async (id) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    schedules: state.schedules.filter(s => s.id !== id)
                }));
                return { success: true };
            }

            await schedulesApi.delete(id);
            await get().loadSchedules();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get schedules for a specific date (with recurrence expansion)
    getSchedulesForDate: (date, options = {}) => {
        const { schedules } = get();
        const { childId, includeFamily = false } = options;

        const targetDate = typeof date === 'string' ? parseISO(date) : date;
        const dayOfWeek = targetDate.getDay();

        return schedules.filter(schedule => {
            // Filter by child if specified
            if (childId && schedule.childId !== childId && !includeFamily) {
                return false;
            }

            // Check direct date match
            const scheduleDate = parseISO(schedule.startDate);
            if (isSameDay(scheduleDate, targetDate)) {
                return true;
            }

            // Check recurrence
            if (schedule.recurrence && schedule.recurrence.daysOfWeek?.includes(dayOfWeek)) {
                const startDate = parseISO(schedule.startDate);
                if (targetDate >= startDate) {
                    if (!schedule.recurrence.endDate) return true;
                    const endDate = parseISO(schedule.recurrence.endDate);
                    return targetDate <= endDate;
                }
            }

            return false;
        }).sort((a, b) => {
            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime);
            }
            return a.isAllDay ? -1 : 1;
        });
    },

    getSchedule: (id) => {
        return get().schedules.find(s => s.id === id);
    },

    getTodaySchedules: (options = {}) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().getSchedulesForDate(today, options);
    }
}));
