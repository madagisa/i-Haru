import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { useScheduleStore } from '../store/scheduleStore'
import { usePrepStore } from '../store/prepStore'
import { useMessageStore } from '../store/messageStore'

// Polling interval in ms (3 seconds)
const POLLING_INTERVAL = 3000;

export function useRealtimeSync() {
    const { user } = useAuthStore();
    const { loadFamily } = useFamilyStore();
    const { loadSchedules } = useScheduleStore();
    const { loadPreparations } = usePrepStore();
    const { loadMessages } = useMessageStore();

    // Use ref to keep track of the interval
    const intervalRef = useRef(null);

    useEffect(() => {
        // Only run if user is logged in
        if (!user || !user.familyId) {
            return;
        }

        const syncData = async () => {
            // Only sync if the tab is visible
            if (document.hidden) return;

            // Run load functions in parallel
            // We're essentially just re-fetching everything
            // This is simple polling, which is robust for this scale
            try {
                await Promise.allSettled([
                    loadFamily(user.familyId),
                    loadSchedules(),
                    loadPreparations(),
                    loadMessages()
                ]);
            } catch (error) {
                console.error('Sync error:', error);
            }
        };

        // Initial sync
        syncData();

        // Set up polling
        intervalRef.current = setInterval(syncData, POLLING_INTERVAL);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [user, loadFamily, loadSchedules, loadPreparations, loadMessages]);
}
