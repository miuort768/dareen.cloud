const { prisma } = require('../../utils/prisma');

// In-memory presence map: { userId: { name, role, status, lastSeen, subject } }
const presenceMap = new Map();

function updatePresence(userId, data) {
    presenceMap.set(userId, { ...data, lastSeen: new Date().toISOString() });
}

function removePresence(userId) {
    presenceMap.delete(userId);
}

async function getPresence() {
    const fiveMinAgo = Date.now() - 5 * 60000;
    const online = [];

    for (const [userId, data] of presenceMap.entries()) {
        const lastSeenMs = new Date(data.lastSeen).getTime();
        if (lastSeenMs < fiveMinAgo) {
            presenceMap.delete(userId);
            continue;
        }

        // Check if currently in an active session (teaching)
        let teachingSubject = null;
        try {
            const active = await prisma.activeSession.findFirst({
                where: { teacherId: userId },
                select: { subject: true },
            });
            if (active) teachingSubject = active.subject;
        } catch { /* ignore */ }

        const secondsAgo = Math.floor((Date.now() - lastSeenMs) / 1000);
        let status;
        if (secondsAgo < 30) status = 'online';
        else if (secondsAgo < 120) status = 'away';
        else status = 'offline';

        online.push({
            userId,
            name: data.name,
            role: data.role,
            status,
            teachingSubject,
            lastSeen: data.lastSeen,
            secondsAgo,
        });
    }

    return online.sort((a, b) => a.secondsAgo - b.secondsAgo);
}

module.exports = { updatePresence, removePresence, getPresence };
