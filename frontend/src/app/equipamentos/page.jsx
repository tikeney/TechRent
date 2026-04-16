'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const statusCor = {
  operacional: 'bg-green-100 text-green-700',
  em_manutencao: 'bg-yellow-100 text-yellow-700',
  desativado: 'bg-red-100 text-red-700',
};

const statusLabel = {
  operacional: 'Operacional',
  em_manutencao: 'Em Manutenção',
  desativado: 'Desativado',
};

const formVazio = { nome: '', categoria: '', patrimonio: '', status: 'operacional', descricao: '' };

export default function EquipamentosPage() {
  const { usuario } = useAuth();
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null); // null = novo, objeto = edição
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);

  const isAdmin = usuario?.nivel_acesso === 'admin';

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
    } catch {
      setErro('Erro ao carregar equipamentos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  };

  const abrirEdicao = (eq) => {
    setEditando(eq);
    setForm({ nome: eq.nome, categoria: eq.categoria || '', patrimonio: eq.patrimonio || '', status: eq.status, descricao: eq.descricao || '' });
    setModalAberto(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/equipamentos/${editando.id}`, form);
        setSucesso('Equipamento atualizado com sucesso!');
      } else {
        await api.post('/equipamentos', form);
        setSucesso('Equipamento cadastrado com sucesso!');
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar equipamento.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id) => {
    if (!confirm('Tem certeza que deseja remover este equipamento?')) return;
    try {
      await api.delete(`/equipamentos/${id}`);
      setSucesso('Equipamento removido.');
      carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao remover equipamento.');
    }
  };

  useEffect(() => {
    if (sucesso) { const t = setTimeout(() => setSucesso(''), 4000); return () => clearTimeout(t); }
  }, [sucesso]);

  useEffect(() => {
    if (erro) { const t = setTimeout(() => setErro(''), 5000); return () => clearTimeout(t); }
  }, [erro]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipamentos</h1>
          <p className="text-slate-500 text-sm">Inventário de equipamentos do laboratório</p>
        </div>
        {isAdmin && (
          <button
            onClick={abrirNovo}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Novo Equipamento
          </button>
        )}
      </div>

      {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{sucesso}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erro}</div>}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando equipamentos...</p>
      ) : equipamentos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-400">
          Nenhum equipamento cadastrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Patrimônio</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                {isAdmin && <th className="text-left px-4 py-3 text-slate-600 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentos.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400">{eq.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{eq.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{eq.categoria || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{eq.patrimonio || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[eq.status]}`}>
                      {statusLabel[eq.status] || eq.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => abrirEdicao(eq)} className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button onClick={() => remover(eq.id)} className="text-xs text-red-500 hover:underline">Remover</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editando ? 'Editar Equipamento' : 'Novo Equipamento'}
            </h2>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                  <input type="text" required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="Ex: Notebook, Projetor"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patrimônio *</label>
                  <input type="text" required value={form.patrimonio} onChange={(e) => setForm({ ...form, patrimonio: e.target.value })}
                    placeholder="Ex: TI-001"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="operacional">Operacional</option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
