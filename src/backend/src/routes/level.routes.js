// src/routes/level.routes.js
const router       = require('express').Router();
const LevelService = require('../services/level.service');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /levels
router.get('/', verifyToken, async (req, res) => {
  try {
    const niveles = await LevelService.getLevels();
    res.json(niveles);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /levels/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const nivel = await LevelService.getLevelById(req.params.id);
    res.json(nivel);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
