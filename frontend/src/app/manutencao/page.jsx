'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ManutencaoPage() {
  const { usuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ chamado_id: '', equipamento_id: '', descricao: '' });
  const [salvando, setSalvando] = useState(false);

  const isTecnico = usuario?.nivel_acesso === 'tecnico';
  const isAdmin = usuario?.nivel_acesso === 'admin';

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/manutencao');
      setHistorico(res.data);
    } catch {
      setErro('Erro ao carregar histórico de manutenção.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    if (isTecnico) {
      api.get('/chamados').then((r) => {
        const abertos = r.data.filter((c) => c.status === 'em_atendimento' || c.status === 'aberto');
        setChamados(abertos);
      }).catch(() => {});
    }
  }, []);

  const abrirModal = () => {
    setForm({ chamado_id: '', equipamento_id: '', descricao: '' });
    setModalAberto(true);
  };

  const handleChamadoChange = (e) => {
    const id = e.target.value;
    const chamado = chamados.find((c) => String(c.id) === String(id));
    // Busca o equipamento_id do chamado via API se não vier no listing
    setForm({ ...form, chamado_id: id, equipamento_id: chamado?.equipamento_id || '' });
    if (id && !chamado?.equipamento_id) {
      api.get(`/chamados/${id}`).then((r) => {
        setForm((prev) => ({ ...prev, equipamento_id: r.data.equipamento_id || '' }));
      }).catch(() => {});
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/manutencao', form);
      setSucesso('Manutenção registrada com sucesso! Chamado marcado como resolvido.');
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao registrar manutenção.');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    if (sucesso) { const t = setTimeout(() => setSucesso(''), 5000); return () => clearTimeout(t); }
  }, [sucesso]);

  useEffect(() => {
    if (erro) { const t = setTimeout(() => setErro(''), 5000); return () => clearTimeout(t); }
  }, [erro]);

  const formatarData = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manutenção</h1>
          <p className="text-slate-500 text-sm">Histórico de reparos e atendimentos técnicos</p>
        </div>
        {isTecnico && (
          <button
            onClick={abrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Registrar Manutenção
          </button>
        )}
      </div>

      {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{sucesso}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erro}</div>}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando histórico...</p>
      ) : historico.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-400">
          Nenhum registro de manutenção encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Chamado</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Equipamento</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Técnico</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historico.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400">{h.id}</td>
                  <td className="px-4 py-3 text-slate-700">#{h.chamado_id}</td>
                  <td className="px-4 py-3 text-slate-600">{h.equipamento_nome || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{h.tecnico_nome || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{h.descricao}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatarData(h.registrado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Registrar Manutenção */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Registrar Manutenção</h2>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chamado *</label>
                <select required value={form.chamado_id} onChange={handleChamadoChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione o chamado</option>
                  {chamados.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id} — {c.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Reparo *</label>
                <textarea required rows={4} value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o que foi feito para resolver o problema..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <p className="text-xs text-slate-400">
                Ao registrar a manutenção, o chamado será automaticamente marcado como <strong>resolvido</strong> e o equipamento voltará ao status <strong>operacional</strong>.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                  {salvando ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
