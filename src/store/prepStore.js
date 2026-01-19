import { create } from 'zustand'
import { preparationsApi } from '../api/client'
import { format, differenceInDays, parseISO } from 'date-fns'

// Demo mode flag
const USE_DEMO = true;

// Demo preparations
const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
const demoPreparations = [
    {
        id: 'demo_prep_1',
        familyId: 'demo_family',
        childId: 'demo_child1',
        title: '미술 준비물',
        description: '스케치북, 물감, 붓',
        category: 'school',
        dueDate: today,
        isCompleted: false
    },
    {
        id: 'demo_prep_2',
        familyId: 'demo_family',
        childId: 'demo_child1',
        title: '수학 수행평가',
        description: '함수 단원 요약 정리',
        category: 'exam',
        dueDate: tomorrow,
        isCompleted: false
    },
    {
        id: 'demo_prep_3',
        familyId: 'demo_family',
        childId: 'demo_child2',
        title: '과학 실험복',
        description: '실험복 챙기기',
        category: 'school',
        dueDate: tomorrow,
        isCompleted: false
    }
];

export const usePrepStore = create((set, get) => ({
    preparations: USE_DEMO ? demoPreparations : [],
    isLoading: false,
    error: null,

    loadPreparations: async (params = {}) => {
        set({ isLoading: true });

        try {
            if (USE_DEMO) {
                set({ isLoading: false });
                return;
            }

            const response = await preparationsApi.getAll(params);
            set({ preparations: response.preparations, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addPreparation: async (prepData) => {
        try {
            if (USE_DEMO) {
                const newPrep = {
                    id: 'prep_' + Date.now(),
                    ...prepData,
                    isCompleted: false
                };
                set(state => ({
                    preparations: [...state.preparations, newPrep]
                }));
                return { success: true, preparation: newPrep };
            }

            const response = await preparationsApi.create(prepData);
            await get().loadPreparations();
            return { success: true, preparation: response.preparation };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updatePreparation: async (id, updates) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    preparations: state.preparations.map(p =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                }));
                return { success: true };
            }

            await preparationsApi.update(id, updates);
            await get().loadPreparations();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deletePreparation: async (id) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    preparations: state.preparations.filter(p => p.id !== id)
                }));
                return { success: true };
            }

            await preparationsApi.delete(id);
            await get().loadPreparations();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    toggleCompletion: async (id) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    preparations: state.preparations.map(p =>
                        p.id === id ? { ...p, isCompleted: !p.isCompleted } : p
                    )
                }));
                return { success: true };
            }

            await preparationsApi.toggleCompletion(id);
            await get().loadPreparations();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getPreparations: (options = {}) => {
        const { preparations } = get();
        const { childId, showCompleted = true } = options;

        return preparations.filter(prep => {
            if (childId && prep.childId !== childId) return false;
            if (!showCompleted && prep.isCompleted) return false;
            return true;
        }).sort((a, b) => {
            // Sort: incomplete first, then by due date
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    },

    getUrgentPreparations: (options = {}) => {
        const preps = get().getPreparations(options);
        return preps.filter(p => !p.isCompleted && get().isUrgent(p.dueDate));
    },

    getDday: (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = parseISO(dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = differenceInDays(due, today);

        if (diff === 0) return 'D-Day';
        if (diff < 0) return `D+${Math.abs(diff)}`;
        return `D-${diff}`;
    },

    isUrgent: (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = parseISO(dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = differenceInDays(due, today);
        return diff <= 2;
    },

    isOverdue: (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = parseISO(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    }
}));
