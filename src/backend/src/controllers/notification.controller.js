// src/controllers/notification.controller.js
const router = require('express').Router();
const { responderError } = require('../middleware/errorHandler');
const NotificationService = require('../services/notification.service');
const { verifyToken } = require('../middleware/auth.middleware');

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    responderError(res, err);
  }
};

// GET /notifications?solo_no_leidas=true&limit=50
router.get('/', verifyToken, handle(req => NotificationService.list(req.usuario.id_usuario, req.query)));
// PATCH /notifications/read-all
router.patch('/read-all', verifyToken, handle(req => NotificationService.markAllRead(req.usuario.id_usuario)));
// PATCH /notifications/:id/read
router.patch('/:id/read', verifyToken, handle(req => NotificationService.markRead(req.usuario.id_usuario, req.params.id)));

module.exports = router;
