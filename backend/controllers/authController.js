// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
    const { nome, email, senha, nivel_acesso } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    try {
        // Verifica se o usuário já existe
        const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(400).json({ error: "Este e-mail já está em uso" });
        }

        // Gera o salt e o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        await db.query(
            'INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)',
            [nome, email, hashedPassword, nivel_acesso || 'cliente']
        );
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    try {
        // Busca o usuário pelo e-mail
        const [usuarios] = await db.query(
            'SELECT id, nome, email, senha, nivel_acesso FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        const usuario = usuarios[0];

        // Compara a senha informada com a senha (hash) do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        // Gera o token JWT
        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            nivel_acesso: usuario.nivel_acesso
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'chave_mestra_secreta', // Fallback se não houver .env
            { expiresIn: '9h' }
        );

        // Retorna o token e os dados do usuário (exceto a senha)
        res.json({
            message: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};

module.exports = { registro, login };
