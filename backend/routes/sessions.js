const express = require('express');
const router = express.Router();
const { 
  getSessions, 
  getSessionById, 
  startSession, 
  completeSession 
} = require('../controllers/SessionController');
const { protect } = require('../middleware/auth');

router.get('/', getSessions);
router.get('/:id', getSessionById);

router.post('/:id/start', protect, startSession);
router.post('/:id/complete', protect, completeSession);

module.exports = router;
