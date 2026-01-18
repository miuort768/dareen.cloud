import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

// In production, the URL might be different or dynamic
const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });
        }
        return this.socket;
    }

    getSocket() {
        return this.socket || this.connect();
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
