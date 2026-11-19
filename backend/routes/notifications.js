const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  markAllRead, 
  deleteNotification 
} = require('../controllers/NotificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
