const express = require('express');
const router = express.Router();
const { 
  getDailyProgress, 
  getWeeklyProgress, 
  getMonthlyProgress 
} = require('../controllers/ProgressController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/daily', getDailyProgress);
router.get('/weekly', getWeeklyProgress);
router.get('/monthly', getMonthlyProgress);

module.exports = router;
