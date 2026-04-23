// =============================================
// CONTROLLER DE EQUIPAMENTOS
// =============================================

// Cada função recebe (req, res) e deve retornar uma resposta JSON.

const db = require('../config/database');

const status_validos = ['operacional', 'em_manutencao', 'desativado'];

// GET /equipamentos - lista todos os equipamentos do inventário
const listar = async (req, res) => {
  // Consulta SQL para obter os equipamentos, ordenados por nome
  try {
    const [linhas] = await db.query(
      'SELECT id, nome, categoria, patrimonio, status, descricao FROM equipamentos ORDER BY nome ASC'
    );

    return res.status(200).json(linhas);
  } catch (error) {
    console.error('[equipamentos.listar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// GET /equipamentos/:id - retorna um equipamento pelo ID
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  // Consulta SQL para obter o equipamento pelo ID
  try {
    const [linhas] = await db.query(
      'SELECT id, nome, categoria, patrimonio, status, descricao FROM equipamentos WHERE id = ?',
      [id]
    );

    // Se não encontrar o equipamento, retorna 404
    if(linhas.length === 0){
      return res.status(404).json({ mensagem: 'Equipamento não encontrado.' });
    }

    return res.status(200).json(linhas[0]);
  } catch (error) {
    console.error('[equipamentos.buscarPorId]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// POST /equipamentos - cria um novo equipamento (apenas admin)
const criar = async (req, res) => {
  // 
  const { nome, categoria, patrimonio, status, descricao } = req.body;

  // Validação básica dos campos
  if (!nome || !categoria || !patrimonio || !status) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifica se o n° de patrimônio já existe
    if(patrimonio){
      const [existe] = await db.query('SELECT id FROM equipamentos WHERE patrimonio = ?', [patrimonio]);

      if(existe.length > 0){
        return res.status(400).json({ mensagem: 'Patrimônio já existe.' });
      }
    }

    const [resultado] = await db.query(
      'INSERT INTO equipamentos (nome, categoria, patrimonio, status, descricao) VALUES (?, ?, ?, ?, ?)',
      [nome, categoria || null, patrimonio || null, status, descricao || null]
    );

    return res.status(201).json({
      mensagem: 'Equipamento criado com sucesso.',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('[equipamentos.criar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// PUT /equipamentos/:id - atualiza um equipamento (apenas admin)
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, patrimonio, status, descricao } = req.body;

  if(status && !status_validos.includes(status)){
    return res.status(400).json({ mensagem: 'Status inválido.' });
  }

  try {
    const [linhas] = await db.query(
      'SELECT id FROM equipamentos WHERE id=?',
      [id]
    )

    if(linhas.length === 0){
      return res.status(404).json({ mensagem: 'Equipamento não encontrado.' });
    }

    const campos = [];
    const valores = [];

    if(nome){campos.push('nome = ?'); valores.push(nome);}
    if(categoria){campos.push('categoria = ?'); valores.push(categoria);}
    if(patrimonio){campos.push('patrimonio = ?'); valores.push(patrimonio);}
    if(status){campos.push('status = ?'); valores.push(status);}
    if(descricao){campos.push('descricao = ?'); valores.push(descricao);}

    if(campos.length === 0){
      return res.status(400).json({ mensagem: 'Nenhum campo para atualizar.' });
    }

    const sql = `UPDATE equipamentos SET ${campos.join(', ')} WHERE id = ?`;
    valores.push(id);

    await db.query(sql, valores);
    return res.status(200).json({ mensagem: 'Equipamento atualizado com sucesso.' });
  } catch (error) {
    console.error('[equipamentos.atualizar]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// DELETE /equipamentos/:id - remove um equipamento (apenas admin)
const remover = async (req, res) => {
  const { id } = req.params;

  try {
    const [linhas] = await db.query(
      'SELECT id FROM equipamentos WHERE id=?',
      [id]
    );

    if(linhas.length === 0){
      return res.status(404).json({ mensagem: 'Equipamento não encontrado.' });
    }

    // Verifica se o equipamento desejado está em alguma manutenção
    if(linhas[0].status === 'em_manutencao'){
      return res.status(409).json({ mensagem: 'Não é possível remover um equipamento em manutenção.'});
    }

    await db.query('DELETE FROM equipamentos WHERE id = ?', [id]);
    return res.status(200).json({ mensagem: 'Equipamento removido com sucesso.' });
  } catch (error) {
    console.error('[equipamentos.remover]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };