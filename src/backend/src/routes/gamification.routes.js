// src/routes/gamification.routes.js
const router               = require('express').Router();
const GamificationService  = require('../services/gamification.service');
const { verifyToken }      = require('../middleware/auth.middleware');

// GET /gamification/medals
router.get('/medals', verifyToken, async (req, res) => {
  try {
    const medallas = await GamificationService.getMedals(req.usuario.id_usuario);
    res.json(medallas);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /gamification/ranking/:nivel
router.get('/ranking/:nivel', verifyToken, async (req, res) => {
  try {
    const ranking = await GamificationService.getRanking(req.params.nivel, req.usuario.id_usuario);
    res.json(ranking);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
