# Integração de Login - TechRent

Este documento descreve as alterações realizadas para integrar o sistema de login no projeto TechRent.

## Alterações Realizadas

### Backend

#### 1. **authController.js** - Correção e Implementação Completa
- **Problema**: A função `login` estava incompleta e com erros
- **Solução**: 
  - Implementada busca correta do usuário no banco de dados
  - Adicionada validação de entrada (email e senha obrigatórios)
  - Corrigida a comparação de senha com bcrypt
  - Implementada geração correta do token JWT com payload completo
  - Adicionada resposta com token e dados do usuário
  - Implementada tratamento de erros robusto

**Principais mudanças**:
```javascript
// Antes: Código incompleto e com bugs
const login = async (req, res) => {
  // ... código com erros

// Depois: Implementação completa
const login = async (req, res) => {
  const { email, senha } = req.body;
  
  // Validação de entrada
  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    // Busca correta do usuário
    const [usuarios] = await db.query(
      'SELECT id, nome, email, senha, nivel_acesso FROM usuarios WHERE email = ?',
      [email]
    );

    // Validação e comparação de senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    // Geração do token
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'chave_mestra_secreta', { expiresIn: '9h' });
    
    // Retorno com token e dados do usuário
    res.json({ message: "Login realizado com sucesso!", token, usuario });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
```

#### 2. **.env.example** - Arquivo de Configuração
- Criado arquivo de exemplo com as variáveis de ambiente necessárias
- Inclui: `PORT`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Frontend

#### 1. **lib/api.js** - Cliente API
- Criado novo arquivo com funções para comunicação com o backend
- Funções implementadas:
  - `login(email, senha)` - Realiza login e retorna token
  - `registro(nome, email, senha, nivel_acesso)` - Cria novo usuário

#### 2. **components/login-form.jsx** - Formulário de Login Funcional
- Adicionado estado para email, senha e mensagens de erro
- Implementado handler de submissão do formulário
- Integração com a API de login
- Armazenamento de token e dados do usuário no localStorage
- Redirecionamento automático após login bem-sucedido
- Feedback visual durante o carregamento

**Principais mudanças**:
```javascript
// Adicionado "use client" para usar hooks do React
"use client";

// Estados para gerenciar formulário
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [erro, setErro] = useState("");
const [carregando, setCarregando] = useState(false);

// Handler de submissão
const handleSubmit = async (e) => {
  e.preventDefault();
  setErro("");
  setCarregando(true);

  try {
    const data = await login(email, senha);
    
    // Armazena token e usuário
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    // Redireciona
    router.push("/");
  } catch (err) {
    setErro(err.message);
  } finally {
    setCarregando(false);
  }
};
```

#### 3. **app/page.jsx** - Página Inicial Protegida
- Adicionada verificação de autenticação
- Redirecionamento automático para login se não autenticado
- Exibição de dados do usuário (nome e nível de acesso)
- Botão de logout funcional
- Interface melhorada com dashboard básico

## Como Usar

### 1. Configurar o Backend

```bash
# Navegue até a pasta backend
cd backend

# Instale as dependências
npm install

# Crie um arquivo .env baseado em .env.example
cp .env.example .env

# Configure as variáveis de ambiente no arquivo .env
# Exemplo:
# PORT=3001
# JWT_SECRET=sua_chave_secreta_muito_segura
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=techrent_db
```

### 2. Configurar o Banco de Dados

```bash
# Crie o banco de dados e as tabelas
mysql -u root < ../bd/schema.sql
mysql -u root < ../bd/views.sql
```

### 3. Iniciar o Backend

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Ou modo produção
npm start
```

### 4. Configurar o Frontend

```bash
# Navegue até a pasta frontend
cd frontend

# Instale as dependências
npm install

# Crie um arquivo .env.local (se necessário)
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Iniciar o Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Fluxo de Autenticação

1. **Usuário acessa a página inicial** → Redirecionado para `/login` se não autenticado
2. **Usuário preenche email e senha** → Clica em "Login"
3. **Frontend envia requisição POST** para `http://localhost:3001/auth/login`
4. **Backend valida credenciais** e retorna token JWT
5. **Frontend armazena token e dados do usuário** no localStorage
6. **Usuário é redirecionado** para a página inicial
7. **Página inicial verifica autenticação** e exibe conteúdo protegido

## Estrutura de Token JWT

O token contém os seguintes dados (payload):
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "nivel_acesso": "cliente"
}
```

**Duração**: 9 horas

## Próximos Passos

- [ ] Implementar página de registro (`/registro`)
- [ ] Adicionar recuperação de senha
- [ ] Implementar refresh token
- [ ] Adicionar proteção de rotas no frontend com middleware
- [ ] Implementar logout com invalidação de token no backend
- [ ] Adicionar 2FA (autenticação de dois fatores)
- [ ] Implementar rotas protegidas por nível de acesso (cliente, técnico, admin)

## Troubleshooting

### Erro: "CORS error"
- Verifique se o backend está rodando na porta 3001
- Verifique se o CORS está configurado corretamente em `server.js`
- Certifique-se de que o frontend está em `http://localhost:3000`

### Erro: "Database connection failed"
- Verifique se o MySQL está rodando
- Verifique as credenciais no arquivo `.env`
- Certifique-se de que o banco de dados foi criado com `schema.sql`

### Erro: "Invalid token"
- Verifique se o `JWT_SECRET` é o mesmo no backend
- Certifique-se de que o token não expirou (9 horas)
- Limpe o localStorage e faça login novamente

## Segurança

- ✅ Senhas são criptografadas com bcryptjs (10 rounds de salt)
- ✅ Tokens JWT são assinados com chave secreta
- ✅ CORS está configurado para aceitar apenas o frontend
- ✅ Senha nunca é incluída no payload do token
- ⚠️ **TODO**: Implementar HTTPS em produção
- ⚠️ **TODO**: Implementar rate limiting para login
- ⚠️ **TODO**: Implementar validação de email

## Contato

Para dúvidas ou problemas, abra uma issue no repositório.
