import { PromiseStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../core/errors';
import { formatPromise, formatPromiseComment } from '../../utils/formatters';
import { createComment, updatePromiseById } from './repository';

const parseProgress = (progress: number | undefined) => {
  if (typeof progress === 'undefined' || progress === null) {
    return undefined;
  }
  if (progress < 0 || progress > 100) {
    throw new ValidationError('O progresso deve estar entre 0 e 100.');
  }
  return Math.round(progress);
};

export const updatePromise = async (
  promiseId: number,
  data: { title?: string; description?: string | null; status?: PromiseStatus; progress?: number }
) => {
  let parsedProgress: number | undefined;
  if (typeof data.progress !== 'undefined') {
    parsedProgress = parseProgress(data.progress);
  }

  const payload: any = {};
  if (typeof data.title !== 'undefined') payload.title = data.title;
  if (typeof data.description !== 'undefined') payload.description = data.description ?? null;
  if (typeof data.status !== 'undefined') payload.status = data.status ?? PromiseStatus.NOT_STARTED;
  if (typeof parsedProgress !== 'undefined') payload.progress = parsedProgress;

  try {
    const updated = await updatePromiseById(promiseId, payload);
    return formatPromise(updated);
  } catch (error) {
    console.error('Erro ao atualizar promessa:', error);
    throw new NotFoundError('Promessa não encontrada.');
  }
};

export const addComment = async (promiseId: number, content: string) => {
  try {
    const comment = await createComment(promiseId, content);
    return formatPromiseComment(comment);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw new NotFoundError('Promessa não encontrada.');
  }
};
