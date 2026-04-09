const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFM-tXp9_QW4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4zY9w4';

export const pushService = {
  /**
   * Check if push notifications are supported and permitted
   */
  async checkPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  /**
   * Request permission and subscribe user to push
   */
  async subscribeUser() {
    try {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe new user
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      // Send subscription to server
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        })
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  },

  /**
   * Helper to convert VAPID key
   */
  urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};
