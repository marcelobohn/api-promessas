# API de Promessas de Campanha

API escrita em TypeScript (Node.js/Express) para cadastrar e consultar promessas de candidatos, usando Prisma + PostgreSQL como base de dados.

## Visão geral
- **Stack:** Node.js, TypeScript, Express, Prisma ORM e PostgreSQL.
- **Persistência:** Prisma Client configurado via variáveis de ambiente (`DATABASE_URL` e POSTGRES_*).
- **Autenticação:** JWT; rotas de escrita exigem `Authorization: Bearer <token>`; rotas de leitura são públicas.
- **Principais rotas:**
  - `GET /` – ping da API.
  - `POST /api/v1/auth/register` – cria usuário e retorna token.
  - `POST /api/v1/auth/login` – autentica e retorna token.
  - `GET /api/v1/candidates` – lista candidatos (filtro `officeId` obrigatório).
  - `POST /api/v1/candidates` – cria candidato (token obrigatório).
  - `GET /api/v1/candidates/:candidateId/promises` – lista promessas de um candidato.
  - `POST /api/v1/candidates/:candidateId/promises` – cria promessa (token obrigatório).
  - `PATCH /api/v1/promises/:promiseId` – atualiza status/progresso/descrição (token obrigatório).
  - `POST /api/v1/promises/:promiseId/comments` – adiciona comentários (token obrigatório).
  - `GET /api/v1/elections` / `POST /api/v1/elections` – lista/cria eleições (POST exige token).
  - `GET /api/v1/offices` / `POST` / `PATCH` – lista/cria/atualiza cargos (escrita exige token).
  - `GET /api/v1/political-parties` – lista partidos.
  - `GET /api/v1/states` – lista estados.
  - `GET /api/v1/cities?state_code=` – lista cidades pelo estado.

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
3. Garanta o schema do banco:
   - PostgreSQL local: `npm run prisma:db:push` (usa `DATABASE_URL`).
   - Docker: `docker compose up -d` executa `db/init.sql` na primeira inicialização do volume.
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
- Rodar toda a suíte: `npm test`
- Cobertura: `npm run test:coverage` (gera relatório em `coverage/`)
Os testes usam Jest + Supertest e mockam o Prisma Client; não precisam de banco em execução.

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

## Estrutura de diretórios (resumo)
```
.
├── db/                     # Script SQL inicial
├── prisma/                 # schema.prisma e migrations
├── src/
│   ├── core/               # Errors/helpers compartilhados
│   ├── middlewares/        # Ex.: auth (JWT)
│   ├── modules/            # Domínios organizados em camadas (routes/controllers/service/repository/schemas)
│   │   ├── auth/
│   │   ├── candidates/
│   │   ├── promises/
│   │   ├── elections/
│   │   ├── offices/
│   │   ├── political-parties/
│   │   ├── states/
│   │   └── cities/
│   ├── utils/formatters.ts # Converte Prisma -> contrato da API
│   └── server.ts           # Entrada principal da API
├── tests/                  # Testes por domínio + helpers
├── Dockerfile / docker-compose.yml
└── README.md
```

## Próximos passos sugeridos
- Adicionar validação/sanitização mais robusta das entradas.
- Criar testes automatizados para os endpoints.
- Expandir o schema (ex.: status da promessa, métricas de cumprimento).
