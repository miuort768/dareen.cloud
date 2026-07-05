const express = require('express');
const router = express.Router();
const { prisma } = require('../utils/prisma');
const { getAuthMode } = require('../services/authAccounts');
const { getAuditMode } = require('../services/auditService');
const ResponseHandler = require('../utils/responseHandler');

function getFeatureFlags() {
  return {
    authMode: getAuthMode(),
    auditMode: getAuditMode(),
    passwordResetEnabled: true,
    version: '3.2',
  };
}

router.get('/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
  const checks = {};

  // DB connectivity
  try {
    const start = Date.now();
    await prisma.$queryRawUnsafe('SELECT 1');
    checks.database = { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    checks.database = { status: 'error', error: err.message };
  }

  // Auth readiness
  try {
    checks.auth = {
      status: 'ok',
      mode: getAuthMode(),
    };
  } catch (err) {
    checks.auth = { status: 'error', error: err.message };
  }

  // Feature flags
  checks.featureFlags = getFeatureFlags();

  const allOk = Object.values(checks).every(c => c.status === 'ok');
  const statusCode = allOk ? 200 : 503;

  res.status(statusCode).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

router.get('/flags', (req, res) => {
  res.json(getFeatureFlags());
});

module.exports = { healthRouter: router };
