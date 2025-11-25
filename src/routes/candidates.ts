import { Router, Request, Response } from 'express';
import { PromiseStatus } from '@prisma/client';
import prisma from '../db';
import { authenticate } from '../middlewares/auth';
import { formatCandidate, formatPromise } from '../utils/formatters';

interface CandidateRequestBody {
  name?: string;
  political_party_id?: number | null;
  election_id?: number | null;
  office_id?: number | null;
  state_code?: number | null;
  city_id?: number | null;
}

interface CreatePromiseRequestBody {
  title?: string;
  description?: string | null;
  status?: PromiseStatus | string;
  progress?: number;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { electionId, officeId, state_code, city_id } = req.query;
  let parsedElectionId: number | undefined;
  const parsedOfficeId = Number(officeId);
  const parsedStateCode = typeof state_code !== 'undefined' ? Number(state_code) : undefined;
  const parsedCityId = typeof city_id !== 'undefined' ? Number(city_id) : undefined;

  if (Number.isNaN(parsedOfficeId)) {
    return res.status(400).json({ error: 'Parâmetro officeId é obrigatório e deve ser numérico.' });
  }

  if (typeof electionId !== 'undefined') {
    const parsed = Number(electionId);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ error: 'Parâmetro electionId inválido.' });
    }
    parsedElectionId = parsed;
  }

  try {
    if (typeof parsedStateCode !== 'undefined' && Number.isNaN(parsedStateCode)) {
      return res.status(400).json({ error: 'Parâmetro state_code inválido.' });
    }
    if (typeof parsedCityId !== 'undefined' && Number.isNaN(parsedCityId)) {
      return res.status(400).json({ error: 'Parâmetro city_id inválido.' });
    }

    const where: any = { officeId: parsedOfficeId };
    if (parsedElectionId) where.electionId = parsedElectionId;
    if (typeof parsedStateCode === 'number' && !Number.isNaN(parsedStateCode)) where.stateCode = parsedStateCode;
    if (typeof parsedCityId === 'number' && !Number.isNaN(parsedCityId)) where.cityId = parsedCityId;

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        election: true,
        office: true,
        politicalParty: true,
        state: true,
        city: true,
        promises: {
          select: {
            _count: { select: { comments: true } },
          },
        },
      },
    });

    const withCounts = candidates.map((candidate) => ({
      ...candidate,
      commentsCount: (candidate.promises ?? []).reduce((acc, p) => acc + (p._count?.comments ?? 0), 0),
      promisesCount: candidate.promises?.length ?? 0,
    }));

    res.status(200).json(withCounts.map(formatCandidate));
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authenticate, async (req: Request<unknown, unknown, CandidateRequestBody>, res: Response) => {
  const { name, political_party_id, election_id, office_id, state_code, city_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  if (typeof office_id !== 'number') {
    return res.status(400).json({ error: 'office_id é obrigatório.' });
  }

  try {
    let electionIdValue: number | null = null;
    if (typeof election_id !== 'undefined' && election_id !== null) {
      const election = await prisma.election.findUnique({ where: { id: election_id } });
      if (!election) {
        return res.status(404).json({ error: 'Eleição não encontrada.' });
      }
      electionIdValue = election.id;
    }

    let politicalPartyIdValue: number | null = null;
    if (typeof political_party_id !== 'undefined' && political_party_id !== null) {
      const party = await prisma.politicalParty.findUnique({ where: { id: political_party_id } });
      if (!party) {
        return res.status(404).json({ error: 'Partido não encontrado.' });
      }
      politicalPartyIdValue = party.id;
    }

    const office = await prisma.office.findUnique({ where: { id: office_id } });
    if (!office) {
      return res.status(404).json({ error: 'Cargo (office) não encontrado.' });
    }

    const noLocation = ['Presidente'];
    const stateOnly = ['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'];
    const cityRequired = ['Prefeito', 'Vereador'];

    let stateCodeValue: number | null = null;
    let cityIdValue: number | null = null;

    if (noLocation.includes(office.name)) {
      if (typeof state_code !== 'undefined' || typeof city_id !== 'undefined') {
        return res
          .status(400)
          .json({ error: 'Para Presidente não informe state_code nem city_id.' });
      }
    } else if (cityRequired.includes(office.name) || office.type === 'MUNICIPAL') {
      if (typeof city_id !== 'number') {
        return res.status(400).json({ error: 'Para cargos municipais, city_id é obrigatório.' });
      }
      const city = await prisma.city.findUnique({
        where: { id: city_id },
        select: { id: true, stateCode: true },
      });
      if (!city) {
        return res.status(404).json({ error: 'Cidade não encontrada.' });
      }
      if (typeof state_code === 'number' && state_code !== city.stateCode) {
        return res.status(400).json({ error: 'state_code informado não corresponde à cidade.' });
      }
      cityIdValue = city.id;
      stateCodeValue = city.stateCode;
    } else if (stateOnly.includes(office.name)) {
      if (typeof state_code !== 'number') {
        return res
          .status(400)
          .json({ error: 'Para este cargo, state_code é obrigatório e city_id não é permitido.' });
      }
      if (typeof city_id !== 'undefined' && city_id !== null) {
        return res
          .status(400)
          .json({ error: 'city_id não é permitido para este cargo.' });
      }
      const state = await prisma.state.findUnique({ where: { codigoUf: state_code } });
      if (!state) {
        return res.status(404).json({ error: 'Estado não encontrado.' });
      }
      stateCodeValue = state.codigoUf;
    } else {
      // fallback: cargos federais/estaduais permitem state_code opcional, city proibido
      if (typeof city_id !== 'undefined' && city_id !== null) {
        return res
          .status(400)
          .json({ error: 'city_id só é permitido para cargos municipais.' });
      }
      if (typeof state_code === 'number') {
        const state = await prisma.state.findUnique({ where: { codigoUf: state_code } });
        if (!state) {
          return res.status(404).json({ error: 'Estado não encontrado.' });
        }
        stateCodeValue = state.codigoUf;
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        politicalPartyId: politicalPartyIdValue,
        electionId: electionIdValue,
        officeId: office.id,
        stateCode: stateCodeValue,
        cityId: cityIdValue,
      },
      include: { election: true, office: true, politicalParty: true, state: true, city: true },
    });

    res.status(201).json(formatCandidate(candidate));
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const ensureCandidateExists = async (candidateId: number) => {
  return prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true },
  });
};

const parseProgress = (progress: number | undefined) => {
  if (typeof progress === 'undefined' || progress === null) {
    return 0;
  }
  if (progress < 0 || progress > 100) {
    throw new Error('O progresso deve estar entre 0 e 100.');
  }
  return Math.round(progress);
};

router.get('/:candidateId/promises', async (req: Request, res: Response) => {
  const candidateId = Number(req.params.candidateId);

  if (Number.isNaN(candidateId)) {
    return res.status(400).json({ error: 'ID do candidato inválido.' });
  }

  try {
    const exists = await ensureCandidateExists(candidateId);
    if (!exists) {
      return res.status(404).json({ error: 'Candidato não encontrado.' });
    }

    const promises = await prisma.promise.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      include: { comments: { orderBy: { createdAt: 'desc' } } },
    });

    res.status(200).json(promises.map(formatPromise));
  } catch (error) {
    console.error('Erro ao buscar promessas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post(
  '/:candidateId/promises',
  authenticate,
  async (req: Request<{ candidateId: string }, unknown, CreatePromiseRequestBody>, res: Response) => {
    const candidateId = Number(req.params.candidateId);
    const { title, description, status, progress } = req.body;

    if (Number.isNaN(candidateId)) {
      return res.status(400).json({ error: 'ID do candidato inválido.' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Título da promessa é obrigatório.' });
    }

    let progressValue: number;
    try {
      progressValue = parseProgress(progress);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }

    try {
      const exists = await ensureCandidateExists(candidateId);
      if (!exists) {
        return res.status(404).json({ error: 'Candidato não encontrado.' });
      }

      const promise = await prisma.promise.create({
        data: {
          title,
          description: description ?? null,
          status: (status as PromiseStatus) ?? PromiseStatus.NOT_STARTED,
          progress: progressValue,
          candidateId,
        },
        include: { comments: { orderBy: { createdAt: 'desc' } } },
      });

      res.status(201).json(formatPromise(promise));
    } catch (error) {
      console.error('Erro ao criar promessa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

export default router;
