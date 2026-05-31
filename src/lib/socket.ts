import { io, Socket } from 'socket.io-client';

// In production, the URL might be different or dynamic
// Path is now handled relative to the origin for better proxy support
// const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
    private socket: Socket | null = null;

    private activeRooms: Set<string> = new Set();

    connect() {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;

        if (!this.socket) {
            const origin = window.location.origin;
            this.socket = io(origin, {
                path: '/api/socket.io',
                transports: ['polling', 'websocket'],
                autoConnect: true,
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 30000
            });

            this.socket.on('connect', () => {
                this.activeRooms.forEach(roomId => {
                    this.socket?.emit('join_conversation', roomId);
                });
            });

            this.socket.on('connect_error', (err) => {
                if (err.message === 'Authentication error') {
                    this.socket?.disconnect();
                    this.socket = null;
                    console.error('❌ Socket auth failed, stopping reconnection');
                    return;
                }
                console.error('❌ Socket connection error:', err.message);
            });
        } else {
            const currentToken = (this.socket.auth as { token?: string })?.token;
            if (currentToken !== token) {
                this.socket.auth = { token };
                if (this.socket.connected) {
                    this.socket.disconnect().connect();
                }
            }
        }
        return this.socket;
    }

    getSocket() {
        if (this.socket?.connected) return this.socket;
        const s = this.connect();
        if (!s) {
            console.warn('⚠️ Socket not available — user may be offline or unauthenticated');
        }
        return s;
    }

    joinConversation(id: string) {
        this.activeRooms.add(id);
        this.getSocket()?.emit('join_conversation', id);
    }

    leaveConversation(id: string) {
        this.activeRooms.delete(id);
        this.getSocket()?.emit('leave_conversation', id);
    }

    disconnect() {
        this.activeRooms.clear();
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
