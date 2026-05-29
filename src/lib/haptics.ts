/**
 * Utility to provide tactile feedback (vibration) on mobile devices.
 * Checks user preference from localStorage before vibrating.
 * Uses Capacitor Haptics if available, falls back to web vibration API.
 */
export const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
        const enabled = localStorage.getItem('haptic_enabled');
        if (enabled === 'false') return;

        if (window.navigator && window.navigator.vibrate) {
            const duration = intensity === 'light' ? 10 : intensity === 'medium' ? 30 : 50;
            window.navigator.vibrate(duration);
        }
    } catch {
        // silently ignore
    }
};
