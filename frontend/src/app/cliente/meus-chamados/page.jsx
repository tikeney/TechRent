"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listarChamados } from "@/lib/api";
import Link from "next/link";

export default function Page() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    const carregarChamados = async () => {
      try {
        const token = localStorage.getItem("token");
        const usuario = localStorage.getItem("usuario");

        if (!token || !usuario) {
          router.push("/login");
          return;
        }

        const dados = await listarChamados(token);
        setChamados(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarChamados();
  }, [router]);

  const getStatusColor = (status) => {
    switch (status) {
      case "aberto":
        return "bg-blue-100 text-blue-800";
      case "em_atendimento":
        return "bg-yellow-100 text-yellow-800";
      case "resolvido":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case "alta":
        return "text-red-600 font-bold";
      case "media":
        return "text-yellow-600 font-semibold";
      case "baixa":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-zinc-600">Carregando seus chamados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Meus Chamados</h1>
            <p className="text-zinc-600">Acompanhe o status de seus chamados de suporte</p>
          </div>
          <Link href="/cliente/abrir-chamado">
            <Button>Novo Chamado</Button>
          </Link>
        </div>

        {erro && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{erro}</p>
            </CardContent>
          </Card>
        )}

        {chamados.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-zinc-600 mb-4">Você ainda não tem nenhum chamado aberto.</p>
              <Link href="/cliente/abrir-chamado">
                <Button>Abrir Primeiro Chamado</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chamados.map((chamado) => (
              <Card key={chamado.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          #{chamado.id} - {chamado.titulo}
                        </CardTitle>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(chamado.status)}`}>
                          {chamado.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <CardDescription>
                        <span className={`inline-block ${getPriorityColor(chamado.prioridade)}`}>
                          Prioridade: {chamado.prioridade.toUpperCase()}
                        </span>
                        {" • "}
                        Equipamento: <strong>{chamado.equipamento_nome}</strong>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-600">Aberto em:</p>
                      <p className="font-semibold">{formatarData(chamado.aberto_em)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Última atualização:</p>
                      <p className="font-semibold">{formatarData(chamado.atualizado_em)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
