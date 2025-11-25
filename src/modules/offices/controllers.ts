import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import { listOffices, createNewOffice, updateExistingOffice } from './service';
import { parseListQuery, validateCreateOffice, validateUpdateOffice } from './schemas';

export const getOffices = async (req: Request, res: Response) => {
  try {
    const { type } = parseListQuery(req.query.type);
    const offices = await listOffices(type);
    res.status(200).json(offices);
  } catch (error) {
    handleError(error, res);
  }
};

export const createOffice = async (req: Request, res: Response) => {
  try {
    const input = validateCreateOffice(req.body);
    const office = await createNewOffice(input);
    res.status(201).json(office);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateOffice = async (req: Request<{ officeId: string }>, res: Response) => {
  const officeId = Number(req.params.officeId);

  if (Number.isNaN(officeId)) {
    return res.status(400).json({ error: 'ID do cargo inválido.' });
  }

  try {
    const input = validateUpdateOffice(req.body);
    const office = await updateExistingOffice(officeId, input);
    res.status(200).json(office);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Erro interno no módulo offices:', error);
  return res.status(500).json({ error: 'Erro interno do servidor' });
};
