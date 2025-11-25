import request from 'supertest';
import bcrypt from 'bcryptjs';
import { buildApp, prismaMock } from './helpers/app';

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/auth/register cria usuário e retorna token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      name: 'Tester',
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = buildApp();
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Tester',
      email: 'USER@example.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({ id: 1, email: 'user@example.com' });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  test('POST /api/v1/auth/login autentica usuário existente', async () => {
    const passwordHash = await bcrypt.hash('123456', 1);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 2,
      name: 'Tester',
      email: 'tester@example.com',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = buildApp();
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'tester@example.com',
      password: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({ id: 2, email: 'tester@example.com' });
  });

  test('POST /api/v1/auth/register retorna 409 para email duplicado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'user@example.com' });

    const app = buildApp();
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Tester',
      email: 'user@example.com',
      password: '123456',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email já cadastrado.' });
  });

  test('POST /api/v1/auth/login retorna 401 para senha incorreta', async () => {
    const passwordHash = await bcrypt.hash('123456', 1);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 2,
      name: 'Tester',
      email: 'tester@example.com',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = buildApp();
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'tester@example.com',
      password: 'wrong',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Credenciais inválidas.' });
  });
});
