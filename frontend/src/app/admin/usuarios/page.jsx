"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";
const API = API_URL;

const nivelLabel = {
  admin: "Administrador",
  tecnico: "Técnico",
  cliente: "Cliente",
};

const nivelColor = {
  admin: "bg-purple-100 text-purple-700",
  tecnico: "bg-blue-100 text-blue-700",
  cliente: "bg-gray-100 text-gray-600",
};

const FORM_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  nivel_acesso: "cliente",
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const router = useRouter();

  const getToken = () => localStorage.getItem("techrent_token");

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/usuarios`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        // Fallback: usa o endpoint de registro para criar usuários
        setUsuarios([]);
      }
    } catch {
      setUsuarios([]);
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
    carregarUsuarios();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    try {
      const res = await fetch(`${API}/auth/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.mensagem || "Erro ao criar usuário.");
      setSucesso(`Usuário "${form.nome}" criado com sucesso!`);
      setForm(FORM_VAZIO);
      setMostrarForm(false);
      carregarUsuarios();
    } catch (err) {
      setErro(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-1">Controle de acesso ao sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            ← Voltar
          </Button>
          {!mostrarForm && (
            <Button onClick={() => { setMostrarForm(true); setForm(FORM_VAZIO); }}>
              + Novo Usuário
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
            <CardTitle>Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nivel_acesso">Nível de Acesso *</Label>
                <select
                  id="nivel_acesso"
                  required
                  className="w-full h-8 px-2.5 border border-input rounded-lg bg-transparent text-sm"
                  value={form.nivel_acesso}
                  onChange={(e) => setForm({ ...form, nivel_acesso: e.target.value })}
                >
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">Criar Usuário</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO); setErro(""); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre usuários do seed */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-700 font-medium mb-2">Usuários padrão do sistema (senha: 123456)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <span className="font-semibold">Administrador</span>
              <p className="text-muted-foreground">admin@techrent.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">admin</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <span className="font-semibold">Técnico João</span>
              <p className="text-muted-foreground">joao@techrent.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">técnico</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <span className="font-semibold">Cliente Maria</span>
              <p className="text-muted-foreground">maria@techrent.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">cliente</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários (se o endpoint existir) */}
      {usuarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados ({usuarios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold">Nome</th>
                    <th className="py-3 px-4 font-semibold">E-mail</th>
                    <th className="py-3 px-4 font-semibold">Nível de Acesso</th>
                    <th className="py-3 px-4 font-semibold">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{user.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${nivelColor[user.nivel_acesso] || "bg-gray-100 text-gray-600"}`}>
                          {nivelLabel[user.nivel_acesso] || user.nivel_acesso}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {user.criado_em ? new Date(user.criado_em).toLocaleDateString("pt-BR") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
