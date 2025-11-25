import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import { listCities } from './service';
import { parseCityQuery } from './schemas';

export const getCities = async (req: Request, res: Response) => {
  try {
    const { stateCode } = parseCityQuery(req.query.state_code);
    const cities = await listCities(stateCode);
    res.status(200).json(cities);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Erro ao listar cidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
