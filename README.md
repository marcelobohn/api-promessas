# API de Promessas de Campanha

API simples em Node.js/Express para cadastrar e consultar promessas de candidatos, usando Prisma + PostgreSQL como base de dados.

## Visão geral
- **Stack:** Node.js, Express, Prisma ORM e PostgreSQL.
- **Persistência:** Prisma Client configurado via variáveis de ambiente (`DATABASE_URL` e POSTGRES_*).
- **Rotas principais:**
  - `GET /` – ping da API.
  - `GET /api/v1/candidates` – lista todos os candidatos.
  - `POST /api/v1/candidates` – cria um novo candidato (`name` e `office` obrigatórios; `political_party` e `election_year` opcionais).

## Requisitos
- Node.js 20+ e npm 10+ (para desenvolvimento local).
- Banco PostgreSQL acessível com o schema `candidates` (criado via `db/init.sql`).
- Opcional: Docker e Docker Compose (para subir API + banco rapidamente).

## Configuração local
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e ajuste as variáveis:
   ```bash
   cp .env.example .env
   # Edite POSTGRES_* e DATABASE_URL conforme sua instância local
   ```
3. Garanta que o banco tenha a tabela `candidates`:
   - Com PostgreSQL local: `npm run prisma:db:push` (usa `DATABASE_URL`).
   - Em Docker: `docker compose up -d` executará `db/init.sql` na primeira inicialização do volume.
4. Execute em modo desenvolvimento (usa `nodemon` via `npm start`):
   ```bash
   npm start
   ```
> Sempre que alterar `prisma/schema.prisma`, rode `npm run prisma:generate` para atualizar o client.

## Variáveis de ambiente
| Variável | Descrição | Default |
| -------- | --------- | ------- |
| `POSTGRES_USER` | Usuário do banco | `postgres` |
| `POSTGRES_PASSWORD` | Senha do usuário | `your_password` |
| `POSTGRES_DB` | Nome do banco | `promessas_db` |
| `POSTGRES_HOST` | Host do PostgreSQL | `postgres` (Docker) / `localhost` (local) |
| `POSTGRES_PORT` | Porta do banco | `5432` |
| `APP_PORT` | Porta exposta pela API | `3000` |
| `DATABASE_URL` | String de conexão usada pelo Prisma | `postgresql://postgres:your_password@postgres:5432/promessas_db?schema=public` |

## Uso com Docker Compose
1. Ajuste `.env` com as credenciais desejadas.
2. Suba os serviços:
   ```bash
   docker compose up -d --build
   ```
   - Serviço `postgres` expõe `5432` e executa `db/init.sql` na primeira inicialização.
   - Serviço `api` é construído a partir do `Dockerfile` e lê as mesmas variáveis do `.env`.
3. Acesse `http://localhost:3000` (ou a porta definida em `APP_PORT`).

Caso precise reinicializar o banco (por exemplo, para reaplicar `db/init.sql` ou alterar credenciais), use:
```bash
docker compose down -v
```
> **Atenção:** o comando acima remove os dados persistidos no volume `pgdata`.

## Estrutura de diretórios
```
.
├── db
│   └── init.sql           # Script SQL inicial (aplicado pelo Postgres do Docker)
├── prisma
│   └── schema.prisma      # Definição dos modelos do Prisma
├── routes
│   └── candidates.js      # Rotas REST para candidatos
├── server.js              # Entrada principal da API
├── db.js                  # Instância do Prisma Client
├── Dockerfile             # Build da API em Node 20 Alpine
├── docker-compose.yml     # Orquestração da API + PostgreSQL
├── .env.example           # Template das variáveis de ambiente
└── README.md
```

## Próximos passos sugeridos
- Adicionar validação/sanitização mais robusta das entradas.
- Criar testes automatizados para os endpoints.
- Expandir o schema (ex.: status da promessa, métricas de cumprimento).
