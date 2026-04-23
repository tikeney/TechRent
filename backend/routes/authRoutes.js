// =============================================
// ROTAS DE AUTENTICAÇÃO
// =============================================
// Rotas públicas — não exigem token JWT.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar, autorizar } = require('../middlewares/auth');

// POST /auth/registro - cria uma conta
router.post('/registro', authController.registro);

// POST /auth/login - autentica e retorna o token JWT
router.post('/login', authController.login);

// GET /auth/usuarios - lista todos os usuários (apenas admin)
router.get('/usuarios', autenticar, autorizar('admin'), authController.listarUsuarios);

module.exports = router;
