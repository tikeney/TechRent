"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";
const API = API_URL;

const statusLabel = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const statusColor = {
  aberto: "bg-blue-100 text-blue-700",
  em_atendimento: "bg-yellow-100 text-yellow-700",
  resolvido: "bg-green-100 text-green-700",
  cancelado: "bg-gray-100 text-gray-600",
};

const prioridadeColor = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baixa: "bg-green-100 text-green-700",
};

export default function AtenderChamado() {
  const { id } = useParams();
  const router = useRouter();
  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descricaoReparo, setDescricaoReparo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processando, setProcessando] = useState(false);

  const getToken = () => localStorage.getItem("techrent_token");
  const getUser = () => JSON.parse(localStorage.getItem("techrent_user") || "{}");

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || (user.nivel_acesso !== "tecnico" && user.nivel_acesso !== "admin")) {
      router.push("/login");
      return;
    }
    carregarChamado();
  }, [id, router]);

  const carregarChamado = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/chamados/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Chamado não encontrado.");
      const data = await res.json();
      setChamado(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (novoStatus) => {
    setErro("");
    setSucesso("");
    setProcessando(true);
    try {
      const user = getUser();
      const body = { status: novoStatus };
      if (novoStatus === "em_atendimento") {
        body.tecnico_id = user.id;
      }
      const res = await fetch(`${API}/chamados/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || data.erro || "Erro ao atualizar status.");
      setSucesso(`Status atualizado para "${statusLabel[novoStatus]}".`);
      await carregarChamado();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  const registrarManutencao = async (e) => {
    e.preventDefault();
    if (!descricaoReparo.trim()) {
      setErro("Descreva o que foi feito no reparo.");
      return;
    }
    setErro("");
    setSucesso("");
    setProcessando(true);
    try {
      const res = await fetch(`${API}/manutencao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          chamado_id: chamado.id,
          equipamento_id: chamado.equipamento_id || chamado.id,
          descricao: descricaoReparo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao registrar manutenção.");
      setSucesso("Manutenção registrada e chamado resolvido com sucesso!");
      setDescricaoReparo("");
      await carregarChamado();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando chamado...</div>;

  if (!chamado && erro) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{erro}</div>
        <Button className="mt-4" onClick={() => router.push("/tecnico")}>← Voltar</Button>
      </div>
    );
  }

  const podeIniciar = chamado?.status === "aberto";
  const podeRegistrarReparo = chamado?.status === "em_atendimento";
  const podeCancelar = chamado?.status === "aberto" || chamado?.status === "em_atendimento";
  const finalizado = chamado?.status === "resolvido" || chamado?.status === "cancelado";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Atender Chamado #{id}</h1>
          <p className="text-muted-foreground mt-1">Detalhes e ações do chamado</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/tecnico")}>
          ← Voltar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {sucesso}
        </div>
      )}

      {chamado && (
        <>
          {/* Detalhes do chamado */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{chamado.titulo}</CardTitle>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prioridadeColor[chamado.prioridade] || ""}`}>
                    {chamado.prioridade?.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[chamado.status] || ""}`}>
                    {statusLabel[chamado.status] || chamado.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Solicitante</p>
                  <p className="font-semibold">{chamado.cliente_nome}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Equipamento</p>
                  <p className="font-semibold">{chamado.equipamento_nome}</p>
                </div>
                {chamado.tecnico_nome && (
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Técnico Responsável</p>
                    <p className="font-semibold">{chamado.tecnico_nome}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Aberto em</p>
                  <p>{chamado.aberto_em ? new Date(chamado.aberto_em).toLocaleString("pt-BR") : "-"}</p>
                </div>
                {chamado.atualizado_em && (
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Última atualização</p>
                    <p>{new Date(chamado.atualizado_em).toLocaleString("pt-BR")}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground font-medium mb-1 text-sm">Descrição do Problema</p>
                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  {chamado.descricao || "Sem descrição."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações disponíveis */}
          {!finalizado && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {podeIniciar && (
                    <Button
                      onClick={() => atualizarStatus("em_atendimento")}
                      disabled={processando}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Iniciar Atendimento
                    </Button>
                  )}
                  {podeCancelar && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja cancelar este chamado?")) {
                          atualizarStatus("cancelado");
                        }
                      }}
                      disabled={processando}
                    >
                      Cancelar Chamado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de registro de reparo */}
          {podeRegistrarReparo && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Reparo e Resolver Chamado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={registrarManutencao} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="descricao_reparo">Descrição do que foi feito *</Label>
                    <textarea
                      id="descricao_reparo"
                      required
                      className="w-full p-3 border border-input rounded-lg bg-transparent text-sm min-h-[120px]"
                      value={descricaoReparo}
                      onChange={(e) => setDescricaoReparo(e.target.value)}
                      placeholder="Descreva detalhadamente o que foi feito para resolver o problema..."
                    />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Ao registrar o reparo, o chamado será marcado como <strong>Resolvido</strong> e o equipamento voltará ao status <strong>Operacional</strong>.
                  </div>
                  <Button type="submit" disabled={processando} className="bg-green-600 hover:bg-green-700">
                    {processando ? "Registrando..." : "Registrar Reparo e Resolver"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Chamado finalizado */}
          {finalizado && (
            <Card className={chamado.status === "resolvido" ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"}>
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-semibold">
                  {chamado.status === "resolvido" ? "✓ Chamado Resolvido" : "✗ Chamado Cancelado"}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {chamado.status === "resolvido"
                    ? "O equipamento foi reparado e está operacional."
                    : "Este chamado foi cancelado."}
                </p>
                <Button className="mt-4" variant="outline" onClick={() => router.push("/tecnico")}>
                  Voltar ao Painel
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
