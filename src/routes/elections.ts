import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate } from '../middlewares/auth';
import { formatElection } from '../utils/formatters';

interface CreateElectionRequest {
  year?: number;
  description?: string | null;
}

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { year: 'desc' },
    });
    res.status(200).json(elections.map(formatElection));
  } catch (error) {
    console.error('Erro ao buscar eleições:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authenticate, async (req: Request<unknown, unknown, CreateElectionRequest>, res: Response) => {
  const { year, description } = req.body;

  if (typeof year !== 'number') {
    return res.status(400).json({ error: 'Ano da eleição é obrigatório.' });
  }

  try {
    const election = await prisma.election.create({
      data: {
        year,
        description: description ?? null,
      },
    });

    res.status(201).json(formatElection(election));
  } catch (error) {
    console.error('Erro ao criar eleição:', error);
    res.status(400).json({ error: 'Não foi possível criar a eleição. Verifique se o ano já existe.' });
  }
});

export default router;
