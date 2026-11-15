// src/controllers/gamification.controller.js
const router               = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const GamificationService  = require('../services/gamification.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const handle = (fn) => async (req, res) => {
  try {
    const r = await fn(req);
    res.status(r && r.__status ? r.__status : 200).json(r && r.__status ? r.body : r);
  } catch (err) {
    responderError(res, err);
  }
};

// GET /gamification/medals
router.get('/medals', verifyToken, async (req, res) => {
  try {
    const medallas = await GamificationService.getMedals(req.usuario.id_usuario);
    res.json(medallas);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /gamification/ranking/:nivel
router.get('/ranking/:nivel', verifyToken, async (req, res) => {
  try {
    const ranking = await GamificationService.getRanking(req.params.nivel, req.usuario.id_usuario);
    res.json(ranking);
  } catch (err) {
    responderError(res, err);
  }
});

// ── Admin | RF-28 — CRUD del catálogo de medallas ───────────────────────────
router.get('/admin/medals', verifyToken, requireAdmin, handle(() => GamificationService.listCatalog()));
router.post('/medals', verifyToken, requireAdmin,
  handle(async req => ({ __status: 201, body: await GamificationService.createMedal(req.body) })));
router.put('/medals/:id', verifyToken, requireAdmin, handle(req => GamificationService.updateMedal(req.params.id, req.body)));
router.delete('/medals/:id', verifyToken, requireAdmin, handle(req => GamificationService.deleteMedal(req.params.id)));

module.exports = router;
