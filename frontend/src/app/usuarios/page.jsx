'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const nivelCor = {
  admin: 'bg-purple-100 text-purple-700',
  tecnico: 'bg-blue-100 text-blue-700',
  cliente: 'bg-slate-100 text-slate-600',
};

const nivelLabel = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  cliente: 'Cliente',
};

const formVazio = { nome: '', email: '', senha: '', nivel_acesso: 'cliente' };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch {
      setErro('Erro ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/auth/registro', form);
      setSucesso('Usuário cadastrado com sucesso!');
      setModalAberto(false);
      setForm(formVazio);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    if (sucesso) { const t = setTimeout(() => setSucesso(''), 4000); return () => clearTimeout(t); }
  }, [sucesso]);

  useEffect(() => {
    if (erro) { const t = setTimeout(() => setErro(''), 5000); return () => clearTimeout(t); }
  }, [erro]);

  const formatarData = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
          <p className="text-slate-500 text-sm">Gerenciamento de usuários do sistema</p>
        </div>
        <button
          onClick={() => { setForm(formVazio); setModalAberto(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Novo Usuário
        </button>
      </div>

      {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{sucesso}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erro}</div>}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-400">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nível</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${nivelCor[u.nivel_acesso]}`}>
                      {nivelLabel[u.nivel_acesso] || u.nivel_acesso}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatarData(u.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Novo Usuário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Novo Usuário</h2>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                <input type="password" required value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nível de Acesso</label>
                <select value={form.nivel_acesso} onChange={(e) => setForm({ ...form, nivel_acesso: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                  {salvando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
