// =============================================
// CONTROLLER DE USUÁRIOS
// =============================================

const db = require('../config/database');

// GET /usuarios - lista todos os usuários (apenas admin)
const listar = async (req, res) => {
  const { nivel_acesso } = req.query;

  try {
    let sql = 'SELECT id, nome, email, nivel_acesso, criado_em FROM usuarios';
    const params = [];

    if (nivel_acesso) {
      sql += ' WHERE nivel_acesso = ?';
      params.push(nivel_acesso);
    }

    sql += ' ORDER BY nome ASC';

    const [linhas] = await db.query(sql, params);
    return res.status(200).json(linhas);
  } catch (error) {
    console.error('[usuarios.listar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

module.exports = { listar };
