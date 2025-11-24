import request from 'supertest';
import express from 'express';
import candidateRoutes from '../src/routes/candidates';
import promiseRoutes from '../src/routes/promises';
import electionRoutes from '../src/routes/elections';
import officeRoutes from '../src/routes/offices';
import politicalPartyRoutes from '../src/routes/political-parties';
import stateRoutes from '../src/routes/states';
import cityRoutes from '../src/routes/cities';
import prisma from '../src/db';

jest.mock('../src/db', () => ({
  candidate: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  city: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  state: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  promise: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  promiseComment: {
    create: jest.fn(),
  },
  election: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  politicalParty: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  office: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as {
  candidate: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
  };
  city: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  state: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  promise: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  promiseComment: {
    create: jest.Mock;
  };
  election: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };
  politicalParty: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  office: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/candidates', candidateRoutes);
  app.use('/api/v1/promises', promiseRoutes);
  app.use('/api/v1/elections', electionRoutes);
  app.use('/api/v1/offices', officeRoutes);
  app.use('/api/v1/political-parties', politicalPartyRoutes);
  app.use('/api/v1/states', stateRoutes);
  app.use('/api/v1/cities', cityRoutes);
  return app;
};

describe('Candidate routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/v1/candidates returns list ordered by id', async () => {
    prismaMock.candidate.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Alice',
        politicalPartyId: 99,
        politicalParty: { id: 99, acronym: 'ABC' },
        electionId: 10,
        officeId: 5,
        office: { id: 5, name: 'Prefeita' },
        stateCode: 35,
        cityId: 3550308,
        city: { id: 3550308, name: 'Sao Paulo', stateCode: 35 },
        state: { codigoUf: 35, name: 'Sao Paulo', abbreviation: 'SP' },
        promises: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        election: { id: 10, year: 2024 },
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates').query({ officeId: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: 'Alice',
        political_party_id: 99,
        political_party: 'ABC',
        office_id: 5,
        election_id: 10,
        election_year: 2024,
        office: 'Prefeita',
        state_name: 'Sao Paulo',
        state_code: 35,
        city_id: 3550308,
        city_name: 'Sao Paulo',
        promises_count: 0,
        comments_count: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      },
    ]);
    expect(prismaMock.candidate.findMany).toHaveBeenCalledWith({
      where: { officeId: 5 },
      orderBy: { id: 'asc' },
      include: {
        election: true,
        office: true,
        politicalParty: true,
        state: true,
        city: true,
        promises: { select: { _count: { select: { comments: true } } } },
      },
    });
  });

  test('POST /api/v1/candidates validates required fields', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .send({ political_party_id: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Nome é obrigatório.' });
    expect(prismaMock.candidate.create).not.toHaveBeenCalled();
  });

  test('POST /api/v1/candidates exige office_id', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .send({ name: 'Bob' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'office_id é obrigatório.' });
  });

  test('POST /api/v1/candidates creates a candidate', async () => {
    prismaMock.election.findUnique.mockResolvedValue({ id: 10, year: 2024 });
    prismaMock.office.findUnique.mockResolvedValue({ id: 5, name: 'Vereador', type: 'MUNICIPAL' });
    prismaMock.politicalParty = prismaMock.politicalParty || { findUnique: jest.fn() };
    prismaMock.politicalParty.findUnique.mockResolvedValue({ id: 1, acronym: 'MDB' });
    prismaMock.city.findUnique.mockResolvedValue({ id: 12345, stateCode: 35 });
    const createdCandidate = {
      id: 42,
      name: 'Bob',
      politicalPartyId: 1,
      politicalParty: { id: 1, acronym: 'MDB' },
      electionId: 10,
      election: { id: 10, year: 2024 },
      officeId: 5,
      office: { id: 5, name: 'Vereador', type: 'MUNICIPAL' },
      cityId: 12345,
      city: { id: 12345, name: 'Cidade X', stateCode: 35 },
      stateCode: 35,
      state: { codigoUf: 35, name: 'Sao Paulo', abbreviation: 'SP' },
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
    };

    prismaMock.candidate.create.mockResolvedValue(createdCandidate);

    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .send({ name: 'Bob', office_id: 5, election_id: 10, political_party_id: 1, city_id: 12345 });

    expect(response.status).toBe(201);
    expect(prismaMock.office.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(prismaMock.candidate.create).toHaveBeenCalled();
    expect(response.body).toMatchObject({
      id: 42,
      office_id: 5,
      office: 'Vereador',
      election_id: 10,
      election_year: 2024,
      political_party_id: 1,
      political_party: 'MDB',
      city_id: 12345,
      state_code: 35,
    });
  });

  test('GET /api/v1/candidates handles errors', async () => {
    prismaMock.candidate.findMany.mockRejectedValue(new Error('db down'));
    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates').query({ officeId: 5 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Erro interno do servidor' });
  });

  test('GET /api/v1/candidates/:candidateId/promises returns promises', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.promise.findMany.mockResolvedValue([
      {
        id: 11,
        candidateId: 1,
        title: 'Promessa 1',
        description: 'Desc',
        status: 'IN_PROGRESS',
        progress: 30,
        createdAt: new Date('2024-03-01T00:00:00Z'),
        updatedAt: new Date('2024-03-02T00:00:00Z'),
        comments: [],
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates/1/promises');

    expect(response.status).toBe(200);
    expect(prismaMock.promise.findMany).toHaveBeenCalled();
    expect(response.body[0]).toMatchObject({
      id: 11,
      candidate_id: 1,
      status: 'IN_PROGRESS',
      progress: 30,
      comments_count: 0,
    });
  });

  test('POST /api/v1/candidates/:candidateId/promises creates promise', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.promise.create.mockResolvedValue({
      id: 22,
      candidateId: 1,
      title: 'Nova promessa',
      description: null,
      status: 'NOT_STARTED',
      progress: 0,
      createdAt: new Date('2024-04-01T00:00:00Z'),
      updatedAt: new Date('2024-04-01T00:00:00Z'),
      comments: [],
    });

    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates/1/promises')
      .send({ title: 'Nova promessa' });

    expect(response.status).toBe(201);
    expect(prismaMock.promise.create).toHaveBeenCalled();
    expect(response.body).toMatchObject({
      id: 22,
      title: 'Nova promessa',
      progress: 0,
      comments_count: 0,
      comments: [],
    });
  });

  test('PATCH /api/v1/promises/:id atualiza promessa', async () => {
    prismaMock.promise.update.mockResolvedValue({
      id: 30,
      candidateId: 1,
      title: 'Promessa atualizada',
      description: null,
      status: 'COMPLETED',
      progress: 100,
      createdAt: new Date('2024-05-01T00:00:00Z'),
      updatedAt: new Date('2024-05-02T00:00:00Z'),
      comments: [],
    });

    const app = buildApp();
    const response = await request(app)
      .patch('/api/v1/promises/30')
      .send({ status: 'COMPLETED', progress: 100 });

    expect(response.status).toBe(200);
    expect(prismaMock.promise.update).toHaveBeenCalled();
    expect(response.body).toMatchObject({ status: 'COMPLETED', comments_count: 0 });
  });

  test('POST /api/v1/promises/:id/comments cria comentário', async () => {
    prismaMock.promiseComment.create.mockResolvedValue({
      id: 5,
      promiseId: 30,
      content: 'Atualização importante',
      createdAt: new Date('2024-06-01T00:00:00Z'),
    });

    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/promises/30/comments')
      .send({ content: 'Atualização importante' });

    expect(response.status).toBe(201);
    expect(prismaMock.promiseComment.create).toHaveBeenCalled();
    expect(response.body.content).toBe('Atualização importante');
  });

  test('GET /api/v1/elections retorna eleições', async () => {
    prismaMock.election.findMany.mockResolvedValue([
      {
        id: 10,
        year: 2024,
        description: 'Municipais',
        type: 'MUNICIPAL',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/elections');

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 10, year: 2024, type: 'MUNICIPAL' });
  });

  test('POST /api/v1/elections cria eleição', async () => {
    prismaMock.election.create.mockResolvedValue({
      id: 11,
      year: 2026,
      description: null,
      type: 'FEDERAL_ESTADUAL',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    const app = buildApp();
    const response = await request(app).post('/api/v1/elections').send({ year: 2026 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 11, year: 2026, type: 'FEDERAL_ESTADUAL' });
  });

  test('GET /api/v1/offices retorna cargos', async () => {
    prismaMock.office.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Prefeito',
        description: null,
        type: 'MUNICIPAL',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/offices');

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 1, name: 'Prefeito', type: 'MUNICIPAL' });
  });

  test('GET /api/v1/offices filtra por tipo', async () => {
    prismaMock.office.findMany.mockResolvedValue([
      {
        id: 2,
        name: 'Governador',
        description: null,
        type: 'FEDERAL_ESTADUAL',
        createdAt: new Date('2024-02-01T00:00:00Z'),
        updatedAt: new Date('2024-02-01T00:00:00Z'),
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/offices').query({ type: 'FEDERAL_ESTADUAL' });

    expect(response.status).toBe(200);
    expect(prismaMock.office.findMany).toHaveBeenCalledWith({
      where: { type: 'FEDERAL_ESTADUAL' },
      orderBy: { id: 'asc' },
    });
    expect(response.body[0]).toMatchObject({ name: 'Governador', type: 'FEDERAL_ESTADUAL' });
  });

  test('GET /api/v1/offices rejeita tipo inválido', async () => {
    const app = buildApp();
    const response = await request(app).get('/api/v1/offices').query({ type: 'INVALIDO' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Tipo de eleição inválido. Use FEDERAL_ESTADUAL ou MUNICIPAL.',
    });
    expect(prismaMock.office.findMany).not.toHaveBeenCalled();
  });

  test('POST /api/v1/offices cria cargo', async () => {
    prismaMock.office.create.mockResolvedValue({
      id: 2,
      name: 'Governador',
      description: null,
      type: 'FEDERAL_ESTADUAL',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
    });

    const app = buildApp();
    const response = await request(app).post('/api/v1/offices').send({ name: 'Governador' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 2, name: 'Governador', type: 'FEDERAL_ESTADUAL' });
  });

  test('PATCH /api/v1/offices/:id atualiza cargo', async () => {
    prismaMock.office.update.mockResolvedValue({
      id: 2,
      name: 'Governador',
      description: 'Atualizado',
      type: 'FEDERAL_ESTADUAL',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-03-01T00:00:00Z'),
    });

    const app = buildApp();
    const response = await request(app).patch('/api/v1/offices/2').send({ description: 'Atualizado' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 2, description: 'Atualizado' });
  });

  test('GET /api/v1/political-parties retorna partidos', async () => {
    prismaMock.politicalParty.findMany.mockResolvedValue([
      {
        id: 1,
        acronym: 'MDB',
        number: 15,
        name: 'MOVIMENTO DEMOCRATICO BRASILEIRO',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/political-parties');

    expect(response.status).toBe(200);
    expect(prismaMock.politicalParty.findMany).toHaveBeenCalledWith({
      orderBy: [{ number: 'asc' }, { acronym: 'asc' }],
    });
    expect(response.body[0]).toMatchObject({ acronym: 'MDB', number: 15 });
  });

  test('GET /api/v1/states retorna estados', async () => {
    prismaMock.state.findMany.mockResolvedValue([
      { codigoUf: 35, name: 'Sao Paulo', abbreviation: 'SP' },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/states');

    expect(response.status).toBe(200);
    expect(prismaMock.state.findMany).toHaveBeenCalledWith({ orderBy: { abbreviation: 'asc' } });
    expect(response.body[0]).toMatchObject({ codigo_uf: 35, abbreviation: 'SP' });
  });

  test('GET /api/v1/cities exige state_code', async () => {
    const app = buildApp();
    const response = await request(app).get('/api/v1/cities');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Parâmetro state_code é obrigatório e deve ser numérico.' });
    expect(prismaMock.city.findMany).not.toHaveBeenCalled();
  });

  test('GET /api/v1/cities retorna cidades por estado', async () => {
    prismaMock.city.findMany.mockResolvedValue([
      { id: 1, ibgeCode: 3550308, name: 'Sao Paulo', stateCode: 35 },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/cities').query({ state_code: 35 });

    expect(response.status).toBe(200);
    expect(prismaMock.city.findMany).toHaveBeenCalledWith({
      where: { stateCode: 35 },
      orderBy: { name: 'asc' },
    });
    expect(response.body[0]).toMatchObject({ ibge_code: 3550308, state_code: 35 });
  });

  test('GET /api/v1/candidates exige officeId no filtro', async () => {
    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Parâmetro officeId é obrigatório e deve ser numérico.' });
    expect(prismaMock.candidate.findMany).not.toHaveBeenCalled();
  });
});
