# 🔍 Webhook Inspector

Uma ferramenta completa para capturar, inspecionar e debugar requisições de webhooks em tempo real. Ideal para desenvolvimento e testes de integrações com APIs de terceiros.

## 📋 Sobre o Projeto

O Webhook Inspector é uma aplicação full-stack que permite capturar e visualizar todas as requisições HTTP recebidas, incluindo headers, body, query parameters e metadados. Perfeito para:

- 🧪 Testar webhooks durante o desenvolvimento
- 🐛 Debugar integrações com APIs externas
- 📊 Analisar payloads de webhooks
- 🔐 Inspecionar headers de autenticação
- ⏱️ Monitorar tempo de resposta

## 🚀 Tecnologias Utilizadas

### Backend (API)
- **[Fastify](https://fastify.dev/)** - Framework web de alta performance
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[Scalar](https://scalar.com/)** - Documentação interativa da API
- **[Docker](https://www.docker.com/)** - Containerização do banco de dados

### Frontend (Web)
- **[React](https://react.dev/)** - Biblioteca para interfaces de usuário
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática

### Ferramentas de Desenvolvimento
- **[pnpm](https://pnpm.io/)** - Gerenciador de pacotes eficiente
- **[Biome](https://biomejs.dev/)** - Linter e formatter
- **[tsx](https://tsx.is/)** - Executor TypeScript para desenvolvimento

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **pnpm** (versão 10.20.0 ou superior)
- **Docker** e **Docker Compose** (para o banco de dados)

### Instalando o pnpm

```bash
npm install -g pnpm
```

## 🔧 Instalação

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd webhook-inspector
```

2. **Instale as dependências:**

```bash
pnpm install
```

3. **Configure o banco de dados:**

```bash
# Inicie o container do PostgreSQL
cd api
docker-compose up -d
```

4. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na pasta `api`:

```bash
cd api
touch .env
```

Adicione as seguintes variáveis ao arquivo `.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webhook_inspector
```

5. **Execute as migrações do banco de dados:**

```bash
# Na pasta api
pnpm db:generate
pnpm db:migrate
```

## 🎯 Como Usar

### Modo Desenvolvimento

1. **Inicie a API:**

```bash
cd api
pnpm dev
```

A API estará disponível em: `http://localhost:3333`
Documentação da API: `http://localhost:3333/docs`

2. **Inicie o frontend (em outro terminal):**

```bash
cd web
pnpm dev
```

O frontend estará disponível em: `http://localhost:5173`

### Produção

1. **Build da aplicação:**

```bash
# Frontend
cd web
pnpm build

# Backend
cd api
pnpm build
```

2. **Execute a aplicação:**

```bash
cd api
pnpm start
```

## 📜 Scripts Disponíveis

### Workspace Root

```bash
pnpm install        # Instala todas as dependências
```

### API

```bash
pnpm dev           # Inicia o servidor em modo desenvolvimento
pnpm start         # Inicia o servidor em modo produção
pnpm format        # Formata o código com Biome
pnpm db:generate   # Gera as migrações do banco de dados
pnpm db:migrate    # Executa as migrações pendentes
pnpm db:studio     # Abre o Drizzle Studio para gerenciar o banco
```

### Web

```bash
pnpm dev           # Inicia o dev server do Vite
pnpm build         # Cria o build de produção
pnpm preview       # Preview do build de produção
```

## 📁 Estrutura do Projeto

```
webhook-inspector/
├── api/                      # Backend (API)
│   ├── src/
│   │   ├── db/              # Configuração do banco de dados
│   │   │   ├── migrations/  # Migrações do Drizzle
│   │   │   ├── schema/      # Schemas das tabelas
│   │   │   └── index.ts     # Cliente do banco
│   │   ├── routes/          # Rotas da API
│   │   ├── env.ts           # Validação de variáveis de ambiente
│   │   └── server.ts        # Configuração do servidor Fastify
│   ├── docker-compose.yml   # Configuração do PostgreSQL
│   ├── drizzle.config.ts    # Configuração do Drizzle ORM
│   └── package.json
├── web/                     # Frontend (React)
│   ├── src/
│   │   ├── app.tsx         # Componente principal
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Estilos globais
│   ├── public/             # Arquivos estáticos
│   ├── vite.config.ts      # Configuração do Vite
│   └── package.json
├── package.json            # Configuração do workspace
├── pnpm-workspace.yaml     # Configuração do pnpm workspace
└── README.md
```

## 📚 Documentação da API

A documentação interativa da API está disponível através do Scalar em:

```
http://localhost:3333/docs
```

### Endpoints Principais

#### `GET /api/webhooks`

Lista todos os webhooks capturados.

**Query Parameters:**
- `limit` (opcional): Número de resultados (min: 1, max: 100, default: 20)

**Resposta:**
```json
[
  {
    "id": "01906f45-6e5a-7b3a-8d4f-0e1a2b3c4d5e",
    "method": "POST",
    "pathName": "/webhook/test",
    "ip": "192.168.1.1",
    "statusCode": 200,
    "contentType": "application/json",
    "headers": {...},
    "body": "...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🗄️ Schema do Banco de Dados

### Tabela: `webhooks`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT (UUID v7) | Identificador único |
| `method` | TEXT | Método HTTP (GET, POST, etc.) |
| `path_name` | TEXT | Caminho da requisição |
| `ip` | TEXT | Endereço IP do cliente |
| `status_code` | INTEGER | Código de status HTTP retornado |
| `content_type` | TEXT | Content-Type da requisição |
| `content_length` | INTEGER | Tamanho do conteúdo |
| `query_params` | JSONB | Parâmetros de query string |
| `headers` | JSONB | Headers da requisição |
| `body` | TEXT | Body da requisição |
| `created_at` | TIMESTAMP | Data e hora de criação |

## 🛠️ Gerenciamento do Banco de Dados

### Drizzle Studio

Para visualizar e gerenciar os dados através de uma interface gráfica:

```bash
cd api
pnpm db:studio
```

Acesse: `http://localhost:4983`

### Criar Nova Migração

1. Modifique o schema em `api/src/db/schema/`
2. Gere a migração:

```bash
pnpm db:generate
```

3. Execute a migração:

```bash
pnpm db:migrate
```

## 🔒 Variáveis de Ambiente

### API (.env)

```env
# Ambiente de execução
NODE_ENV=development          # development | production | test

# Porta do servidor
PORT=3333

# Conexão com o banco de dados
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commitar suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

---

Desenvolvido com ❤️ para facilitar o desenvolvimento e debug de webhooks.