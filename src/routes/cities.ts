import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatCity } from '../utils/formatters';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const stateCode = Number(req.query.state_code);

  if (!req.query.state_code || Number.isNaN(stateCode)) {
    return res.status(400).json({ error: 'Parâmetro state_code é obrigatório e deve ser numérico.' });
  }

  try {
    const cities = await prisma.city.findMany({
      where: { stateCode },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(cities.map(formatCity));
  } catch (error) {
    console.error('Erro ao listar cidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
