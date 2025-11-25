import request from 'supertest';
import { buildApp, prismaMock } from './helpers/app';

describe('City routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
