import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import { createNewElection, listElections } from './service';
import { validateCreateElection } from './schemas';

export const getElections = async (_req: Request, res: Response) => {
  try {
    const elections = await listElections();
    res.status(200).json(elections);
  } catch (error) {
    handleError(error, res);
  }
};

export const createElection = async (req: Request, res: Response) => {
  try {
    const input = validateCreateElection(req.body);
    const election = await createNewElection(input);
    res.status(201).json(election);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Erro interno no módulo elections:', error);
  return res.status(500).json({ error: 'Erro interno do servidor' });
};
