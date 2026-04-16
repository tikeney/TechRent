'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const statusCor = {
  aberto: 'bg-yellow-100 text-yellow-800',
  em_atendimento: 'bg-blue-100 text-blue-800',
  resolvido: 'bg-green-100 text-green-800',
  cancelado: 'bg-slate-100 text-slate-600',
};

const prioridadeCor = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baixa: 'bg-green-100 text-green-700',
};

export default function ChamadosPage() {
  const { usuario } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Modal novo chamado
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', equipamento_id: '', prioridade: 'media' });
  const [salvando, setSalvando] = useState(false);

  // Modal atualizar status
  const [modalStatus, setModalStatus] = useState(null); // chamado selecionado
  const [novoStatus, setNovoStatus] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [tecnicos, setTecnicos] = useState([]);

  const isAdmin = usuario?.nivel_acesso === 'admin';
  const isTecnico = usuario?.nivel_acesso === 'tecnico';
  const isCliente = usuario?.nivel_acesso === 'cliente';

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/chamados');
      setChamados(res.data);
    } catch {
      setErro('Erro ao carregar chamados.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // Carrega equipamentos para o formulário de novo chamado
    if (isAdmin || isCliente) {
      api.get('/equipamentos').then((r) => setEquipamentos(r.data)).catch(() => {});
    }
  }, []);

  const abrirModalStatus = async (chamado) => {
    setModalStatus(chamado);
    setNovoStatus(chamado.status);
    setTecnicoId(chamado.tecnico_id || '');
    // Carrega técnicos se admin
    if (isAdmin) {
      try {
        const res = await api.get('/usuarios?nivel_acesso=tecnico');
        setTecnicos(res.data);
      } catch {
        setTecnicos([]);
      }
    }
  };

  const salvarStatus = async () => {
    setSalvando(true);
    try {
      const body = { status: novoStatus };
      if (tecnicoId) body.tecnico_id = tecnicoId;
      await api.put(`/chamados/${modalStatus.id}/status`, body);
      setSucesso('Status atualizado com sucesso!');
      setModalStatus(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao atualizar status.');
    } finally {
      setSalvando(false);
    }
  };

  const criarChamado = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/chamados', form);
      setSucesso('Chamado aberto com sucesso!');
      setModalAberto(false);
      setForm({ titulo: '', descricao: '', equipamento_id: '', prioridade: 'media' });
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar chamado.');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    if (sucesso) {
      const t = setTimeout(() => setSucesso(''), 4000);
      return () => clearTimeout(t);
    }
  }, [sucesso]);

  useEffect(() => {
    if (erro) {
      const t = setTimeout(() => setErro(''), 5000);
      return () => clearTimeout(t);
    }
  }, [erro]);

  const podeAbrirChamado = isAdmin || isCliente;
  const podeAlterarStatus = isAdmin || isTecnico;

  const statusDisponiveis = {
    aberto: ['em_atendimento', 'cancelado'],
    em_atendimento: ['resolvido', 'cancelado'],
    resolvido: [],
    cancelado: [],
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chamados</h1>
          <p className="text-slate-500 text-sm">
            {isCliente ? 'Seus chamados de suporte' : 'Todos os chamados do sistema'}
          </p>
        </div>
        {podeAbrirChamado && (
          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Novo Chamado
          </button>
        )}
      </div>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {sucesso}
        </div>
      )}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando chamados...</p>
      ) : chamados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-400">
          Nenhum chamado encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Equipamento</th>
                {!isCliente && <th className="text-left px-4 py-3 text-slate-600 font-medium">Solicitante</th>}
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Prioridade</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                {podeAlterarStatus && <th className="text-left px-4 py-3 text-slate-600 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chamados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{c.titulo}</td>
                  <td className="px-4 py-3 text-slate-600">{c.equipamento_nome || '—'}</td>
                  {!isCliente && <td className="px-4 py-3 text-slate-600">{c.cliente_nome || '—'}</td>}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeCor[c.prioridade]}`}>
                      {c.prioridade}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[c.status]}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </td>
                  {podeAlterarStatus && (
                    <td className="px-4 py-3">
                      {statusDisponiveis[c.status]?.length > 0 && (
                        <button
                          onClick={() => abrirModalStatus(c)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Atualizar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Novo Chamado */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Abrir Novo Chamado</h2>
            <form onSubmit={criarChamado} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Descreva brevemente o problema"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipamento *</label>
                <select
                  required
                  value={form.equipamento_id}
                  onChange={(e) => setForm({ ...form, equipamento_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o equipamento</option>
                  {equipamentos
                    .filter((eq) => eq.status === 'operacional')
                    .map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nome} ({eq.patrimonio})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                <select
                  value={form.prioridade}
                  onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Detalhes sobre o problema..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {salvando ? 'Abrindo...' : 'Abrir Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Atualizar Status */}
      {modalStatus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Atualizar Status</h2>
            <p className="text-sm text-slate-500 mb-4">Chamado #{modalStatus.id}: {modalStatus.titulo}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Novo Status</label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={modalStatus.status}>{modalStatus.status.replace('_', ' ')} (atual)</option>
                  {statusDisponiveis[modalStatus.status]?.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              {isAdmin && tecnicos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Atribuir Técnico</label>
                  <select
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sem técnico</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalStatus(null)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarStatus}
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
