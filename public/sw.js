/* eslint-disable no-restricted-globals */

// ============================================
// Advanced Notification System - High Performance
// Handles hundreds of notifications without freezing
// ============================================

const NOTIFICATION_THROTTLE_MS = 1000; // Max 1 notification per second
const MAX_NOTIFICATIONS = 5; // Keep only latest 5 notifications
let lastNotificationTime = 0;
let pendingNotifications = new Map(); // Group notifications by sender

// Throttled notification handler
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        handleNotificationSmart(data)
    );
});

async function handleNotificationSmart(data) {
    const now = Date.now();
    const senderId = data.senderId || 'system';
    const title = data.title || 'رسالة جديدة';
    const body = data.body || '';

    // Throttle: If too many notifications, batch them
    if (now - lastNotificationTime < NOTIFICATION_THROTTLE_MS) {
        // Add to pending batch
        if (!pendingNotifications.has(senderId)) {
            pendingNotifications.set(senderId, {
                title: title,
                messages: [],
                count: 0
            });
        }

        const batch = pendingNotifications.get(senderId);
        batch.messages.push(body);
        batch.count++;

        // Show batched notification after throttle period
        setTimeout(() => {
            showBatchedNotification(senderId);
        }, NOTIFICATION_THROTTLE_MS);

        return;
    }

    // Show immediate notification
    lastNotificationTime = now;

    const options = {
        body: body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: senderId, // Reuse same notification slot for same sender
        renotify: false, // Don't vibrate/sound for updates
        requireInteraction: false, // Auto-dismiss after timeout
        silent: false,
        data: {
            url: data.url || '/',
            senderId: senderId
        }
    };

    // Clean old notifications to prevent memory leak
    const notifications = await self.registration.getNotifications();
    if (notifications.length > MAX_NOTIFICATIONS) {
        notifications.slice(0, -MAX_NOTIFICATIONS).forEach(n => n.close());
    }

    await self.registration.showNotification(title, options);
}

async function showBatchedNotification(senderId) {
    const batch = pendingNotifications.get(senderId);
    if (!batch || batch.count === 0) return;

    const title = batch.title;
    const body = batch.count === 1
        ? batch.messages[0]
        : `${batch.count} رسائل جديدة`;

    const options = {
        body: body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: senderId,
        renotify: false,
        requireInteraction: false,
        data: {
            url: '/chat',
            senderId: senderId
        }
    };

    await self.registration.showNotification(title, options);

    // Clear batch
    pendingNotifications.delete(senderId);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(event.notification.data.url || '/');
                }
            })
    );
});

// Fast install/activate - no caching delays
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Basic fetch handler (Network-first)
// This ensures the PWA is considered 'offline-capable' by browsers
self.addEventListener('fetch', (event) => {
    // Basic network-first strategy for main assets
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/');
            })
        );
    }
});
