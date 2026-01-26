import { useEffect, useRef } from 'react';

const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

function VersionManager() {
    const versionRef = useRef(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Fetch version from API
                const response = await fetch('/api/version');
                if (!response.ok) return;

                const data = await response.json();
                const serverVersion = data.version;

                // Initial load: store version
                if (!versionRef.current) {
                    versionRef.current = serverVersion;
                    console.log('Current version:', serverVersion);
                    return;
                }

                // If version changed, reload
                if (serverVersion !== versionRef.current) {
                    console.log('Version changed! Reloading...', versionRef.current, '->', serverVersion);
                    window.location.reload();
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        // Check initially
        checkVersion();

        // Check periodically
        const intervalId = setInterval(checkVersion, CHECK_INTERVAL);

        // Also check when page becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkVersion();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return null; // This component renders nothing
}

export default VersionManager;
