import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatPoliticalParty } from '../utils/formatters';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const parties = await prisma.politicalParty.findMany({
      orderBy: [{ number: 'asc' }, { acronym: 'asc' }],
    });
    res.status(200).json(parties.map(formatPoliticalParty));
  } catch (error) {
    console.error('Erro ao listar partidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
