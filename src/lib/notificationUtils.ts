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

export const sendNativeNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        const defaultOptions: NotificationOptions = {
            icon: '/logo.png', // Path to the app logo in public folder
            badge: '/logo.png',
            silent: false,
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('Error sending native notification:', error);
    }
};
