import bcrypt from 'bcryptjs';
import { AppError } from '../../core/errors';
import { createAccessToken } from '../../middlewares/auth';
import { findUserByEmail, createUser } from './repository';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const normalizedEmail = normalizeEmail(data.email);
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('Email já cadastrado.', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    name: data.name,
    email: normalizedEmail,
    passwordHash,
  });

  const token = createAccessToken({ userId: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const normalizedEmail = normalizeEmail(data.email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const passwordOk = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordOk) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const token = createAccessToken({ userId: user.id, email: user.email });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};
