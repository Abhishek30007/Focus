const express = require('express');
const router = express.Router();
const metricsController = require('../../controllers/v1/MetricsController');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { pacerSchema } = require('../../validation/schemas');

// 10. GET /api/v1/metrics/trends (Aggregated weekly/monthly HRV and calm deltas for dashboard)
router.get('/trends', authenticate, metricsController.getTrends);

// Pacer calculation endpoint
router.post('/pacer', authenticate, validate(pacerSchema), metricsController.getPacer);

module.exports = router;

