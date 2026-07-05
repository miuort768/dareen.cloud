const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const { getOverview } = require('../services/monitoringService');
const ResponseHandler = require('../utils/responseHandler');

router.get('/overview', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const overview = await getOverview();
    res.json(overview);
  } catch (err) {
    ResponseHandler.serverError(res, err, 'Monitoring overview error');
  }
});

module.exports = { monitoringRouter: router };
