"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClienteDashboard() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    equipamento_id: "",
    prioridade: "media"
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("techrent_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3001/equipamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEquipamentos(data.filter(e => e.status === 'operacional'));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("techrent_token");
    
    try {
      const res = await fetch("http://localhost:3001/chamados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Erro ao abrir chamado");
      
      alert("Chamado aberto com sucesso!");
      setForm({ titulo: "", descricao: "", equipamento_id: "", prioridade: "media" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Abrir Chamado de TI</h1>
        <Button variant="outline" onClick={handleLogout}>Sair</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descreva o Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título Curto</Label>
              <Input 
                id="titulo" 
                required 
                value={form.titulo}
                onChange={e => setForm({...form, titulo: e.target.value})}
                placeholder="Ex: Monitor piscando"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipamento">Equipamento Afetado</Label>
              <select 
                id="equipamento" 
                required 
                className="w-full p-2 border rounded bg-background"
                value={form.equipamento_id}
                onChange={e => setForm({...form, equipamento_id: e.target.value})}
              >
                <option value="">Selecione um equipamento...</option>
                {equipamentos.map(e => (
                  <option key={e.id} value={e.id}>{e.nome} ({e.patrimonio})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <select 
                id="prioridade" 
                className="w-full p-2 border rounded bg-background"
                value={form.prioridade}
                onChange={e => setForm({...form, prioridade: e.target.value})}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição Detalhada</Label>
              <textarea 
                id="descricao" 
                className="w-full p-2 border rounded bg-background min-h-[100px]"
                required
                value={form.descricao}
                onChange={e => setForm({...form, descricao: e.target.value})}
                placeholder="Descreva o que está acontecendo..."
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full">Enviar Chamado</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
