// =============================================
// CONTROLLER DE CHAMADOS
// =============================================

//
// Fluxo de status:
//   aberto -> em_atendimento -> resolvido
//                           -> cancelado

const db = require('../config/database');

// Todos os status possíveis
const status_validos = ['aberto', 'em_atendimento', 'resolvido', 'cancelado'];

// GET /chamados - lista chamados
//   admin/técnico -> todos os chamados
//   cliente       -> apenas os seus (WHERE cliente_id = req.usuario.id)
const listar = async (req, res) => {
  const { nivel_acesso, id } = req.usuario;

  try {
    let linhas;

    // Seleciona todos os chamados para o admin e o tecnico
    if (nivel_acesso === 'admin' || nivel_acesso === 'tecnico') {
      [linhas] = await db.query(
        'SELECT c.id, c.titulo, c.prioridade, c.status, c.aberto_em, c.atualizado_em, u.nome AS cliente_nome, e.nome AS equipamento_nome, t.nome AS tecnico_nome FROM chamados c JOIN usuarios u ON u.id=c.cliente_id JOIN equipamentos e ON e.id=c.equipamento_id LEFT JOIN usuarios t ON t.id=c.tecnico_id ORDER BY c.prioridade DESC, c.aberto_em DESC'
      );
      return res.status(200).json(linhas);
    }
    // Seleciona somente os chamados do cliente
    else {
      [linhas] = await db.query(
        'SELECT c.id, c.titulo, c.status, c.prioridade, c.aberto_em, c.atualizado_em, e.nome AS equipamento_nome FROM chamados c JOIN equipamentos e ON  e.id=c.equipamento_id WHERE c.cliente_id=? ORDER BY c.aberto_em DESC',
        [id]
      );
      return res.status(200).json(linhas);
    }
  } catch (error) {
    console.error('[chamados.listar]', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// GET /chamados/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {
  // TODO
  const { id: chamado_id } = req.params;
  const { nivel_acesso, id: usuario_id } = req.usuario;

  try {
    // Seleciona o chamado de acordo com o Id procurado
    const [linhas] = await db.query(
      'SELECT c.id, c.titulo, c.descricao, c.status, c.prioridade, c.aberto_em, c.atualizado_em, c.cliente_id, u.nome  AS cliente_nome, e.nome  AS equipamento_nome, t.nome  AS tecnico_nome FROM chamados c JOIN usuarios     u ON u.id = c.cliente_id JOIN equipamentos e ON e.id = c.equipamento_id LEFT JOIN usuarios t ON t.id = c.tecnico_id WHERE c.id = ?',
      [chamado_id]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ mensagem: 'Chamado não encontrado' });
    }

    const chamado = linhas[0];

    if (nivel_acesso === "cliente" && chamado.cliente_id !== usuario_id) {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    return res.status(200).json(chamado)

  } catch (error) {
    console.error('[chamados.buscarPorId]', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }

};

// POST /chamados - abre um novo chamado (cliente/admin)
// Body esperado: { titulo, descricao, equipamento_id, prioridade }
const criar = async (req, res) => {
  // Corpo da requisição
  const { titulo, descricao, equipamento_id, prioridade } = req.body;
  const cliente_id = req.usuario.id;

  // Validação dos campos obrigatórios
  if (!titulo || !descricao || !equipamento_id || !prioridade) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Procura o equipamento
    const [equip] = await db.query('SELECT id, status FROM equipamentos WHERE id = ?',
      [equipamento_id]
    );

    // Verifica se o equipamento existe
    if (equip.length === 0) {
      return res.status(404).json({ mensagem: 'Equipamento não encontrado.' })
    }

    // Verifica se já existe chamado para ele
    if (equip[0].status === 'em_manutencao') {
      return res.status(409).json({ mensagem: 'Equipamento já está em manutenção.' });
    }

    // Inserindo chamado no BD
    const [chamado] = await db.query("INSERT INTO chamados (titulo, descricao, equipamento_id, cliente_id, prioridade, status) VALUES (?, ?, ?, ?, ?, 'aberto')",
      [titulo, descricao, equipamento_id, cliente_id, prioridade]
    );

    await db.query("UPDATE equipamentos SET status = 'em_manutencao' WHERE id = ?",
      [equipamento_id]
    );

    return res.status(201).json({
      mensagem: 'Chamado criado com sucesso!',
      id: chamado.insertId
    });
  } catch (error) {
    console.error('[chamados.criar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// PUT /chamados/:id/status - atualiza o status do chamado (técnico/admin)
// Body esperado: { status, tecnico_id (opcional) }
// Todas as mudanças possíveis
const transicoes = {
  'aberto': ['em_atendimento', 'cancelado'],
  'em_atendimento': ['resolvido', 'cancelado'],
  'resolvido': [],
  'cancelado': []
}
const atualizarStatus = async (req, res) => {
  const { id: chamado_id } = req.params;
  const { status, tecnico_id } = req.body;

  if (!status) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
  }

  if (!status_validos.includes(status)) {
    return res.status(400).json({
      mensagem: `Status inválido. Use: ${status_validos.join(', ')}.`
    });
  }

  try {
    // Busca chamado atual
    const [linhas] = await db.query(
      'SELECT id, status, equipamento_id FROM chamados WHERE id = ?',
      [chamado_id]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ mensagem: 'Chamado não encontrado.' });
    }

    const chamado = linhas[0]

    // Valida a transição
    const transicoesPermitidas = transicoes[chamado.status];

    if (!transicoesPermitidas.includes(status)) {
      return res.status(400).json({
        erro: `Transição inválida: '${chamado.status}' → '${status}'. Permitidas: ${transicoesPermitidas.join(', ') || 'nenhuma'}.`,
      });
    }

    // Atualiza os campos
    const campos = ['status=?', 'atualizado_em = NOW()'];
    const valores = [status];

    if (tecnico_id) {
      campos.push('tecnico_id = ?')
      valores.push(tecnico_id)
    }

    valores.push(chamado_id);

    await db.query(
      `UPDATE chamados SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    // Se o status for = resolvido, libera o equipamento da manutenção
    if (status === 'resolvido') {
      await db.query(
        "UPDATE equipamentos SET status = 'operacional' WHERE id = ?",
        [chamado.equipamento_id]
      );
    }

    return res.status(200).json({ mensagem: `Status atualizado para '${status}'.` });


  } catch (error) {
    console.error('[chamados.atualizarStatus]', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }

};

module.exports = { listar, buscarPorId, criar, atualizarStatus };