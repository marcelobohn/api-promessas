import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import {
  listCandidates,
  createNewCandidate,
  listCandidatePromises,
  createCandidatePromise,
} from './service';
import { parseListQuery, validateCreateCandidate, validateCreatePromise } from './schemas';

export const getCandidates = async (req: Request, res: Response) => {
  try {
    const filters = parseListQuery(req.query);
    const result = await listCandidates(filters);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const input = validateCreateCandidate(req.body);
    const result = await createNewCandidate(input);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const getCandidatePromises = async (req: Request<{ candidateId: string }>, res: Response) => {
  const candidateId = Number(req.params.candidateId);

  if (Number.isNaN(candidateId)) {
    return res.status(400).json({ error: 'ID do candidato inválido.' });
  }

  try {
    const result = await listCandidatePromises(candidateId);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const createPromise = async (req: Request<{ candidateId: string }>, res: Response) => {
  const candidateId = Number(req.params.candidateId);

  if (Number.isNaN(candidateId)) {
    return res.status(400).json({ error: 'ID do candidato inválido.' });
  }

  try {
    const input = validateCreatePromise(req.body);
    const result = await createCandidatePromise(candidateId, input);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Erro interno no módulo candidates:', error);
  return res.status(500).json({ error: 'Erro interno do servidor' });
};
