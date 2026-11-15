// src/routes/profile.routes.js
const router         = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const ProfileService = require('../services/profile.service');
const ProgressService = require('../services/progress.service');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /profile/summary  — perfil completo del usuario autenticado
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const perfil = await ProfileService.getSummary(req.usuario.id_usuario);
    res.json(perfil);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /profile/progress  — progreso de lecciones del usuario autenticado
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const resumen = await ProgressService.getSummary(req.usuario.id_usuario);
    res.json(resumen);
  } catch (err) {
    responderError(res, err);
  }
});

module.exports = router;
