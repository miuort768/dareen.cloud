const express = require('express');
const router = express.Router();
const ChatService = require('../../services/chatService');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');

const chatService = new ChatService();

router.get('/profiles', async (req, res) => {
    try {
        const profiles = await chatService.getProfiles();
        ResponseHandler.success(res, profiles);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.post('/profiles', async (req, res) => {
    try {
        const result = await chatService.createProfile(req.body);
        ResponseHandler.success(res, result, 201);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.put('/profiles/:id', async (req, res) => {
    try {
        const result = await chatService.updateProfile(req.params.id, req.body);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.delete('/profiles/:id', async (req, res) => {
    try {
        const result = await chatService.deleteProfile(req.params.id);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await chatService.getAvailableUsers();
        ResponseHandler.success(res, users);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.get('/conversations', async (req, res) => {
    const userId = req.user.id;
    try {
        const convs = await chatService.getConversations(userId);
        ResponseHandler.success(res, convs);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.post('/conversations', async (req, res) => {
    try {
        const body = req.body;
        if (!body.members) body.members = [];
        if (!body.members.includes(req.user.id)) {
            body.members.push(req.user.id);
        }

        const result = await chatService.createConversation(body);

        const io = req.app.get('socketio');
        if (io && result.members) {
            for (const memberId of result.members) {
                io.to(`user_${memberId}`).emit('new_conversation', result);
            }
        }

        ResponseHandler.success(res, result, 201);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.put('/conversations/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId: req.params.id, userId } }
        });

        if (!membership && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to update this conversation', 403);
        }

        const result = await chatService.updateConversation(req.params.id, req.body);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.delete('/conversations/:id', async (req, res) => {
    try {
        if (req.params.id === 'all') {
            if (req.user.role !== 'admin') return ResponseHandler.error(res, 'Only admins can delete all', 403);
            const result = await chatService.deleteAllConversations();
            return ResponseHandler.success(res, result);
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id },
            select: { createdBy: true }
        });
        if (!conversation) return ResponseHandler.error(res, 'Conversation not found', 404);

        if (conversation.createdBy !== req.user.id && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to delete this conversation', 403);
        }

        const result = await chatService.deleteConversation(req.params.id);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId: req.params.id, userId } }
        });
        if (!membership && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to view this conversation', 403);
        }

        const messages = await chatService.getMessages(req.params.id);
        ResponseHandler.success(res, messages);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        const membership = await prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: senderId } }
        });
        if (!membership && req.user.role !== 'admin') {
            return ResponseHandler.error(res, 'Unauthorized to send messages to this conversation', 403);
        }

        const userProfile = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } })
            ?? await prisma.teacher.findUnique({ where: { id: senderId }, select: { name: true } })
            ?? await prisma.parent.findUnique({ where: { id: senderId }, select: { name: true } })
            ?? await prisma.student.findUnique({ where: { id: senderId }, select: { name: true } })
            ?? await prisma.chatProfile.findUnique({ where: { id: senderId }, select: { name: true } });

        const senderName = userProfile ? userProfile.name : 'Unknown';

        const newMessage = await chatService.saveMessage(conversationId, { senderId, senderName, content });

        chatService.sendNotification({ conversationId, senderId, senderName, content }).catch(err => logger.error('Chat notification error:', err));

        const io = req.app.get('socketio');
        if (io) {
            const members = await prisma.conversationMember.findMany({
                where: { conversationId },
                select: { userId: true }
            });

            logger.info(`Broadcasting message to conversation ${conversationId} (${members.length} members)`);

            io.to(conversationId).emit('new_message', newMessage);

            for (const member of members) {
                if (member.userId !== senderId) {
                    io.to(`user_${member.userId}`).emit('new_message', newMessage);
                }
            }
        }

        ResponseHandler.success(res, newMessage);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

router.post('/conversations/:id/read', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await chatService.markAsRead(req.params.id, userId);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Chat route error');
    }
});

module.exports = router;
