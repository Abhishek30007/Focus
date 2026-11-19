const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount 
} = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all profile endpoints

router.route('/me')
  .get(getUserProfile)
  .patch(updateUserProfile)
  .delete(deleteUserAccount);

module.exports = router;
