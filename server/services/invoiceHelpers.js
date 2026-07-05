const { prisma } = require('../utils/prisma');
const { audit } = require('./auditService');

function parseItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try { return JSON.parse(items); } catch { return []; }
}

function serializeItems(items) {
  if (!items) return null;
  if (typeof items === 'string') return items;
  return JSON.stringify(items);
}

async function invalidateInvoiceCache(cache, keys) {
  if (!cache) return;
  await Promise.all(keys.filter(Boolean).map(k => cache.del(k)));
}

async function auditInvoice(user, action, invoiceType, invoiceId, metadata) {
  const entityType = invoiceType === 'teacher' ? 'TeacherInvoice' : 'StudentInvoice';
  return audit(user.id, user.username, action, metadata, entityType, invoiceId);
}

async function checkExists(model, id, label) {
  const record = await prisma[model].findUnique({ where: { id } });
  if (!record) {
    const err = new Error(`${label} not found`);
    err.statusCode = 404;
    throw err;
  }
  return record;
}

module.exports = { parseItems, serializeItems, invalidateInvoiceCache, auditInvoice, checkExists };
