'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

function CardResumo({ titulo, valor, cor, icone }) {
  const cores = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };
  return (
    <div className={`border rounded-xl p-5 ${cores[cor] || cores.slate}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{titulo}</p>
          <p className="text-3xl font-bold mt-1">{valor ?? '—'}</p>
        </div>
        <span className="text-3xl">{icone}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState(null);
  const [painel, setPainel] = useState([]);
  const [erro, setErro] = useState('');

  const isAdmin = usuario?.nivel_acesso === 'admin';
  const isTecnico = usuario?.nivel_acesso === 'tecnico';

  useEffect(() => {
    const carregar = async () => {
      try {
        if (isAdmin) {
          const res = await api.get('/dashboard/admin');
          setDados(res.data);
        } else if (isTecnico) {
          const res = await api.get('/dashboard/tecnico');
          setPainel(res.data);
        } else {
          // cliente: busca seus próprios chamados
          const res = await api.get('/chamados');
          setPainel(res.data);
        }
      } catch (err) {
        setErro('Erro ao carregar dados do dashboard.');
      }
    };
    if (usuario) carregar();
  }, [usuario]);

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

  // Monta totais para admin
  const totalChamados = dados?.chamados?.reduce((acc, c) => acc + Number(c.total), 0) ?? 0;
  const totalEquip = dados?.equipamentos?.reduce((acc, e) => acc + Number(e.total), 0) ?? 0;

  const getChamadoTotal = (status) =>
    dados?.chamados?.find((c) => c.status === status)?.total ?? 0;
  const getEquipTotal = (status) =>
    dados?.equipamentos?.find((e) => e.status === status)?.total ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Olá, {usuario?.nome?.split(' ')[0]} 👋
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        {isAdmin && 'Visão geral do sistema — Administrador'}
        {isTecnico && 'Chamados aguardando atendimento'}
        {!isAdmin && !isTecnico && 'Seus chamados abertos'}
      </p>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {erro}
        </div>
      )}

      {/* Cards de resumo — Admin */}
      {isAdmin && dados && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CardResumo titulo="Chamados Abertos" valor={getChamadoTotal('aberto')} cor="yellow" icone="🎫" />
            <CardResumo titulo="Em Atendimento" valor={getChamadoTotal('em_atendimento')} cor="blue" icone="🔧" />
            <CardResumo titulo="Resolvidos" valor={getChamadoTotal('resolvido')} cor="green" icone="✅" />
            <CardResumo titulo="Total de Chamados" valor={totalChamados} cor="slate" icone="📋" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <CardResumo titulo="Equipamentos Operacionais" valor={getEquipTotal('operacional')} cor="green" icone="🖥️" />
            <CardResumo titulo="Em Manutenção" valor={getEquipTotal('em_manutencao')} cor="yellow" icone="⚙️" />
            <CardResumo titulo="Desativados" valor={getEquipTotal('desativado')} cor="red" icone="🚫" />
          </div>
        </>
      )}

      {/* Painel técnico / chamados do cliente */}
      {(isTecnico || (!isAdmin && !isTecnico)) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">
              {isTecnico ? 'Chamados em Aberto' : 'Meus Chamados'}
            </h2>
          </div>
          {painel.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              Nenhum chamado encontrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {painel.map((c) => (
                <div key={c.chamado_id || c.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{c.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.equipamento || c.equipamento_nome} — {c.solicitante || c.cliente_nome}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[c.status]}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                    {c.prioridade && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeCor[c.prioridade]}`}>
                        {c.prioridade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
