import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: number;
  email: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || 'default_jwt_secret';

export const createAccessToken = (payload: AuthPayload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou inválido.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    res.locals.authUser = decoded;
    next();
  } catch (error) {
    console.error('Erro ao validar token JWT:', error);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
