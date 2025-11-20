# API de Promessas de Campanha

API escrita em TypeScript (Node.js/Express) para cadastrar e consultar promessas de candidatos, usando Prisma + PostgreSQL como base de dados.

## Visão geral
- **Stack:** Node.js, TypeScript, Express, Prisma ORM e PostgreSQL.
- **Persistência:** Prisma Client configurado via variáveis de ambiente (`DATABASE_URL` e POSTGRES_*).
- **Rotas principais:**
  - `GET /` – ping da API.
  - `GET /api/v1/candidates` – lista todos os candidatos.
  - `POST /api/v1/candidates` – cria um novo candidato (`name` e `office_id` obrigatórios; `political_party` e `election_id` opcionais).
  - `GET /api/v1/candidates/:candidateId/promises` – lista promessas de um candidato.
  - `POST /api/v1/candidates/:candidateId/promises` – cadastra uma promessa com status e percentual.
  - `PATCH /api/v1/promises/:promiseId` – atualiza status, progresso ou descrição.
  - `POST /api/v1/promises/:promiseId/comments` – adiciona comentários de andamento.
  - `GET /api/v1/elections` – lista eleições cadastradas.
  - `POST /api/v1/elections` – cria uma eleição (ano + descrição).
  - `GET /api/v1/offices` – lista cargos disponíveis.
  - `POST /api/v1/offices` e `PATCH /api/v1/offices/:officeId` – cadastram/atualizam cargos.

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
4. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```
5. Para gerar artefatos em JavaScript (produção), rode:
   ```bash
   npm run build
   npm start
   ```
> Sempre que alterar `prisma/schema.prisma`, rode `npm run prisma:generate` para atualizar o client.

## Testes
Execute toda a suíte com:
```bash
npm test
```
Os testes usam Jest + Supertest e mockam o Prisma Client, portanto não precisam de banco em execução.

## Documentação Swagger
- Arquivo base: `swagger.yaml`.
- Endpoint HTML: acesse `http://localhost:3000/docs` para visualizar o Swagger UI embutido.
- Endpoint JSON: `http://localhost:3000/swagger.json`.
- Gere tipos e clientes a partir do OpenAPI com `npm run openapi:generate` (usa `openapi-typescript-codegen` e escreve em `src/generated/`).
- Também é possível abrir o arquivo manualmente em ferramentas como Swagger Editor/Insomnia/Postman.

## Gerenciamento de promessas
- **Status:** campo textual com valor padrão `NOT_STARTED`. Pode receber valores como `IN_PROGRESS`, `COMPLETED` ou qualquer outra situação necessária pela equipe.
- **Progresso:** inteiro de 0 a 100 indicando percentual concluído.
- **Comentários:** use `POST /api/v1/promises/:promiseId/comments` para registrar atualizações de andamento (ex.: reuniões, entregas parciais, blockers).

## Eleições (Election)
- Use `POST /api/v1/elections` para registrar novas eleições com `year` (obrigatório e único) e `description` (opcional).
- Para vincular um candidato a uma eleição, informe `election_id` ao criar o candidato (ou deixe vazio para uma referência futura).
- As respostas de candidatos continuam trazendo `election_year`, obtido automaticamente a partir da entidade `Election`.

## Cargos (Office)
- Registre cargos com `POST /api/v1/offices` (campos `name` obrigatório e `description` opcional) e atualize-os com `PATCH /api/v1/offices/:officeId`.
- Todo candidato agora exige um `office_id`; o campo `office` retornado pela API reflete o nome associado ao registro em `offices`.
- Há uma migration (`prisma/migrations/20251118183000_seed_offices/migration.sql`) que pré-popula os cargos padrão (Presidente, Governador, Senador, Deputado Federal/Estadual, Prefeito, Vereador). Rode `npx prisma migrate deploy` (ou `prisma migrate dev`) para aplicá-la.

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
│   └── schema.prisma      # Definição dos modelos do Prisma (candidatos, promessas, comentários)
├── src
│   ├── db.ts              # Instância do Prisma Client
│   ├── routes
│   │   ├── candidates.ts  # Rotas de candidatos + promessas por candidato
│   │   ├── promises.ts    # Rotas de atualização/comentários das promessas
│   │   ├── elections.ts   # CRUD básico de eleições
│   │   └── offices.ts     # CRUD básico de cargos
│   ├── utils
│   │   └── formatters.ts  # Converte entidades Prisma para o contrato da API
│   └── server.ts          # Entrada principal da API
├── Dockerfile             # Build da API em Node 20 Alpine
├── docker-compose.yml     # Orquestração da API + PostgreSQL
├── .env.example           # Template das variáveis de ambiente
└── README.md
```

## Próximos passos sugeridos
- Adicionar validação/sanitização mais robusta das entradas.
- Criar testes automatizados para os endpoints.
- Expandir o schema (ex.: status da promessa, métricas de cumprimento).
