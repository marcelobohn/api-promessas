DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ElectionType') THEN
    CREATE TYPE "ElectionType" AS ENUM ('FEDERAL_ESTADUAL', 'MUNICIPAL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PromiseStatus') THEN
    CREATE TYPE "PromiseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS offices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  office_type "ElectionType" NOT NULL DEFAULT 'FEDERAL_ESTADUAL'
);

CREATE TABLE IF NOT EXISTS political_parties (
  id SERIAL PRIMARY KEY,
  acronym TEXT NOT NULL UNIQUE,
  number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elections (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  election_type "ElectionType" NOT NULL DEFAULT 'FEDERAL_ESTADUAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  political_party_id INT REFERENCES political_parties(id) ON DELETE SET NULL,
  election_id INT REFERENCES elections(id) ON DELETE SET NULL,
  office_id INT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promises (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status "PromiseStatus" NOT NULL DEFAULT 'NOT_STARTED',
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promise_comments (
  id SERIAL PRIMARY KEY,
  promise_id INT NOT NULL REFERENCES promises(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS states (
  codigo_uf INT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ibge_code INT NOT NULL UNIQUE,
  state_code INT NOT NULL REFERENCES states(codigo_uf) ON DELETE CASCADE,
  CONSTRAINT cities_name_state_code_key UNIQUE (name, state_code)
);

INSERT INTO states (codigo_uf, name, abbreviation)
VALUES
  (12, 'Acre', 'AC'),
  (27, 'Alagoas', 'AL'),
  (16, 'Amapa', 'AP'),
  (13, 'Amazonas', 'AM'),
  (29, 'Bahia', 'BA'),
  (23, 'Ceara', 'CE'),
  (53, 'Distrito Federal', 'DF'),
  (32, 'Espirito Santo', 'ES'),
  (52, 'Goias', 'GO'),
  (21, 'Maranhao', 'MA'),
  (51, 'Mato Grosso', 'MT'),
  (50, 'Mato Grosso do Sul', 'MS'),
  (31, 'Minas Gerais', 'MG'),
  (15, 'Para', 'PA'),
  (25, 'Paraiba', 'PB'),
  (41, 'Parana', 'PR'),
  (26, 'Pernambuco', 'PE'),
  (22, 'Piaui', 'PI'),
  (33, 'Rio de Janeiro', 'RJ'),
  (24, 'Rio Grande do Norte', 'RN'),
  (43, 'Rio Grande do Sul', 'RS'),
  (11, 'Rondonia', 'RO'),
  (14, 'Roraima', 'RR'),
  (42, 'Santa Catarina', 'SC'),
  (35, 'Sao Paulo', 'SP'),
  (28, 'Sergipe', 'SE'),
  (17, 'Tocantins', 'TO')
ON CONFLICT (codigo_uf) DO NOTHING;

INSERT INTO political_parties (acronym, number, name)
VALUES
  ('MDB', 15, 'MOVIMENTO DEMOCRATICO BRASILEIRO'),
  ('PDT', 12, 'PARTIDO DEMOCRATICO TRABALHISTA'),
  ('PT', 13, 'PARTIDO DOS TRABALHADORES'),
  ('PCdoB', 65, 'PARTIDO COMUNISTA DO BRASIL'),
  ('PSB', 40, 'PARTIDO SOCIALISTA BRASILEIRO'),
  ('PSDB', 45, 'PARTIDO DA SOCIAL DEMOCRACIA BRASILEIRA'),
  ('AGIR', 36, 'AGIR'),
  ('MOBILIZA', 33, 'MOBILIZACAO NACIONAL'),
  ('CIDADANIA', 23, 'CIDADANIA'),
  ('PV', 43, 'PARTIDO VERDE'),
  ('AVANTE', 70, 'AVANTE'),
  ('PP', 11, 'PROGRESSISTAS'),
  ('PSTU', 16, 'PARTIDO SOCIALISTA DOS TRABALHADORES UNIFICADO'),
  ('PCB', 21, 'PARTIDO COMUNISTA BRASILEIRO'),
  ('PRTB', 28, 'PARTIDO RENOVADOR TRABALHISTA BRASILEIRO'),
  ('DC', 27, 'DEMOCRACIA CRISTA'),
  ('PCO', 29, 'PARTIDO DA CAUSA OPERARIA'),
  ('PODE', 20, 'PODEMOS'),
  ('REPUBLICANOS', 10, 'REPUBLICANOS'),
  ('PSOL', 50, 'PARTIDO SOCIALISMO E LIBERDADE'),
  ('PL', 22, 'PARTIDO LIBERAL'),
  ('PSD', 55, 'PARTIDO SOCIAL DEMOCRATICO'),
  ('SOLIDARIEDADE', 77, 'SOLIDARIEDADE'),
  ('NOVO', 30, 'PARTIDO NOVO'),
  ('REDE', 18, 'REDE SUSTENTABILIDADE'),
  ('PMB', 35, 'PARTIDO DA MULHER BRASILEIRA'),
  ('UP', 80, 'UNIDADE POPULAR'),
  ('UNIAO', 44, 'UNIAO BRASIL'),
  ('PRD', 25, 'PARTIDO RENOVACAO DEMOCRATICA'),
  ('MISSAO', 14, 'PARTIDO MISSAO')
ON CONFLICT DO NOTHING;
