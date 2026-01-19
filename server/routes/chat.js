const express = require('express');
const router = express.Router();
const ChatService = require('../services/chatService');
const ResponseHandler = require('../utils/responseHandler');
const { getDb } = require('../utils/db');

// Database and Service Initialization
let chatService;
router.use(async (req, res, next) => {
    try {
        if (!chatService) {
            const db = await getDb();
            chatService = new ChatService(db);
        }
        req.chatService = chatService;
        next();
    } catch (err) {
        ResponseHandler.error(res, 'Database connection failed', 500, err);
    }
});

// 1. Manage Chat Profiles
router.get('/profiles', async (req, res) => {
    try {
        const profiles = await req.chatService.getProfiles();
        ResponseHandler.success(res, profiles);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

router.post('/profiles', async (req, res) => {
    try {
        const result = await req.chatService.createProfile(req.body);
        ResponseHandler.success(res, result, 201);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

router.put('/profiles/:id', async (req, res) => {
    try {
        const result = await req.chatService.updateProfile(req.params.id, req.body);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

router.delete('/profiles/:id', async (req, res) => {
    try {
        const result = await req.chatService.deleteProfile(req.params.id);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 2. Get Available Users
router.get('/users', async (req, res) => {
    try {
        const users = await req.chatService.getAvailableUsers();
        ResponseHandler.success(res, users);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 3. Get Conversations
router.get('/conversations', async (req, res) => {
    if (!req.query.userId) return ResponseHandler.badRequest(res, 'User ID required');
    try {
        const convs = await req.chatService.getConversations(req.query.userId);
        ResponseHandler.success(res, convs);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 4. Create Conversation
router.post('/conversations', async (req, res) => {
    try {
        console.log('Creating conversation with body:', req.body);
        const result = await req.chatService.createConversation(req.body);
        ResponseHandler.success(res, result, 201);
    } catch (err) {
        console.error('Error creating conversation:', err);
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 5. Update Conversation
router.put('/conversations/:id', async (req, res) => {
    try {
        const result = await req.chatService.updateConversation(req.params.id, req.body);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 6. Delete Conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        if (req.params.id === 'all') {
            const result = await req.chatService.deleteAllConversations();
            return ResponseHandler.success(res, result);
        }
        const result = await req.chatService.deleteConversation(req.params.id);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 7. Get Messages
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        // IDOR Check: Ensure user is member
        const userId = req.user.id; // From authMiddleware
        const membership = await req.db.get('SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?', [req.params.id, userId]);
        if (!membership && req.user.role !== 'admin') { // Admins might need access to everything
            return ResponseHandler.error(res, 'Unauthorized to view this conversation', 403);
        }

        const messages = await req.chatService.getMessages(req.params.id);
        ResponseHandler.success(res, messages);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 8. Send Message
router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { senderId, senderName, content } = req.body;

        // Save message
        const newMessage = await req.chatService.saveMessage(conversationId, { senderId, senderName, content });

        // Send notifications (async, don't wait)
        req.chatService.sendNotification({ conversationId, senderId, senderName, content }).catch(err => console.error('Notification error:', err));

        // Emit Socket Event
        const io = req.app.get('socketio');
        if (io) {
            io.to(conversationId).emit('new_message', newMessage);
        }

        ResponseHandler.success(res, newMessage);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

module.exports = router;
