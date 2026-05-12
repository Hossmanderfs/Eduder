// src/routes/tipo.routes.js
// Admin | RF-08 | E12 - FK → TIPO_LECCION
const router      = require('express').Router();
const TipoService = require('../services/tipo.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /types — devuelve todos los tipos de lección para el <select> del formulario
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const tipos = await TipoService.getAll();
    res.json(tipos);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
