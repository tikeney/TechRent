const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth');
const { listar } = require('../controllers/usuariosController');

// GET /usuarios - apenas admin
router.get('/', autenticar, autorizar('admin'), listar);

module.exports = router;
