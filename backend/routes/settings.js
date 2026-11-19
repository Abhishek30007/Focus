const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/SettingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSettings)
  .patch(updateSettings);

module.exports = router;
