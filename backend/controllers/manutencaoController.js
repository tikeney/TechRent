// =============================================
// CONTROLLER DE HISTÓRICO DE MANUTENÇÃO
// =============================================


const db = require('../config/database');

// GET /manutencao - lista todos os registros de manutenção (admin/técnico)
const listar = async (req, res) => {
  try {
    const [linhas] = await db.query(
      'SELECT h.id, h.descricao, h.registrado_em, c.titulo AS chamado_titulo, c.status AS chamado_status, e.nome AS equipamento_nome, e.patrimonio AS equipamento_patrimonio, t.nome AS tecnico_nome FROM historico_manutencao h JOIN chamados c ON c.id = h.chamado_id JOIN equipamentos e ON e.id = h.equipamento_id JOIN usuarios t ON t.id = h.tecnico_id ORDER BY h.registrado_em DESC'
    );

    return res.status(200).json(linhas);
  } catch (error) {
    console.error('[manutencao.listar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// POST /manutencao - registra um reparo em um equipamento (técnico)
// Body esperado: { chamado_id, equipamento_id, descricao }
// Após registrar, atualizar chamados.status para 'resolvido'
// e equipamentos.status para 'operacional'
const registrar = async (req, res) => {
  const { chamado_id, equipamento_id, descricao } = req.body;
  const tecnico_id = req.usuario.id; // ID do técnico logado

  if(!chamado_id || !equipamento_id || !descricao) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: chamado_id, equipamento_id, descricao.' });
  }

  try {
    // Verifica se o chamado existe e está em aberto
    const [chamados] = await db.query('SELECT id, status, equipamento_id FROM chamados WHERE id = ?', [chamado_id]);

    if(chamados.length === 0) {
      return res.status(404).json({ mensagem: 'Chamado não encontrado.' });
    }

    const chamado = chamados[0];

    if(chamado.status === 'resolvido' || chamado.status === 'cancelado') {
      return res.status(400).json({ mensagem: `Chamado já está ${chamado.status}. Não é possível registrar manutenção.` });
    }

    // Verifica se o id do equipamento do chamado corresponde ao equipamento_id fornecido
    if(chamado.equipamento_id !== equipamento_id) {
      return res.status(400).json({ mensagem: 'O equipamento_id fornecido não corresponde ao equipamento do chamado.' });
    }

    // Insere o registro de manutenção
    const [resultado] = await db.query(
      'INSERT INTO historico_manutencao (chamado_id, equipamento_id, tecnico_id, descricao) VALUES (?, ?, ?, ?)',
      [chamado_id, equipamento_id, tecnico_id, descricao]
    );

    // Atualiza o status do chamado para 'resolvido'
    await db.query("UPDATE chamados SET status = 'resolvido', atualizado_em = NOW() WHERE id = ?", [chamado_id]);

    // Atualiza o status do equipamento para 'operacional'
    await db.query("UPDATE equipamentos SET status = 'operacional' WHERE id = ?", [equipamento_id]);

    return res.status(201).json({ 
      mensagem: 'Manutenção registrada com sucesso.', manutencao_id: resultado.insertId });

  } catch (error) {
    console.error('[manutencao.registrar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

module.exports = { listar, registrar };