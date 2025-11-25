import request from 'supertest';
import { buildApp, prismaMock } from './helpers/app';

describe('Political parties routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
