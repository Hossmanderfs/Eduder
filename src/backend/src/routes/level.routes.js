// src/routes/level.routes.js
const router       = require('express').Router();
const LevelService = require('../services/level.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /levels — CU-03 | RF-07, RF-08
router.get('/', verifyToken, async (req, res) => {
  try {
    const niveles = await LevelService.getLevels();
    res.json(niveles);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /levels/:id — CU-03 | RF-07
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const nivel = await LevelService.getLevelById(req.params.id);
    res.json(nivel);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /levels — Admin | RF-07
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const nivel = await LevelService.createLevel(req.body);
    res.status(201).json(nivel);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// PUT /levels/:id — Admin | RF-07
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const nivel = await LevelService.updateLevel(req.params.id, req.body);
    res.json(nivel);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// DELETE /levels/:id — Admin | RF-07
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await LevelService.deleteLevel(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
