"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TecnicoDashboard() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("techrent_token");
    const user = JSON.parse(localStorage.getItem("techrent_user") || "{}");

    if (!token || (user.nivel_acesso !== "tecnico" && user.nivel_acesso !== "admin")) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3001/dashboard/tecnico", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setChamados(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel do Técnico</h1>
        <Button variant="outline" onClick={handleLogout}>Sair</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chamados em Aberto / Em Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            {chamados.length === 0 ? (
              <p>Nenhum chamado pendente no momento.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4">Título</th>
                      <th className="py-2 px-4">Prioridade</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Solicitante</th>
                      <th className="py-2 px-4">Equipamento</th>
                      <th className="py-2 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((chamado) => (
                      <tr key={chamado.chamado_id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{chamado.titulo}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            chamado.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                            chamado.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {chamado.prioridade}
                          </span>
                        </td>
                        <td className="py-2 px-4 capitalize">{chamado.status.replace('_', ' ')}</td>
                        <td className="py-2 px-4">{chamado.solicitante}</td>
                        <td className="py-2 px-4">{chamado.equipamento}</td>
                        <td className="py-2 px-4">
                          <Button size="sm" onClick={() => router.push(`/tecnico/atender/${chamado.chamado_id}`)}>
                            Atender
                          </Button>
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
    </div>
  );
}
