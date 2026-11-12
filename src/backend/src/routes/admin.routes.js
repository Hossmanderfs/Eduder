// src/routes/admin.routes.js
const router        = require('express').Router();
const AdminService  = require('../services/admin.service');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// Todas las rutas admin requieren token + rol admin
router.use(verifyToken, requireAdmin);

// GET /admin/users?rol=&estado=
router.get('/users', async (req, res) => {
  try {
    const usuarios = await AdminService.getUsers(req.query);
    res.json(usuarios);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// PATCH /admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const usuario = await AdminService.updateUser(req.params.id, req.body);
    res.json(usuario);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /admin/metrics?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await AdminService.getMetrics(req.query);
    res.json(metrics);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /admin/metrics/export?desde=&hasta=  → archivo CSV (RF-22)
router.get('/metrics/export', async (req, res) => {
  try {
    const csv = await AdminService.exportMetricsCsv(req.query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kpis_eduder.csv"');
    res.send(csv);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
