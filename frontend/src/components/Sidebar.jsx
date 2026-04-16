'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/chamados', label: 'Chamados', icon: '🎫' },
    { href: '/equipamentos', label: 'Equipamentos', icon: '🖥️' },
    { href: '/manutencao', label: 'Manutenção', icon: '🔧' },
    { href: '/usuarios', label: 'Usuários', icon: '👥' },
  ],
  tecnico: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/chamados', label: 'Chamados', icon: '🎫' },
    { href: '/equipamentos', label: 'Equipamentos', icon: '🖥️' },
    { href: '/manutencao', label: 'Manutenção', icon: '🔧' },
  ],
  cliente: [
    { href: '/dashboard', label: 'Início', icon: '🏠' },
    { href: '/chamados', label: 'Meus Chamados', icon: '🎫' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const items = navItems[usuario.nivel_acesso] || navItems.cliente;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const nivelLabel = {
    admin: 'Administrador',
    tecnico: 'Técnico',
    cliente: 'Cliente',
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg">💻</div>
          <div>
            <p className="font-bold text-sm">TechRent</p>
            <p className="text-xs text-slate-400">Chamados de TI</p>
          </div>
        </div>
      </div>

      {/* Usuário */}
      <div className="px-6 py-4 border-b border-slate-700">
        <p className="text-sm font-medium truncate">{usuario.nome}</p>
        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
          {nivelLabel[usuario.nivel_acesso] || usuario.nivel_acesso}
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                ativo
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
