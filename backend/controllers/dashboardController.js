// =============================================
// CONTROLLER DE DASHBOARD
// =============================================
// Usa as VIEWS do banco para retornar dados agregados.


const db = require('../config/database');

// GET /dashboard/admin - resumo geral de chamados e equipamentos (apenas admin)
// Usa as views: view_resumo_chamados e view_resumo_equipamentos
const resumoAdmin = async (req, res) => {
  try {
    // Consulta as duas views em paralelo
    const [resumoChamados, resumoEquipamentos] = await Promise.all([
      db.query('SELECT status, total FROM view_resumo_chamados'),
      db.query('SELECT status, total FROM view_resumo_equipamentos')
    ]);

    return res.status(200).json({
      chamados: resumoChamados[0],
      equipamentos: resumoEquipamentos[0]
    });
  } catch (error) {
    console.error('[dashboard.resumoAdmin]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
};

// GET /dashboard/tecnico - chamados abertos/em andamento (técnico/admin)
// Usa a view: view_painel_tecnico
const painelTecnico = async (req, res) => {
  // 
  try {
    // Seleciona os dados da view
    const [linhas] = await db.query('SELECT * FROM view_painel_tecnico');

    return res.status(200).json(linhas);
  } catch (error) {
    console.error('[dashboard.painelTecnico]', error);
    return res.status(500).json({ mensagem: 'Erro no servidor.' })
  }
};

module.exports = { resumoAdmin, painelTecnico };