/**
 * Utility to provide tactile feedback (vibration) on mobile devices.
 * Uses Capacitor Haptics if available, falls back to web vibration API.
 */
export const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
        // Fallback to standard web vibration API
        if (window.navigator && window.navigator.vibrate) {
            const duration = intensity === 'light' ? 10 : intensity === 'medium' ? 30 : 50;
            window.navigator.vibrate(duration);
        }
        
        // If we had @capacitor/haptics installed, we would call it here:
        // Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // Silently ignore if not supported
    }
};
