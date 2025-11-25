import { Request, Response } from 'express';
import { listParties } from './service';

export const getParties = async (_req: Request, res: Response) => {
  try {
    const parties = await listParties();
    res.status(200).json(parties);
  } catch (error) {
    console.error('Erro ao listar partidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
