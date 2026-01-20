import { create } from 'zustand'
import { familyApi } from '../api/client'

// Demo mode flag
const USE_DEMO = false;

// Demo data
const demoFamily = {
    id: 'demo_family',
    name: '김부모의 가족',
    inviteCode: 'HARU2026'
};

const demoChildren = [
    { id: 'demo_child1', name: '지윤', role: 'child', color: '#4ECDC4' },
    { id: 'demo_child2', name: '민준', role: 'child', color: '#A18CD1' }
];

export const useFamilyStore = create((set, get) => ({
    family: null,
    members: [],
    children: [],
    selectedChildId: null,
    isLoading: false,
    error: null,

    loadFamily: async (familyId) => {
        if (!familyId) return;

        set({ isLoading: true });

        try {
            if (USE_DEMO) {
                set({
                    family: demoFamily,
                    members: [...demoChildren, { id: 'demo_parent', name: '김부모', role: 'parent', color: '#FF6B6B' }],
                    children: demoChildren,
                    isLoading: false
                });
                return;
            }

            const response = await familyApi.get();
            set({
                family: response.family,
                members: response.members,
                children: response.children,
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    joinFamily: async (inviteCode) => {
        set({ isLoading: true, error: null });

        try {
            if (USE_DEMO) {
                if (inviteCode.toUpperCase() === 'HARU2026') {
                    set({
                        family: demoFamily,
                        members: demoChildren,
                        children: demoChildren,
                        isLoading: false
                    });
                    return { success: true };
                }
                throw new Error('유효하지 않은 초대 코드입니다.');
            }

            const response = await familyApi.join(inviteCode);
            set({
                family: response.family,
                members: response.members,
                children: response.members.filter(m => m.role === 'child'),
                isLoading: false
            });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    addChild: async (childData) => {
        try {
            if (USE_DEMO) {
                const newChild = {
                    id: 'child_' + Date.now(),
                    name: childData.name,
                    role: 'child',
                    color: childData.color || '#4ECDC4'
                };
                set(state => ({
                    children: [...state.children, newChild],
                    members: [...state.members, newChild]
                }));
                return { success: true, child: newChild };
            }

            const response = await familyApi.addChild(childData);
            await get().loadFamily(get().family?.id);
            return { success: true, child: response.child };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    removeChild: async (childId) => {
        try {
            if (USE_DEMO) {
                set(state => ({
                    children: state.children.filter(c => c.id !== childId),
                    members: state.members.filter(m => m.id !== childId)
                }));
                return { success: true };
            }

            await familyApi.removeChild(childId);
            await get().loadFamily(get().family?.id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    setSelectedChild: (childId) => {
        set({ selectedChildId: childId });
    },

    getChild: (childId) => {
        const { children } = get();
        return children.find(c => c.id === childId);
    },

    clearFamily: () => {
        set({ family: null, members: [], children: [], selectedChildId: null });
    }
}));
