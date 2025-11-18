import request from 'supertest';
import express from 'express';
import candidateRoutes from '../src/routes/candidates';
import prisma from '../src/db';

jest.mock('../src/db', () => ({
  candidate: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as {
  candidate: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/candidates', candidateRoutes);
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
        politicalParty: 'ABC',
        electionYear: 2024,
        office: 'Prefeita',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      },
    ]);

    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: 'Alice',
        political_party: 'ABC',
        election_year: 2024,
        office: 'Prefeita',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      },
    ]);
    expect(prismaMock.candidate.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  test('POST /api/v1/candidates validates required fields', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .send({ political_party: 'XYZ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Nome e cargo são campos obrigatórios.' });
    expect(prismaMock.candidate.create).not.toHaveBeenCalled();
  });

  test('POST /api/v1/candidates creates a candidate', async () => {
    const createdCandidate = {
      id: 42,
      name: 'Bob',
      politicalParty: null,
      electionYear: null,
      office: 'Vereador',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
    };

    prismaMock.candidate.create.mockResolvedValue(createdCandidate);

    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .send({ name: 'Bob', office: 'Vereador' });

    expect(response.status).toBe(201);
    expect(prismaMock.candidate.create).toHaveBeenCalledWith({
      data: {
        name: 'Bob',
        politicalParty: null,
        electionYear: null,
        office: 'Vereador',
      },
    });
    expect(response.body).toEqual({
      id: 42,
      name: 'Bob',
      political_party: null,
      election_year: null,
      office: 'Vereador',
      created_at: '2024-02-01T00:00:00.000Z',
      updated_at: '2024-02-01T00:00:00.000Z',
    });
  });

  test('GET /api/v1/candidates handles errors', async () => {
    prismaMock.candidate.findMany.mockRejectedValue(new Error('db down'));
    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Erro interno do servidor' });
  });
});
