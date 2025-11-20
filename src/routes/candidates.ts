import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatCandidate, formatPromise } from '../utils/formatters';

interface CandidateRequestBody {
  name?: string;
  political_party_id?: number | null;
  election_id?: number | null;
  office_id?: number | null;
}

interface CreatePromiseRequestBody {
  title?: string;
  description?: string | null;
  status?: string;
  progress?: number;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { electionId } = req.query;
  let parsedElectionId: number | undefined;

  if (typeof electionId !== 'undefined') {
    const parsed = Number(electionId);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ error: 'Parâmetro electionId inválido.' });
    }
    parsedElectionId = parsed;
  }

  try {
    const candidates = await prisma.candidate.findMany({
      where: parsedElectionId ? { electionId: parsedElectionId } : undefined,
      orderBy: { id: 'asc' },
      include: { election: true, office: true, politicalParty: true },
    });
    res.status(200).json(candidates.map(formatCandidate));
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request<unknown, unknown, CandidateRequestBody>, res: Response) => {
  const { name, political_party_id, election_id, office_id } = req.body;

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

    const candidate = await prisma.candidate.create({
      data: {
        name,
        politicalPartyId: politicalPartyIdValue,
        electionId: electionIdValue,
        officeId: office.id,
      },
      include: { election: true, office: true, politicalParty: true },
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
          status: status || 'NOT_STARTED',
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
