import request from 'supertest';
import express from 'express';
import candidateRoutes from '../src/routes/candidates';
import promiseRoutes from '../src/routes/promises';
import prisma from '../src/db';

jest.mock('../src/db', () => ({
  candidate: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  promise: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  promiseComment: {
    create: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as {
  candidate: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
  };
  promise: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  promiseComment: {
    create: jest.Mock;
  };
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/candidates', candidateRoutes);
  app.use('/api/v1/promises', promiseRoutes);
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
    expect(response.body.status).toBe('COMPLETED');
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
});
