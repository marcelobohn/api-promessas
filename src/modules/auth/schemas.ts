import { ValidationError } from '../../core/errors';

export interface RegisterInput {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginInput {
  email?: string;
  password?: string;
}

export const validateRegister = (body: RegisterInput) => {
  if (!body.name || !body.email || !body.password) {
    throw new ValidationError('Nome, email e senha são obrigatórios.');
  }
  if (body.password.length < 6) {
    throw new ValidationError('A senha deve ter pelo menos 6 caracteres.');
  }
  return {
    name: body.name,
    email: body.email,
    password: body.password,
  };
};

export const validateLogin = (body: LoginInput) => {
  if (!body.email || !body.password) {
    throw new ValidationError('Email e senha são obrigatórios.');
  }
  return {
    email: body.email,
    password: body.password,
  };
};
