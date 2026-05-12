// src/routes/exercise.routes.js
const router          = require('express').Router();
const ExerciseService = require('../services/exercise.service');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /exercise/answer
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const resultado = await ExerciseService.evaluate(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /exercise/:id/hint?numero=1
router.get('/:id/hint', verifyToken, async (req, res) => {
  try {
    const pista = await ExerciseService.getHint(req.params.id, req.query.numero || 1);
    res.json(pista);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
