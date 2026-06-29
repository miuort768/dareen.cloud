const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const ResponseHandler = require('../utils/responseHandler');
const { prisma } = require('../utils/prisma');
const { audit } = require('../services/auditService');

router.use(authMiddleware);
router.use(checkRole(['admin']));

router.get('/', async (req, res) => {
    try {
        const currencies = await prisma.currency.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(currencies);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Currencies route error');
    }
});

router.post('/', async (req, res) => {
    const { code, name, symbol, sortOrder } = req.body;
    try {
        const currency = await prisma.currency.create({
            data: { code, name, symbol, sortOrder: sortOrder || 0 }
        });
        await audit(req.user.id, req.user.username, 'CURRENCY_CREATE', { code, name, symbol }, 'currency', code);
        res.status(201).json(currency);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Currencies route error');
    }
});

router.put('/:code', async (req, res) => {
    const { code } = req.params;
    const { name, symbol, isActive, sortOrder } = req.body;
    try {
        const currency = await prisma.currency.update({
            where: { code },
            data: { name, symbol, isActive, sortOrder }
        });
        await audit(req.user.id, req.user.username, 'CURRENCY_UPDATE', { code, ...req.body }, 'currency', code);
        res.json(currency);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Currencies route error');
    }
});

router.delete('/:code', async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.currency.delete({ where: { code } });
        await audit(req.user.id, req.user.username, 'CURRENCY_DELETE', { code }, 'currency', code);
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Currencies route error');
    }
});

router.get('/exchange-rates', async (req, res) => {
    try {
        const rates = await prisma.exchangeRate.findMany({
            orderBy: { effectiveDate: 'desc' },
            take: 200,
        });
        res.json(rates);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Exchange rates route error');
    }
});

router.post('/exchange-rates', async (req, res) => {
    const { fromCurrency, toCurrency, buyRate, sellRate, effectiveDate, notes } = req.body;
    try {
        const rate = await prisma.exchangeRate.create({
            data: {
                fromCurrency, toCurrency,
                buyRate: parseFloat(buyRate),
                sellRate: parseFloat(sellRate),
                effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
                notes, createdBy: req.user.username,
            }
        });
        await audit(req.user.id, req.user.username, 'EXCHANGE_RATE_CREATE', { fromCurrency, toCurrency, buyRate, sellRate }, 'exchange_rate', null);
        res.status(201).json(rate);
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Exchange rates route error');
    }
});

router.delete('/exchange-rates/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.exchangeRate.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (err) {
        ResponseHandler.serverError(res, err, 'Exchange rates route error');
    }
});

module.exports = { currenciesRouter: router };
