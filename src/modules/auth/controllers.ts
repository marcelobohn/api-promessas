import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import { loginUser, registerUser } from './service';
import { validateLogin, validateRegister } from './schemas';

export const register = async (req: Request, res: Response) => {
  try {
    const input = validateRegister(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const input = validateLogin(req.body);
    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Erro ao autenticar usuário:', error);
  res.status(500).json({ error: 'Erro interno ao autenticar.' });
};
