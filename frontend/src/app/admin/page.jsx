"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("techrent_token");
    const user = JSON.parse(localStorage.getItem("techrent_user") || "{}");

    if (!token || user.nivel_acesso !== "admin") {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3001/dashboard/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
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
        <h1 className="text-3xl font-bold">Painel do Administrador</h1>
        <Button variant="outline" onClick={handleLogout}>Sair</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data?.chamados?.map((item) => (
                <li key={item.status} className="flex justify-between border-b pb-1">
                  <span className="capitalize">{item.status}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data?.equipamentos?.map((item) => (
                <li key={item.status} className="flex justify-between border-b pb-1">
                  <span className="capitalize">{item.status.replace('_', ' ')}</span>
                  <span className="font-bold">{item.total}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={() => router.push("/admin/equipamentos")}>Gerenciar Equipamentos</Button>
        <Button variant="secondary" onClick={() => router.push("/admin/usuarios")}>Gerenciar Usuários</Button>
      </div>
    </div>
  );
}
