"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";
const API = API_URL;

const statusLabel = {
  operacional: "Operacional",
  em_manutencao: "Em Manutenção",
  desativado: "Desativado",
};

const statusColor = {
  operacional: "bg-green-100 text-green-700",
  em_manutencao: "bg-yellow-100 text-yellow-700",
  desativado: "bg-gray-100 text-gray-600",
};

const FORM_VAZIO = {
  nome: "",
  categoria: "",
  patrimonio: "",
  status: "operacional",
  descricao: "",
};

export default function AdminEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState(null); // id do equipamento em edição
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const router = useRouter();

  const getToken = () => localStorage.getItem("techrent_token");

  const carregarEquipamentos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/equipamentos`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setEquipamentos(Array.isArray(data) ? data : []);
    } catch {
      setErro("Erro ao carregar equipamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem("techrent_user") || "{}");
    if (!token || user.nivel_acesso !== "admin") {
      router.push("/login");
      return;
    }
    carregarEquipamentos();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    try {
      const url = editando ? `${API}/equipamentos/${editando}` : `${API}/equipamentos`;
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao salvar equipamento.");
      setSucesso(editando ? "Equipamento atualizado!" : "Equipamento criado!");
      setForm(FORM_VAZIO);
      setEditando(null);
      setMostrarForm(false);
      carregarEquipamentos();
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleEditar = (equip) => {
    setForm({
      nome: equip.nome,
      categoria: equip.categoria || "",
      patrimonio: equip.patrimonio || "",
      status: equip.status,
      descricao: equip.descricao || "",
    });
    setEditando(equip.id);
    setMostrarForm(true);
    setErro("");
    setSucesso("");
  };

  const handleRemover = async (id) => {
    if (!confirm("Tem certeza que deseja remover este equipamento?")) return;
    setErro("");
    setSucesso("");
    try {
      const res = await fetch(`${API}/equipamentos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao remover.");
      setSucesso("Equipamento removido com sucesso.");
      carregarEquipamentos();
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleCancelar = () => {
    setForm(FORM_VAZIO);
    setEditando(null);
    setMostrarForm(false);
    setErro("");
    setSucesso("");
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Inventário de máquinas e dispositivos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            ← Voltar
          </Button>
          {!mostrarForm && (
            <Button onClick={() => { setMostrarForm(true); setEditando(null); setForm(FORM_VAZIO); }}>
              + Novo Equipamento
            </Button>
          )}
        </div>
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

      {mostrarForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editando ? "Editar Equipamento" : "Novo Equipamento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Notebook Dell Latitude"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  required
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  placeholder="Ex: Notebook, Projetor, Impressora"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="patrimonio">Número de Patrimônio *</Label>
                <Input
                  id="patrimonio"
                  required
                  value={form.patrimonio}
                  onChange={(e) => setForm({ ...form, patrimonio: e.target.value })}
                  placeholder="Ex: PAT001"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  required
                  className="w-full h-8 px-2.5 border border-input rounded-lg bg-transparent text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="operacional">Operacional</option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  className="w-full p-2 border border-input rounded-lg bg-transparent text-sm min-h-[80px]"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição opcional do equipamento"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">{editando ? "Salvar Alterações" : "Criar Equipamento"}</Button>
                <Button type="button" variant="outline" onClick={handleCancelar}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Equipamentos Cadastrados ({equipamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {equipamentos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum equipamento cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold">Nome</th>
                    <th className="py-3 px-4 font-semibold">Categoria</th>
                    <th className="py-3 px-4 font-semibold">Patrimônio</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Descrição</th>
                    <th className="py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipamentos.map((equip) => (
                    <tr key={equip.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{equip.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{equip.categoria || "-"}</td>
                      <td className="py-3 px-4 font-mono text-xs">{equip.patrimonio || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[equip.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[equip.status] || equip.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                        {equip.descricao || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditar(equip)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleRemover(equip.id)}
                            disabled={equip.status === "em_manutencao"}
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
