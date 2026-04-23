"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (!usuarioSalvo || !token) {
      router.push("/login");
    } else {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!usuario) {
    return <div className="flex items-center justify-center h-screen font-sans">Carregando...</div>;
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full justify-between items-center mb-8">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">Olá, <strong>{usuario.nome}</strong> ({usuario.nivel_acesso})</span>
            <Button variant="outline" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Bem-vindo ao TechRent!
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Você está logado no sistema de gerenciamento de chamados de TI.
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="p-6 border border-zinc-200 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">Equipamentos</h3>
            <p className="text-sm text-zinc-600">Visualize e gerencie o inventário de máquinas.</p>
          </div>
          <div className="p-6 border border-zinc-200 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">Chamados</h3>
            <p className="text-sm text-zinc-600">Abra ou atenda solicitações de manutenção.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
