import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatCandidate, formatPromise } from '../utils/formatters';

interface CandidateRequestBody {
  name?: string;
  political_party?: string | null;
  election_year?: number | null;
  office?: string;
}

interface CreatePromiseRequestBody {
  title?: string;
  description?: string | null;
  status?: string;
  progress?: number;
}

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json(candidates.map(formatCandidate));
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request<unknown, unknown, CandidateRequestBody>, res: Response) => {
  const { name, political_party, election_year, office } = req.body;

  if (!name || !office) {
    return res.status(400).json({ error: 'Nome e cargo são campos obrigatórios.' });
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        name,
        politicalParty: political_party || null,
        electionYear: typeof election_year === 'number' ? election_year : null,
        office,
      },
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
