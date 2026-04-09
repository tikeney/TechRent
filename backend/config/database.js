// =============================================
// CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
// =============================================
// O mysql2 é usado por ter suporte a Promises (async/await),
// o que facilita muito o código assíncrono no Node.js.

const mysql = require('mysql2/promise');

// Cria um "pool" de conexões.
// Um pool reutiliza conexões abertas ao invés de abrir uma nova a cada query,
// o que é mais eficiente e evita sobrecarregar o banco.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Número máximo de conexões simultâneas no pool
  connectionLimit: 10,

  // Retorna valores numéricos como números JS (não como strings)
  typeCast: true,
});

module.exports = pool;
