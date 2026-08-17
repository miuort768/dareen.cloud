const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');
const { syncAccount, deactivateAccount } = require('./authAccounts');

class ChatService {
    async resolveUserName(userId) {
        const profile = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
            ?? await prisma.teacher.findUnique({ where: { id: userId }, select: { name: true } })
            ?? await prisma.parent.findUnique({ where: { id: userId }, select: { name: true } })
            ?? await prisma.student.findUnique({ where: { id: userId }, select: { name: true } })
            ?? await prisma.chatProfile.findUnique({ where: { id: userId }, select: { name: true } });
        return profile?.name || userId;
    }

    async getProfiles() {
        return await prisma.chatProfile.findMany({
            select: { id: true, name: true, username: true, avatar: true, status: true, lastSeen: true }
        });
    }

    async getAvailableUsers() {
        const [teachers, admins, parents, students, chatProfiles] = await Promise.all([
            prisma.teacher.findMany({ where: { username: { not: null } }, select: { id: true, name: true, username: true } }),
            prisma.user.findMany({ select: { id: true, name: true, username: true } }),
            prisma.parent.findMany({ where: { username: { not: null } }, select: { id: true, name: true, username: true } }),
            prisma.student.findMany({ where: { username: { not: null } }, select: { id: true, name: true, username: true } }),
            prisma.chatProfile.findMany({ select: { id: true, name: true, username: true } }),
        ]);
        return [
            ...teachers.map(t => ({ ...t, type: 'teacher' })),
            ...admins.map(a => ({ ...a, type: 'admin' })),
            ...parents.map(p => ({ ...p, type: 'parent' })),
            ...students.map(s => ({ ...s, type: 'student' })),
            ...chatProfiles.map(c => ({ ...c, type: 'chat_user' })),
        ];
    }

    async getConversations(userId) {
        const memberships = await prisma.conversationMember.findMany({
            where: { userId },
            select: { conversationId: true }
        });
        const convIds = memberships.map(m => m.conversationId);
        if (convIds.length === 0) return [];

        const conversations = await prisma.conversation.findMany({
            where: { id: { in: convIds } },
            include: { members: { select: { userId: true } } }
        });

        const lastMessages = await prisma.message.findMany({
            where: { conversationId: { in: convIds } },
            orderBy: { timestamp: 'desc' },
            distinct: ['conversationId'],
            take: convIds.length,
            select: { conversationId: true, content: true, timestamp: true }
        });
        const lastMsgMap = {};
        lastMessages.forEach(m => { lastMsgMap[m.conversationId] = m; });

        const unreadCounts = {};
        const notifs = await prisma.notification.findMany({
            where: { conversationId: { in: convIds }, receiverId: userId, read: 0 },
            select: { conversationId: true }
        });
        notifs.forEach(n => { unreadCounts[n.conversationId] = (unreadCounts[n.conversationId] || 0) + 1; });

        // Batch-resolve names for non-group conversations
        const otherUserIds = [...new Set(
            conversations
                .filter(c => !c.isGroup)
                .map(c => c.members.find(m => m.userId !== userId)?.userId)
                .filter(Boolean)
        )];

        const nameMap = {};
        for (const id of otherUserIds) {
            const profile = await prisma.user.findUnique({ where: { id }, select: { name: true } })
                ?? await prisma.teacher.findUnique({ where: { id }, select: { name: true } })
                ?? await prisma.parent.findUnique({ where: { id }, select: { name: true } })
                ?? await prisma.student.findUnique({ where: { id }, select: { name: true } })
                ?? await prisma.chatProfile.findUnique({ where: { id }, select: { name: true } });
            nameMap[id] = profile?.name || id;
        }

        return conversations.map(c => {
            const otherMember = c.members.find(m => m.userId !== userId);
            let displayName = c.name;
            if (!c.isGroup && otherMember) {
                displayName = nameMap[otherMember.userId] || otherMember.userId;
            }
            const lm = lastMsgMap[c.id];
            return {
                ...c,
                isGroup: !!c.isGroup,
                isLive: !!c.isLive,
                members: c.members.map(m => m.userId),
                displayName,
                lastMessage: lm?.content || null,
                lastMessageTime: lm?.timestamp || null,
                unreadCount: unreadCounts[c.id] || 0,
            };
        });
    }

    async saveMessage(conversationId, { senderId, senderName, content }) {
        const id = uuidv4();
        await prisma.message.create({
            data: { id, conversationId, senderId, senderName, content }
        });
        return await prisma.message.findUnique({ where: { id } });
    }

    async updateProfile(id, { name, username, password, avatar }) {
        const data = {};
        if (name !== undefined) data.name = name;
        if (username !== undefined) data.username = username;
        if (avatar !== undefined) data.avatar = avatar;
        if (password) {
            const bcrypt = require('bcrypt');
            data.password = await bcrypt.hash(password, 10);
        }
        await prisma.chatProfile.update({ where: { id }, data });
        if (username !== undefined || password) {
            const fresh = await prisma.chatProfile.findUnique({ where: { id } });
            if (fresh) {
                await syncAccount({ entityType: 'chat_user', entityId: id, username: fresh.username, passwordHash: fresh.password });
            }
        }
        return { success: true };
    }

    async deleteProfile(id) {
        await prisma.chatProfile.delete({ where: { id } });
        await deactivateAccount('chat_user', id);
        return { success: true };
    }

    async createProfile({ name, username, password, avatar }) {
        const id = uuidv4();
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        await prisma.chatProfile.create({
            data: { id, name, username, password: hashedPassword, avatar: avatar || '' }
        });
        await syncAccount({ entityType: 'chat_user', entityId: id, username, passwordHash: hashedPassword });
        return { id, name, username, avatar: avatar || '' };
    }

    async checkPrivateRequest(members) {
        if (members.length !== 2) return null;
        const convs = await prisma.conversation.findMany({
            where: { isGroup: 0 },
            include: {
                members: { where: { userId: { in: members } }, select: { userId: true } }
            }
        });
        return convs.find(c => c.members.length === 2) || null;
    }

    async createConversation({ name, isGroup, members, createdBy }) {
        if (!isGroup) {
            const existing = await this.checkPrivateRequest(members);
            if (existing) return { id: existing.id, name: existing.name, isGroup: false, members };
        }

        const id = uuidv4();
        await prisma.conversation.create({
            data: {
                id,
                name: name || null,
                isGroup: isGroup ? 1 : 0,
                createdBy: createdBy || '',
                members: {
                    create: members.map(userId => ({ userId }))
                }
            }
        });
        return { id, name, isGroup, members };
    }

    async updateConversation(id, { name, members }) {
        if (name !== undefined) {
            await prisma.conversation.update({ where: { id }, data: { name } });
        }
        if (members && Array.isArray(members)) {
            await prisma.conversationMember.deleteMany({ where: { conversationId: id } });
            await prisma.conversationMember.createMany({
                data: members.map(userId => ({ conversationId: id, userId }))
            });
        }
        return { success: true };
    }

    async deleteConversation(id) {
        await prisma.message.deleteMany({ where: { conversationId: id } });
        await prisma.conversationMember.deleteMany({ where: { conversationId: id } });
        await prisma.conversation.delete({ where: { id } });
        return { success: true };
    }

    async deleteAllConversations() {
        await prisma.message.deleteMany();
        await prisma.conversationMember.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.notification.deleteMany({ where: { conversationId: { not: null } } });
        return { success: true };
    }

    async getMessages(conversationId) {
        return await prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'asc' }
        });
    }

    async sendNotification({ conversationId, senderId, senderName, content }) {
        const members = await prisma.conversationMember.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { name: true, isGroup: true }
        });
        if (!conv) return;

        for (const member of members) {
            if (member.userId !== senderId) {
                const existingNotif = await prisma.notification.findFirst({
                    where: { receiverId: member.userId, conversationId, read: 0 }
                });

                if (existingNotif) {
                    let match = existingNotif.message.match(/(\d+)/);
                    let count = match ? parseInt(match[1]) + 1 : 2;
                    let newMsg = `لديك ${count} رسائل جديدة في هذه المحادثة`;
                    await prisma.notification.update({
                        where: { id: existingNotif.id },
                        data: { message: newMsg, time: new Date().toISOString(), senderName }
                    });
                } else {
                    await prisma.notification.create({
                        data: {
                            id: uuidv4(), senderId, receiverId: member.userId, senderName,
                            title: conv.isGroup ? `رسالة جديدة في ${conv.name}` : `رسالة جديدة من ${senderName}`,
                            message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                            type: 'info', time: new Date().toISOString(), read: 0, conversationId
                        }
                    });
                }
            }
        }
    }

    async markAsRead(conversationId, userId) {
        await prisma.notification.updateMany({
            where: { conversationId, receiverId: userId },
            data: { read: 1 }
        });
        return { success: true };
    }
}

module.exports = ChatService;
