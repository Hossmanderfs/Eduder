// src/routes/lesson.routes.js
const router        = require('express').Router();
const LessonService = require('../services/lesson.service');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /lessons/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const leccion = await LessonService.getLessonById(req.params.id);
    res.json(leccion);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /lessons/:id/content
router.get('/:id/content', verifyToken, async (req, res) => {
  try {
    const content = await LessonService.getLessonContent(req.params.id);
    res.json(content);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
