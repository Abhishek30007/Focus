const express = require('express');
const router = express.Router();
const traditionController = require('../../controllers/v1/TraditionController');

// 11. GET /api/v1/traditions (List Vedic practices with metadata and pacing templates)
router.get('/', traditionController.getAll);

// GET /api/v1/traditions/:id
router.get('/:id', traditionController.getById);

module.exports = router;

