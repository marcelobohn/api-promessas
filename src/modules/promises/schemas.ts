import { PromiseStatus } from '@prisma/client';
import { ValidationError } from '../../core/errors';

export interface UpdatePromiseInput {
  title?: string;
  description?: string | null;
  status?: PromiseStatus | string;
  progress?: number;
}

export interface CreateCommentInput {
  content?: string;
}

export const validatePromiseId = (promiseId: string) => {
  const parsed = Number(promiseId);
  if (Number.isNaN(parsed)) {
    throw new ValidationError('ID da promessa inválido.');
  }
  return parsed;
};

export const validateUpdatePromise = (body: UpdatePromiseInput) => {
  const data: UpdatePromiseInput = {};
  if (typeof body.title !== 'undefined') data.title = body.title;
  if (typeof body.description !== 'undefined') data.description = body.description ?? null;
  if (typeof body.status !== 'undefined') data.status = (body.status as PromiseStatus) ?? PromiseStatus.NOT_STARTED;
  if (typeof body.progress !== 'undefined') data.progress = body.progress;

  if (Object.keys(data).length === 0) {
    throw new ValidationError('Nenhum campo para atualizar foi enviado.');
  }

  return data;
};

export const validateCreateComment = (body: CreateCommentInput) => {
  if (!body.content || !body.content.trim()) {
    throw new ValidationError('Comentário é obrigatório.');
  }
  return { content: body.content.trim() };
};
