import request from 'supertest';
import { buildApp, prismaMock } from './helpers/app';

describe('State routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
