import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatState } from '../utils/formatters';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const states = await prisma.state.findMany({ orderBy: { abbreviation: 'asc' } });
    res.status(200).json(states.map(formatState));
  } catch (error) {
    console.error('Erro ao listar estados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
