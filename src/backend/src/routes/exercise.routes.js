// src/routes/exercise.routes.js
const router          = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const ExerciseService = require('../services/exercise.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const handle = (fn) => async (req, res) => {
  try {
    const r = await fn(req);
    res.status(r && r.__status ? r.__status : 200).json(r && r.__status ? r.body : r);
  } catch (err) {
    responderError(res, err);
  }
};

// POST /exercise/answer
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const resultado = await ExerciseService.evaluate(req.body);
    res.json(resultado);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /exercise/:id/hint?numero=1
router.get('/:id/hint', verifyToken, async (req, res) => {
  try {
    const pista = await ExerciseService.getHint(req.params.id, req.query.numero || 1);
    res.json(pista);
  } catch (err) {
    responderError(res, err);
  }
});

// ── Admin | RF-27 — CRUD de ejercicios ──────────────────────────────────────
// GET /exercise/by-lesson/:id_leccion  (incluye respuesta_correcta y pistas)
router.get('/by-lesson/:id_leccion', verifyToken, requireAdmin,
  handle(req => ExerciseService.listByLesson(req.params.id_leccion)));

// POST /exercise
router.post('/', verifyToken, requireAdmin,
  handle(async req => ({ __status: 201, body: await ExerciseService.createExercise(req.body) })));

// PUT /exercise/:id
router.put('/:id', verifyToken, requireAdmin,
  handle(req => ExerciseService.updateExercise(req.params.id, req.body)));

// DELETE /exercise/:id
router.delete('/:id', verifyToken, requireAdmin,
  handle(req => ExerciseService.deleteExercise(req.params.id)));

module.exports = router;
