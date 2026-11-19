const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/v1/SessionController');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  generateSessionSchema,
  startSessionSchema,
  completeSessionSchema
} = require('../../validation/schemas');

// 5. POST /api/v1/sessions/generate (Trigger Gemini session script workflow)
router.post('/generate', authenticate, validate(generateSessionSchema), sessionController.generate);

// 6. POST /api/v1/sessions/start (Record session initiation and baseline biomarkers)
router.post('/start', authenticate, validate(startSessionSchema), sessionController.start);

// 7. PUT /api/v1/sessions/:id/complete (Finalize session, exit biomarkers, Gemini summary)
router.put('/:id/complete', authenticate, validate(completeSessionSchema), sessionController.complete);

// 8. GET /api/v1/sessions (Paginated user session history with lean queries & projection)
router.get('/', authenticate, sessionController.getAll);

// 9. GET /api/v1/sessions/:id (Fetch single session details with DTO transformation)
router.get('/:id', authenticate, sessionController.getById);

module.exports = router;

