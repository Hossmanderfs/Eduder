// src/controllers/lesson.controller.js
const router        = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const LessonService = require('../services/lesson.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /lessons/by-level/:id_nivel — Admin | RF-08
router.get('/by-level/:id_nivel', verifyToken, requireAdmin, async (req, res) => {
  try {
    const lecciones = await LessonService.getLessonsByLevel(req.params.id_nivel);
    res.json(lecciones);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /lessons/all — Admin | RF-08 | E12 - getAllLessons()
// Lista todas las lecciones con sus FK (Nivel) visibles.
// Ruta colocada ANTES de /:id para evitar que "all" sea interpretado como un ID.
router.get('/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const lecciones = await LessonService.getAllLessons();
    res.json(lecciones);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /lessons/:id — CU-03 | RF-08
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const leccion = await LessonService.getLessonById(req.params.id);
    res.json(leccion);
  } catch (err) {
    responderError(res, err);
  }
});

// GET /lessons/:id/content — CU-03 | RF-08, RF-10, RF-11
router.get('/:id/content', verifyToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') await require('../services/progress.service').validarAcceso(req.usuario.id_usuario, req.params.id);
    const contenido = await LessonService.getLessonContent(req.params.id);
    res.json(contenido);
  } catch (err) {
    responderError(res, err);
  }
});

// POST /lessons — Admin | RF-08
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const leccion = await LessonService.createLesson(req.body);
    res.status(201).json(leccion);
  } catch (err) {
    responderError(res, err);
  }
});

// PUT /lessons/:id — Admin | RF-08
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const leccion = await LessonService.updateLesson(req.params.id, req.body);
    res.json(leccion);
  } catch (err) {
    responderError(res, err);
  }
});

// DELETE /lessons/:id — Admin | RF-08
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await LessonService.deleteLesson(req.params.id);
    res.json(result);
  } catch (err) {
    responderError(res, err);
  }
});

module.exports = router;
