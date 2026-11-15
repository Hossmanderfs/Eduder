// src/routes/progress.routes.js
const router          = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const ProgressService = require('../services/progress.service');
const { verifyToken } = require('../middleware/auth.middleware');

// PUT /progress/:id_leccion
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const progreso = await ProgressService.updateProgress(req.params.id, req.body, req.usuario.id_usuario);
    res.json(progreso);
  } catch (err) {
    responderError(res, err);
  }
});

module.exports = router;
