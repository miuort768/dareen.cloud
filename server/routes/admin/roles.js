const express = require('express');
const router = express.Router();
const { prisma } = require('../../utils/prisma');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const cache = require('../../services/cacheService');

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                _count: { select: { userRoles: true } },
                permissions: {
                    include: { permission: true },
                },
            },
            orderBy: { id: 'asc' },
        });
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/permissions', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: [{ group: 'asc' }, { id: 'asc' }],
        });
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { name, label, description } = req.body;
        const role = await prisma.role.create({
            data: { name, label, description },
        });
        cache.invalidate('permissions:*');
        res.json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { label, description } = req.body;
        const role = await prisma.role.update({
            where: { id: parseInt(id) },
            data: { label, description },
        });
        res.json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/permissions', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { permissionIds } = req.body;
        await prisma.rolePermission.deleteMany({ where: { roleId: parseInt(id) } });
        if (permissionIds && permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: permissionIds.map(pid => ({
                    roleId: parseInt(id),
                    permissionId: pid,
                    granted: 1,
                })),
            });
        }
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
            include: { permissions: { include: { permission: true } } },
        });
        cache.invalidate('permissions:*');
        res.json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.role.delete({ where: { id: parseInt(id) } });
        cache.invalidate('permissions:*');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/:userId', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const userRoles = await prisma.userRole.findMany({
            where: { userId: req.params.userId },
            include: { role: true },
        });
        res.json(userRoles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/user/:userId', authMiddleware, checkRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleIds } = req.body;
        await prisma.userRole.deleteMany({ where: { userId } });
        if (roleIds && roleIds.length > 0) {
            await prisma.userRole.createMany({
                data: roleIds.map(rid => ({ userId, roleId: rid, model: 'users' })),
            });
        }
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
        cache.invalidate('permissions:*');
        res.json(userRoles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
