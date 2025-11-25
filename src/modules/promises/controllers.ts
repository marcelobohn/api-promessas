import { Request, Response } from 'express';
import { AppError } from '../../core/errors';
import { addComment, updatePromise } from './service';
import { validateCreateComment, validatePromiseId, validateUpdatePromise } from './schemas';

export const patchPromise = async (req: Request<{ promiseId: string }>, res: Response) => {
  try {
    const promiseId = validatePromiseId(req.params.promiseId);
    const body = validateUpdatePromise(req.body);
    const updated = await updatePromise(promiseId, {
      ...body,
      progress: body.progress,
      status: body.status as any,
    });
    res.status(200).json(updated);
  } catch (error) {
    handleError(error, res);
  }
};

export const createComment = async (req: Request<{ promiseId: string }>, res: Response) => {
  try {
    const promiseId = validatePromiseId(req.params.promiseId);
    const { content } = validateCreateComment(req.body);
    const comment = await addComment(promiseId, content);
    res.status(201).json(comment);
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Erro interno no módulo promises:', error);
  return res.status(500).json({ error: 'Erro interno do servidor' });
};
