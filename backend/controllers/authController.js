// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
  const { nome, email, senha, nivel_acesso } = req.body;
    
    try {
        // 1. Gera o salt e o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        await db.query(
            'INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)',
            [nome, email, hashedPassword, nivel_acesso || 'cliente']
        );
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: error.message });
    }
};

// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    // 1. Busca o usuário pelo e-mail
    const [usuarios] = await db.query(
      'SELECT id, nome, email, senha, nivel_acesso FROM usuarios WHERE email = ?', 
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" });
    }

    const usuario = usuarios[0];

    // 2. Compara a senha informada com o hash do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" });
    }
    
    // 3. Gera o payload do token
    const payload = { 
      id: usuario.id, 
      nome: usuario.nome, 
      email: usuario.email,
      nivel_acesso: usuario.nivel_acesso 
    };

    // 4. Assina o token JWT
    const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET,
        { expiresIn: '9h' }     
    );

    // 5. Retorna o token e os dados básicos do usuário
    return res.json({
        message: "Login realizado com sucesso",
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            nivel_acesso: usuario.nivel_acesso
        }
    });

  } catch (error){
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

// GET /auth/usuarios - lista todos os usuários (apenas admin)
const listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nome, email, nivel_acesso, criado_em FROM usuarios ORDER BY criado_em DESC'
    );
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = { registro, login, listarUsuarios };
