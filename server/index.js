const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');

const dbMiddleware = require('./middleware/db');

// Route Imports
const { authRouter } = require('./routes/auth');
const { studentRouter } = require('./routes/students');
const { teacherRouter } = require('./routes/teachers');
const { parentRouter } = require('./routes/parents');
const { sessionRouter } = require('./routes/sessions');
const { invoiceRouter } = require('./routes/invoices');
const { notificationRouter } = require('./routes/notifications');
const { systemRouter } = require('./routes/system');
const financeRouter = require('./routes/finance');
const tasksRouter = require('./routes/tasks');
const chatRouter = require('./routes/chat');



const { getDb } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176'
        ].filter(Boolean); // Remove undefined/null

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.FRONTEND_URL === '*') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(express.json());

async function startServer() {
    try {
        const db = await getDb();
        console.log('Database initialized successfully');

        // Run DB Setup/Migration on start
        const { setupDatabase } = require('./db_setup');
        await setupDatabase();

        app.use(dbMiddleware);

        app.set('trust proxy', 1);

        // Security: Rate Limiting
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: process.env.NODE_ENV === 'development' ? 100000 : 50000, // Increased for production
            message: { error: 'Too many requests, please try again later.' }
        });
        app.use('/api/', limiter);

        const logger = require('./utils/logger');

        // Setup API Routes
        const apiRouter = express.Router();

        const { authMiddleware, checkRole } = require('./middleware/auth');

        apiRouter.use('/auth', authRouter);

        // Apply authentication to ALL other API routes
        apiRouter.use(authMiddleware);

        apiRouter.use('/students', studentRouter);
        apiRouter.use('/teachers', teacherRouter);
        apiRouter.use('/parents', parentRouter);
        apiRouter.use('/sessions', sessionRouter);
        apiRouter.use('/notifications', notificationRouter);
        apiRouter.use('/system', checkRole(['admin']), systemRouter);
        apiRouter.use('/finance', checkRole(['admin']), financeRouter);
        apiRouter.use('/tasks', tasksRouter);
        apiRouter.use('/chat', chatRouter);


        // Compatibility middleware for invoices inside API
        apiRouter.use('/studentInvoices', checkRole(['admin']), (req, res, next) => {
            if (req.url === '' || req.url === '/') {
                req.url = '/student';
            } else {
                req.url = '/student' + req.url;
            }
            invoiceRouter(req, res, next);
        });

        apiRouter.use('/invoices', checkRole(['admin']), (req, res, next) => {
            if (req.url === '' || req.url === '/') {
                req.url = '/teacher';
            } else if (req.url.startsWith('/teacher') || req.url.startsWith('/student')) {
                // If the user already put /teacher or /student (e.g. /invoices/student), leave it
            } else {
                // otherwise default to teacher
                req.url = '/teacher' + req.url;
            }
            invoiceRouter(req, res, next);
        });

        // Compatibility for /users inside API (Admin only)
        apiRouter.use('/users', checkRole(['admin']), (req, res, next) => {
            req.url = '/users' + req.url;
            systemRouter(req, res, next);
        });

        // Serve static files from the React app
        app.use(express.static(path.join(__dirname, '../dist')));

        app.use('/api', apiRouter);

        // Global Error Handler
        app.use((err, req, res, next) => {
            logger.error('Unhandled Server Error', err, { path: req.path });
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
        });

        // The "catchall" handler
        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });

        const http = require('http');
        const { Server } = require('socket.io');
        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Make io accessible to routers
        app.set('socketio', io);

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join_conversation', (conversationId) => {
                socket.join(conversationId);
                console.log(`User ${socket.id} joined conversation ${conversationId}`);
            });

            socket.on('leave_conversation', (conversationId) => {
                socket.leave(conversationId);
                console.log(`User ${socket.id} left conversation ${conversationId}`);
            });

            socket.on('peer_ready', (data) => {
                const { conversationId } = data;
                socket.to(conversationId).emit('peer_ready', data);
                console.log(`Peer ready in ${conversationId}:`, data.peerId);
            });

            socket.on('meeting_started', (conversationId) => {
                socket.to(conversationId).emit('meeting_status_changed', { conversationId, isActive: true });
                console.log(`Meeting started in ${conversationId}`);
            });

            socket.on('meeting_ended', (conversationId) => {
                socket.to(conversationId).emit('meeting_status_changed', { conversationId, isActive: false });
                console.log(`Meeting ended in ${conversationId}`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });

            socket.on('media_status_change', (data) => {
                // data: { conversationId, peerId, isMuted, isVideoOff }
                socket.to(data.conversationId).emit('media_status_change', data);
            });

            socket.on('kick_user', (data) => {
                // data: { conversationId, targetPeerId }
                socket.to(data.conversationId).emit('kick_user', data);
            });
        });

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Initialize PeerJS on a separate port (3005)
        const peerApp = express();
        const peerHttp = require('http').createServer(peerApp);
        const { ExpressPeerServer } = require('peer');

        peerApp.use(cors()); // Enable CORS for PeerJS

        const peerServer = ExpressPeerServer(peerHttp, {
            debug: true,
            path: '/myapp',
            allow_discovery: true
        });

        peerApp.use('/peerjs', peerServer);

        peerHttp.listen(3005, () => {
            console.log('PeerJS Server running on http://localhost:3005');
        });

        peerServer.on('connection', (client) => {
            console.log('Peer connected:', client.getId());
        });

        peerServer.on('disconnect', (client) => {
            console.log('Peer disconnected:', client.getId());
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

