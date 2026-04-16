// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================
// TODO (alunos): implementar as funções registro e login.
//
// Dicas:
//   - Use bcryptjs para criptografar a senha antes de salvar (registro)
//   - Use bcryptjs para comparar a senha no login (bcrypt.compare)
//   - Use jsonwebtoken (jwt.sign) para gerar o token após login bem-sucedido
//   - O payload do token deve ter: id, nome, email, nivel_acesso
//   - NUNCA coloque a senha no payload do token!

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
  const { nome, email, senha, nivel_acesso } = req.body;
    
    // 1. Gera o salt e o hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    try {
        await db.query(
            'INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)',
            [nome, email, hashedPassword, nivel_acesso]
        );
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
  // TODO
  const { email, senha } = req.body
  try {

    const senhadb = await db.query(
      'SELECT senha FROM usuarios where email = ?', [email]
      
    ) 

    const senhaValida = await bcrypt.compare(senha, senhadb)
    if (!senhaValida) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" })
    }
    
    const payload = { 
      id: usuario.id, 
      nome: usuario.nome, 
      nivel_acesso: usuario.nivel_acesso 
    };

    const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET,
        { expiresIn: '9h' }     
      );
  } catch (erro){
    console.error("Erro no login:", error)
    return res.status(500).json({ error: "Erro interno no servidor" })
  }

  

  
}

module.exports = { registro, login };
