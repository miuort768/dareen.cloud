import { io, Socket } from 'socket.io-client';

// In production, the URL might be different or dynamic
// Path is now handled relative to the origin for better proxy support
// const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
    private socket: Socket | null = null;

    connect() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        if (!this.socket) {
            // In many VPS environments, using the same origin with a specific path is most reliable
            this.socket = io({
                path: '/api/socket.io',
                transports: ['polling', 'websocket'],
                autoConnect: true,
                auth: { token },
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to WebSocket server as:', this.socket?.id);
                // Explicitly join personal room just in case server-side join on connection fails
                const decoded = this.decodeToken(token);
                if (decoded?.id) {
                    this.socket?.emit('join_personal_room', decoded.id);
                }
            });

            this.socket.on('connect_error', (err) => {
                console.error('❌ Socket connection error:', err.message);
            });
        } else {
            // If socket exists but token might be different, update auth
            this.socket.auth = { token };
        }
        return this.socket;
    }

    private decodeToken(token: string) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    }

    getSocket() {
        return this.socket || this.connect() || {
            on: () => { }, off: () => { }, emit: () => { }, id: 'offline'
        } as any;
    }

    joinConversation(id: string) {
        this.getSocket().emit('join_conversation', id);
    }

    leaveConversation(id: string) {
        this.getSocket().emit('leave_conversation', id);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
