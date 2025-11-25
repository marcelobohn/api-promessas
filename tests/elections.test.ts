import request from 'supertest';
import { buildApp, buildToken, prismaMock } from './helpers/app';

describe('Election routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const response = await request(app)
      .post('/api/v1/elections')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ year: 2026 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 11, year: 2026, type: 'FEDERAL_ESTADUAL' });
  });

  test('POST /api/v1/elections retorna 400 sem ano', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/elections')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Ano da eleição é obrigatório.' });
  });
});
