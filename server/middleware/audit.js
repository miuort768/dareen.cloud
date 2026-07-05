const { v4: uuidv4 } = require('uuid');
const { logWithRequest } = require('../services/auditService');

function auditMiddleware(req, res, next) {
  req.requestId = uuidv4();

  res.setHeader('X-Request-ID', req.requestId);

  req.audit = (opts) => logWithRequest(req, opts);

  next();
}

module.exports = { auditMiddleware };
