'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function UsuariosLayout({ children }) {
  const router = useRouter();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando) {
      if (!usuario) router.replace('/login');
      else if (usuario.nivel_acesso !== 'admin') router.replace('/dashboard');
    }
  }, [usuario, carregando, router]);

  if (carregando || !usuario) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  );
}
