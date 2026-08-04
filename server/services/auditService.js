const crypto = require('crypto');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');
const { AUDIT_ACTIONS, isValidAction } = require('../constants/auditActions');
const { AUDIT_STATUS, isValidStatus } = require('../constants/auditStatus');

function getAuditMode() {
  return (process.env.AUDIT_MODE || 'direct').toLowerCase();
}

function isQueueMode() {
  return getAuditMode() === 'queue';
}

let fallbackWrites = 0;

function getFallbackWrites() {
  return fallbackWrites;
}

function generateEventId() {
  return crypto.randomUUID();
}

async function writeToQueue(entry) {
  const { enqueue } = require('../queue/auditQueue');
  return enqueue(entry);
}

async function writeDirect(entry) {
  await prisma.auditLog.create({ data: entry });
}

const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'password_hash',
  'token', 'jwt', 'accessToken', 'refreshToken',
  'authorization', 'cookie',
  'secret', 'apiKey', 'api_key',
  'otp', 'pin',
]);

const CRITICAL_ACTIONS = new Set([
  AUDIT_ACTIONS.ROLE_CHANGED,
  AUDIT_ACTIONS.PERMISSION_GRANTED,
  AUDIT_ACTIONS.PERMISSION_REVOKED,
  AUDIT_ACTIONS.TEACHER_DELETED,
  AUDIT_ACTIONS.STUDENT_DELETED,
  AUDIT_ACTIONS.PARENT_DELETED,
  AUDIT_ACTIONS.USER_DELETED,
  AUDIT_ACTIONS.ACCOUNT_CUTOVER,
  AUDIT_ACTIONS.REFUND_PROCESSED,
  AUDIT_ACTIONS.INVOICE_PAID,
]);

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const sanitized = Array.isArray(metadata) ? [...metadata] : { ...metadata };
  for (const key of Object.keys(sanitized)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower) || SENSITIVE_KEYS.has(key)) {
      delete sanitized[key];
      continue;
    }
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMetadata(sanitized[key]);
    }
  }
  return sanitized;
}

function isCriticalAction(action) {
  return CRITICAL_ACTIONS.has(action);
}

async function createAuditEntry({
  action,
  status = AUDIT_STATUS.SUCCESS,
  accountId = null,
  userId = null,
  username = null,
  entityType = null,
  entityId = null,
  ipAddress = null,
  userAgent = null,
  requestId = null,
  metadata = null,
  details = null,
}) {
  const sanitized = sanitizeMetadata(metadata);

  if (!isValidAction(action)) {
    const msg = `Invalid audit action: ${action}`;
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      throw new Error(msg);
    }
    logger.warn(msg);
    return;
  }

  const finalStatus = isValidStatus(status) ? status : AUDIT_STATUS.SUCCESS;

  const entry = {
    eventId: generateEventId(),
    action,
    status: finalStatus,
    accountId,
    userId,
    username,
    entityType,
    entityId: entityId != null ? String(entityId) : null,
    ipAddress,
    userAgent,
    requestId,
    metadata: sanitized,
    details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
  };

  if (isQueueMode() && !isCriticalAction(action)) {
    try {
      await writeToQueue(entry);
      return;
    } catch (queueErr) {
      fallbackWrites++;
      logger.warn('Audit queue fallback to direct write', { action, error: queueErr.message });
    }
  }

  try {
    await writeDirect(entry);
  } catch (err) {
    logger.error('Audit log database error', err, { action });
    if (isCriticalAction(action)) {
      throw err;
    }
  }
}

async function log(userId, username, action, details = null, entityType = null, entityId = null) {
  await createAuditEntry({
    userId,
    username,
    action,
    details,
    entityType,
    entityId,
  });
}

async function logWithRequest(req, {
  action,
  status = AUDIT_STATUS.SUCCESS,
  entityType = null,
  entityId = null,
  metadata = null,
  details = null,
}) {
  const actor = req.user || {};
  const result = createAuditEntry({
    action,
    status,
    accountId: actor.accountId || actor.id || null,
    userId: actor.id || null,
    username: actor.username || null,
    entityType,
    entityId,
    ipAddress: req.ip || null,
    userAgent: req.headers?.['user-agent'] || null,
    requestId: req.requestId || null,
    metadata,
    details,
  });
  if (isCriticalAction(action)) {
    await result;
  } else {
    void result.catch((err) => logger.error('Non-critical audit log failed', err));
  }
}

const logMiddleware = (action, entityType, getDetails) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode < 400 && req.user) {
      const details = getDetails ? getDetails(req, body) : null;
      const entityId = req.params.id || body?.id || null;
      logWithRequest(req, { action, entityType, entityId, details }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};

module.exports = {
  audit: log,
  log,
  logWithRequest,
  logMiddleware,
  sanitizeMetadata,
  isCriticalAction,
  getAuditMode,
  isQueueMode,
  getFallbackWrites,
  ACTION_TYPES: AUDIT_ACTIONS,
  AUDIT_ACTIONS,
  AUDIT_STATUS,
};
