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
    const currentVersionRef = useRef(null);

    useEffect(() => {
        // Only run if user is logged in
        if (!user || !user.familyId) {
            return;
        }

        const checkVersion = async () => {
            // 10% chance to check version to reduce load (average once every 30s)
            // or just check every sync? It's a tiny JSON. Let's check every sync for responsiveness.
            try {
                const res = await fetch('/api/version');
                if (res.ok) {
                    const data = await res.json();
                    const serverVersion = data.version;

                    if (!currentVersionRef.current) {
                        currentVersionRef.current = serverVersion;
                    } else if (currentVersionRef.current !== serverVersion) {
                        console.log('New version detected. Reloading...');
                        // Optional: Show toast before reloading?
                        // For now, simple reload as requested.
                        window.location.reload();
                    }
                }
            } catch (err) {
                console.warn('Version check failed:', err);
            }
        };

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
                    loadMessages(),
                    checkVersion() // Add version check
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
