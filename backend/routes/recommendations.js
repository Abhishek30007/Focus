const express = require('express');
const router = express.Router();
const { 
  getRecommendations, 
  createPersonalizedRecommendations 
} = require('../controllers/RecommendationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRecommendations)
  .post(createPersonalizedRecommendations);

module.exports = router;
