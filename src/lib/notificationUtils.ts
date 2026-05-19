/**
 * Utility for handling Browser/Desktop Notifications
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNativeNotification = async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        const defaultOptions: any = {
            icon: '/logo.png',
            badge: '/logo.png',
            silent: false,
            // @ts-ignore
            vibrate: [200, 100, 200], // Mobile vibration pattern
            ...options
        };

        // Prefer Service Worker registration for better mobile/background support
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                await registration.showNotification(title, defaultOptions);
                return;
            }
        }

        // Fallback to standard Browser Notification
        const notification = new Notification(title, defaultOptions);
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('Error sending native notification:', error);
    }
};

export const playNotificationSound = () => {
    try {
        const audio = new Audio('/pikachu.mp3');
        audio.volume = 1.0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio autoplay prevented by browser:', error);
            });
        }
    } catch (e) {
        console.error('Error playing sound:', e);
    }
};
