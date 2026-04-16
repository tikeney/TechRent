'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando) {
      if (usuario) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [usuario, carregando, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-slate-500">Carregando...</p>
    </div>
  );
}
