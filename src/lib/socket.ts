import { io, Socket } from 'socket.io-client';

// In production, the URL might be different or dynamic
// Path is now handled relative to the origin for better proxy support
// const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
    private socket: Socket | null = null;

    connect() {
        const token = localStorage.getItem('auth_token');
        
        if (!this.socket) {
            const origin = window.location.origin;
            this.socket = io(origin, {
                path: '/api/socket.io',
                transports: ['polling', 'websocket'],
                autoConnect: true,
                auth: { token: token || 'guest' },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 30000
            });

            this.socket.on('connect', () => {
                if (token) {
                    const decoded = this.decodeToken(token);
                    if (decoded?.id) {
                        this.socket?.emit('join_personal_room', decoded.id);
                    }
                }
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
            // Force reconnect if token changed to ensure server updates rooms
            const currentToken = (this.socket.auth as { token?: string })?.token;
            if (currentToken !== token) {
                this.socket.auth = { token: token || 'guest' };
                if (this.socket.connected) {
                    this.socket.disconnect().connect();
                }
            }
        }
        return this.socket;
    }

    private decodeToken(token: string) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    getSocket() {
        return this.socket || this.connect() || {
            on: () => { }, off: () => { }, emit: () => { }, id: 'offline'
        } as Partial<Socket>;
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
