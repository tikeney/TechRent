// Configuração centralizada da URL da API
// Usa variável de ambiente em produção, fallback para localhost em desenvolvimento
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
