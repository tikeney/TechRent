const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ========== AUTENTICAÇÃO ==========

export async function login(email, senha) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao realizar login');
  }

  return data;
}

export async function registro(nome, email, senha, nivel_acesso) {
  const response = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, email, senha, nivel_acesso }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao realizar registro');
  }

  return data;
}

// ========== EQUIPAMENTOS ==========

export async function listarEquipamentosDisponiveis(token) {
  const response = await fetch(`${API_URL}/equipamentos/disponiveis`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao listar equipamentos');
  }

  return data;
}

// ========== CHAMADOS ==========

export async function criarChamado(token, { titulo, descricao, equipamento_id, prioridade }) {
  const response = await fetch(`${API_URL}/chamados`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ titulo, descricao, equipamento_id, prioridade }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao criar chamado');
  }

  return data;
}

export async function listarChamados(token) {
  const response = await fetch(`${API_URL}/chamados`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao listar chamados');
  }

  return data;
}

export async function buscarChamado(token, id) {
  const response = await fetch(`${API_URL}/chamados/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro ao buscar chamado');
  }

  return data;
}
