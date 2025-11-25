import { Request, Response } from 'express';
import { listStates } from './service';

export const getStates = async (_req: Request, res: Response) => {
  try {
    const states = await listStates();
    res.status(200).json(states);
  } catch (error) {
    console.error('Erro ao listar estados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
