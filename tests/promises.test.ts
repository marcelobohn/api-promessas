import request from 'supertest';
import { buildApp, buildToken, prismaMock } from './helpers/app';

describe('Promise routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ status: 'COMPLETED', progress: 100 });

    expect(response.status).toBe(200);
    expect(prismaMock.promise.update).toHaveBeenCalled();
    expect(response.body).toMatchObject({ status: 'COMPLETED', comments_count: 0 });
  });

  test('PATCH /api/v1/promises/:id rejeita progresso inválido', async () => {
    const app = buildApp();
    const response = await request(app)
      .patch('/api/v1/promises/30')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ progress: 120 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'O progresso deve estar entre 0 e 100.' });
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
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ content: 'Atualização importante' });

    expect(response.status).toBe(201);
    expect(prismaMock.promiseComment.create).toHaveBeenCalled();
    expect(response.body.content).toBe('Atualização importante');
  });

  test('POST /api/v1/promises/:id/comments exige conteúdo', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/promises/30/comments')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ content: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Comentário é obrigatório.' });
  });
});
