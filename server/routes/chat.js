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

// 2. Get Available Users (All authenticated users can see profiles)
router.get('/users', async (req, res) => {
    try {
        const users = await req.chatService.getAvailableUsers();
        ResponseHandler.success(res, users);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 3. Get Conversations (Enforce current user)
router.get('/conversations', async (req, res) => {
    // SECURITY: Always use req.user.id from token, never trust query param
    const userId = req.user.id;
    try {
        const convs = await req.chatService.getConversations(userId);
        ResponseHandler.success(res, convs);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 4. Create Conversation
router.post('/conversations', async (req, res) => {
    try {
        // SECURITY: Ensure the current user is added to the members if not already there
        const body = req.body;
        if (!body.members) body.members = [];
        if (!body.members.includes(req.user.id)) {
            body.members.push(req.user.id);
        }

        const result = await req.chatService.createConversation(body);

        // Emit Socket Event for new conversation
        const io = req.app.get('socketio');
        if (io && result.members) {
            for (const memberId of result.members) {
                io.to(`user_${memberId}`).emit('new_conversation', result);
            }
        }

        ResponseHandler.success(res, result, 201);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 5. Update Conversation
router.put('/conversations/:id', async (req, res) => {
    try {
        // SECURITY: check if user is admin or member (though usually members can update group names/members)
        const userId = req.user.id;
        const membership = await req.db.get('SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?', [req.params.id, userId]);

        if (!membership && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to update this conversation', 403);
        }

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
            if (req.user.role !== 'admin') return ResponseHandler.error(res, 'Only admins can delete all', 403);
            const result = await req.chatService.deleteAllConversations();
            return ResponseHandler.success(res, result);
        }

        // SECURITY: Check if user is creator or admin
        const conversation = await req.db.get('SELECT createdBy FROM conversations WHERE id = ?', [req.params.id]);
        if (!conversation) return ResponseHandler.error(res, 'Conversation not found', 404);

        if (conversation.createdBy !== req.user.id && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to delete this conversation', 403);
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
        const userId = req.user.id;
        const membership = await req.db.get('SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?', [req.params.id, userId]);
        if (!membership && req.user.role !== 'admin') {
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
        const { content } = req.body;
        const senderId = req.user.id; // SECURITY: Use ID from token

        // SECURITY: check membership
        const membership = await req.db.get('SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?', [conversationId, senderId]);
        if (!membership && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to send messages to this conversation', 403);
        }

        // SECURITY: Fetch the real sender name from DB (don't trust frontend)
        const userProfile = await req.db.get(`
            SELECT name FROM (
                SELECT name FROM users WHERE id = ?
                UNION ALL
                SELECT name FROM teachers WHERE id = ?
                UNION ALL
                SELECT name FROM chat_profiles WHERE id = ?
            ) LIMIT 1
        `, [senderId, senderId, senderId]);

        const senderName = userProfile ? userProfile.name : 'Unknown';

        // Save message
        const newMessage = await req.chatService.saveMessage(conversationId, { senderId, senderName, content });

        // Send notifications
        req.chatService.sendNotification({ conversationId, senderId, senderName, content }).catch(err => console.error('Notification error:', err));

        // Emit Socket Event
        const io = req.app.get('socketio');
        if (io) {
            const members = await req.db.all('SELECT userId FROM conversation_members WHERE conversationId = ?', conversationId);

            console.log(`📡 Broadcasting message to conversation ${conversationId} (${members.length} members)`);

            // 1. Send to the conversation room
            io.to(conversationId).emit('new_message', newMessage);

            // 2. Send to individual user rooms for sidebar updates
            for (const member of members) {
                if (member.userId !== senderId) {
                    console.log(`   -> Sending to user room: user_${member.userId}`);
                    io.to(`user_${member.userId}`).emit('new_message', newMessage);
                }
            }
        }

        ResponseHandler.success(res, newMessage);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

// 9. Mark as Read
router.post('/conversations/:id/read', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await req.chatService.markAsRead(req.params.id, userId);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message, 500, err);
    }
});

module.exports = router;
