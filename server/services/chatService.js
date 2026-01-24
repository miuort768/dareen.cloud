const { v4: uuidv4 } = require('uuid');

/**
 * Service to handle Chat-related database operations.
 */
class ChatService {
    constructor(db) {
        this.db = db;
    }

    async getProfiles() {
        return await this.db.all('SELECT id, name, username, avatar, status, lastSeen FROM chat_profiles');
    }

    async getAvailableUsers() {
        const teachers = await this.db.all('SELECT id, name, username, "teacher" as type FROM teachers WHERE username IS NOT NULL');
        const admins = await this.db.all('SELECT id, name, username, "admin" as type FROM users');
        const chatProfiles = await this.db.all('SELECT id, name, username, "chat_user" as type FROM chat_profiles');
        return [...teachers, ...admins, ...chatProfiles];
    }

    async getConversations(userId) {
        // Optimized single-query fetch for all conversations with display names
        const convs = await this.db.all(`
            SELECT 
                c.*, 
                CASE 
                    WHEN c.isGroup = 1 THEN c.name 
                    ELSE COALESCE(other_u.name, other_t.name, other_cp.name, 'Unknown User') 
                END as displayName,
                (SELECT content FROM messages WHERE conversationId = c.id ORDER BY timestamp DESC LIMIT 1) as lastMessage,
                (SELECT timestamp FROM messages WHERE conversationId = c.id ORDER BY timestamp DESC LIMIT 1) as lastMessageTime,
                (SELECT COUNT(*) FROM notifications WHERE conversationId = c.id AND receiverId = ? AND read = 0) as unreadCount,
                (SELECT GROUP_CONCAT(userId) FROM conversation_members WHERE conversationId = c.id) as memberIds
            FROM conversations c
            JOIN conversation_members cm_me ON c.id = cm_me.conversationId AND cm_me.userId = ?
            -- For private chats, find the other member
            LEFT JOIN conversation_members cm_other ON c.id = cm_other.conversationId AND c.isGroup = 0 AND cm_other.userId != ?
            LEFT JOIN users other_u ON cm_other.userId = other_u.id
            LEFT JOIN teachers other_t ON cm_other.userId = other_t.id
            LEFT JOIN chat_profiles other_cp ON cm_other.userId = other_cp.id
            GROUP BY c.id
            ORDER BY lastMessageTime DESC
        `, [userId, userId, userId]);

        return convs.map(c => ({
            ...c,
            members: (c.memberIds || '').split(','),
            isGroup: !!c.isGroup,
            unreadCount: c.unreadCount || 0
        }));
    }

    async saveMessage(conversationId, { senderId, senderName, content }) {
        const id = uuidv4();
        await this.db.run(
            'INSERT INTO messages (id, conversationId, senderId, senderName, content) VALUES (?, ?, ?, ?, ?)',
            [id, conversationId, senderId, senderName, content]
        );
        return await this.db.get('SELECT * FROM messages WHERE id = ?', id);
    }

    async updateProfile(id, { name, username, password, avatar }) {
        if (password) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.db.run(
                'UPDATE chat_profiles SET name = ?, username = ?, password = ?, avatar = ? WHERE id = ?',
                [name, username, hashedPassword, avatar, id]
            );
        } else {
            await this.db.run(
                'UPDATE chat_profiles SET name = ?, username = ?, avatar = ? WHERE id = ?',
                [name, username, avatar, id]
            );
        }
        return { success: true };
    }

    async deleteProfile(id) {
        await this.db.run('DELETE FROM chat_profiles WHERE id = ?', id);
        return { success: true };
    }

    async createProfile({ name, username, password, avatar }) {
        const id = uuidv4();
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        await this.db.run(
            'INSERT INTO chat_profiles (id, name, username, password, avatar) VALUES (?, ?, ?, ?, ?)',
            [id, name, username, hashedPassword, avatar || null]
        );
        return { id, name, username, avatar };
    }

    async checkPrivateRequest(members) {
        if (members.length === 2) {
            return await this.db.get(`
                SELECT c.id FROM conversations c
                JOIN conversation_members cm1 ON c.id = cm1.conversationId
                JOIN conversation_members cm2 ON c.id = cm2.conversationId
                WHERE c.isGroup = 0 
                AND cm1.userId = ? 
                AND cm2.userId = ?
                LIMIT 1
            `, [members[0], members[1]]);
        }
        return null;
    }

    async createConversation({ name, isGroup, members, createdBy }) {
        // Check for existing private chat
        if (!isGroup) {
            const existing = await this.checkPrivateRequest(members);
            if (existing) return existing;
        }

        const id = uuidv4();
        await this.db.run(
            'INSERT INTO conversations (id, name, isGroup, createdBy) VALUES (?, ?, ?, ?)',
            [id, name || null, isGroup ? 1 : 0, createdBy]
        );

        for (const userId of members) {
            await this.db.run(
                'INSERT INTO conversation_members (conversationId, userId) VALUES (?, ?)',
                [id, userId]
            );
        }
        return { id, name, isGroup, members };
    }

    async updateConversation(id, { name, members }) {
        if (name !== undefined) {
            await this.db.run('UPDATE conversations SET name = ? WHERE id = ?', [name, id]);
        }
        if (members && Array.isArray(members)) {
            await this.db.run('DELETE FROM conversation_members WHERE conversationId = ?', id);
            for (const userId of members) {
                await this.db.run(
                    'INSERT INTO conversation_members (conversationId, userId) VALUES (?, ?)',
                    [id, userId]
                );
            }
        }
        return { success: true };
    }

    async deleteConversation(id) {
        await this.db.run('DELETE FROM conversations WHERE id = ?', id);
        await this.db.run('DELETE FROM conversation_members WHERE conversationId = ?', id);
        await this.db.run('DELETE FROM messages WHERE conversationId = ?', id);
        return { success: true };
    }

    async deleteAllConversations() {
        await this.db.run('DELETE FROM conversations');
        await this.db.run('DELETE FROM conversation_members');
        await this.db.run('DELETE FROM messages');
        // Optional: clear related notifications too? Maybe better to keep them or clear them.
        // Let's clear notifications related to conversations.
        await this.db.run('DELETE FROM notifications WHERE conversationId IS NOT NULL');
        return { success: true };
    }

    async getMessages(conversationId) {
        return await this.db.all(
            'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
            conversationId
        );
    }

    async sendNotification({ conversationId, senderId, senderName, content }) {
        const members = await this.db.all('SELECT userId FROM conversation_members WHERE conversationId = ?', conversationId);
        const conv = await this.db.get('SELECT name, isGroup FROM conversations WHERE id = ?', conversationId);

        for (const member of members) {
            if (member.userId !== senderId) {
                // Check existing notification
                const existingNotif = await this.db.get(
                    'SELECT id, message FROM notifications WHERE receiverId = ? AND conversationId = ? AND read = 0',
                    [member.userId, conversationId]
                );

                if (existingNotif) {
                    let newMsg = '';
                    if (existingNotif.message.includes('رسائل جديدة')) {
                        const match = existingNotif.message.match(/(\d+)/);
                        const count = match ? parseInt(match[1]) + 1 : 2;
                        newMsg = `لديك ${count} رسائل جديدة في هذه المحادثة`;
                    } else {
                        newMsg = `لديك 2 رسائل جديدة في هذه المحادثة`;
                    }

                    await this.db.run(
                        'UPDATE notifications SET message = ?, time = ?, senderName = ? WHERE id = ?',
                        [newMsg, new Date().toISOString(), senderName, existingNotif.id]
                    );
                } else {
                    const notifId = uuidv4();
                    await this.db.run(
                        `INSERT INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, conversationId) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            notifId,
                            senderId,
                            member.userId,
                            senderName,
                            conv.isGroup ? `رسالة جديدة في ${conv.name}` : `رسالة جديدة من ${senderName}`,
                            content.length > 50 ? content.substring(0, 50) + '...' : content,
                            'info',
                            new Date().toISOString(),
                            0,
                            conversationId
                        ]
                    );
                }
            }
        }
    }

    async markAsRead(conversationId, userId) {
        await this.db.run(
            'UPDATE notifications SET read = 1 WHERE conversationId = ? AND receiverId = ?',
            [conversationId, userId]
        );
        return { success: true };
    }
}

module.exports = ChatService;
