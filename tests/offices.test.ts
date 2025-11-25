import request from 'supertest';
import { buildApp, buildToken, prismaMock } from './helpers/app';

describe('Office routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const response = await request(app)
      .post('/api/v1/offices')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ name: 'Governador' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 2, name: 'Governador', type: 'FEDERAL_ESTADUAL' });
  });

  test('PATCH /api/v1/offices/:id exige token e atualiza cargo', async () => {
    prismaMock.office.update.mockResolvedValue({
      id: 2,
      name: 'Governador',
      description: 'Atualizado',
      type: 'FEDERAL_ESTADUAL',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-03-01T00:00:00Z'),
    });

    const app = buildApp();
    const unauthorized = await request(app).patch('/api/v1/offices/2').send({ description: 'Atualizado' });
    expect(unauthorized.status).toBe(401);

    const invalidToken = await request(app)
      .patch('/api/v1/offices/2')
      .set('Authorization', 'Bearer invalid')
      .send({ description: 'Atualizado' });
    expect(invalidToken.status).toBe(401);

    const authedResponse = await request(app)
      .patch('/api/v1/offices/2')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ description: 'Atualizado' });

    expect(authedResponse.status).toBe(200);
    expect(authedResponse.body).toMatchObject({ id: 2, description: 'Atualizado' });
  });
});
