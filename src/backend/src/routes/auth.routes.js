// src/routes/auth.routes.js
const router      = require('express').Router();
const AuthService = require('../services/auth.service');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /auth/recover
router.post('/recover', async (req, res) => {
  try {
    const result = await AuthService.recover(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// DELETE /auth/session
router.delete('/session', verifyToken, async (req, res) => {
  try {
    const result = await AuthService.logout();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
