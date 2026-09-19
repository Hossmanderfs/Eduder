// src/routes/lesson.routes.js
const router        = require('express').Router();
const LessonService = require('../services/lesson.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /lessons/by-level/:id_nivel — Admin | RF-08
router.get('/by-level/:id_nivel', verifyToken, requireAdmin, async (req, res) => {
  try {
    const lecciones = await LessonService.getLessonsByLevel(req.params.id_nivel);
    res.json(lecciones);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /lessons/all — Admin | RF-08 | E12 - getAllLessons()
// Lista todas las lecciones con sus FK (Nivel, TipoLeccion) visibles.
// Ruta colocada ANTES de /:id para evitar que "all" sea interpretado como un ID.
router.get('/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const lecciones = await LessonService.getAllLessons();
    res.json(lecciones);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /lessons/:id — CU-03 | RF-08
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const leccion = await LessonService.getLessonById(req.params.id);
    res.json(leccion);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /lessons/:id/content — CU-03 | RF-08, RF-10, RF-11
router.get('/:id/content', verifyToken, async (req, res) => {
  try {
    const contenido = await LessonService.getLessonContent(req.params.id);
    res.json(contenido);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /lessons — Admin | RF-08
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const leccion = await LessonService.createLesson(req.body);
    res.status(201).json(leccion);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// PUT /lessons/:id — Admin | RF-08
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const leccion = await LessonService.updateLesson(req.params.id, req.body);
    res.json(leccion);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// DELETE /lessons/:id — Admin | RF-08
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await LessonService.deleteLesson(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
