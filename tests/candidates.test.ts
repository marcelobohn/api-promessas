import request from 'supertest';
import { buildApp, buildToken, prismaMock } from './helpers/app';

describe('Candidate routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/v1/candidates returns list ordered by id', async () => {
    prismaMock.candidate.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Alice',
        number: null,
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
        number: null,
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
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ political_party_id: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Nome é obrigatório.' });
    expect(prismaMock.candidate.create).not.toHaveBeenCalled();
  });

  test('POST /api/v1/candidates exige office_id', async () => {
    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ name: 'Bob' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'office_id é obrigatório.' });
  });

  test('POST /api/v1/candidates creates a candidate', async () => {
    prismaMock.election.findUnique.mockResolvedValue({ id: 10, year: 2024 });
    prismaMock.office.findUnique.mockResolvedValue({ id: 5, name: 'Vereador', type: 'MUNICIPAL' });
    prismaMock.politicalParty.findUnique.mockResolvedValue({ id: 1, acronym: 'MDB' });
    prismaMock.city.findUnique.mockResolvedValue({ id: 12345, stateCode: 35 });
    const createdCandidate = {
      id: 42,
      name: 'Bob',
      number: 123,
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
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ name: 'Bob', number: 123, office_id: 5, election_id: 10, political_party_id: 1, city_id: 12345 });

    expect(response.status).toBe(201);
    expect(prismaMock.office.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(prismaMock.candidate.create).toHaveBeenCalled();
    expect(response.body).toMatchObject({
      id: 42,
      number: 123,
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

  test('POST /api/v1/candidates valida state_code da cidade', async () => {
    prismaMock.election.findUnique.mockResolvedValue({ id: 10, year: 2024 });
    prismaMock.office.findUnique.mockResolvedValue({ id: 5, name: 'Vereador', type: 'MUNICIPAL' });
    prismaMock.city.findUnique.mockResolvedValue({ id: 12345, stateCode: 35 });

    const app = buildApp();
    const response = await request(app)
      .post('/api/v1/candidates')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ name: 'Bob', number: 123, office_id: 5, election_id: 10, city_id: 12345, state_code: 99 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'state_code informado não corresponde à cidade.' });
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
      .set('Authorization', `Bearer ${buildToken()}`)
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

  test('GET /api/v1/candidates exige officeId no filtro', async () => {
    const app = buildApp();
    const response = await request(app).get('/api/v1/candidates');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Parâmetro officeId é obrigatório e deve ser numérico.' });
    expect(prismaMock.candidate.findMany).not.toHaveBeenCalled();
  });
});
