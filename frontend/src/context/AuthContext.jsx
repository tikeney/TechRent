'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('techrent_token');
    const usuarioSalvo = localStorage.getItem('techrent_usuario');
    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  const login = (tokenRecebido, dadosUsuario) => {
    localStorage.setItem('techrent_token', tokenRecebido);
    localStorage.setItem('techrent_usuario', JSON.stringify(dadosUsuario));
    setToken(tokenRecebido);
    setUsuario(dadosUsuario);
  };

  const logout = () => {
    localStorage.removeItem('techrent_token');
    localStorage.removeItem('techrent_usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
