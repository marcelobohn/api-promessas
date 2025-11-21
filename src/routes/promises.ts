import { Router, Request, Response } from 'express';
import { PromiseStatus } from '@prisma/client';
import prisma from '../db';
import { formatPromise, formatPromiseComment } from '../utils/formatters';

interface UpdatePromiseRequestBody {
  title?: string;
  description?: string | null;
  status?: PromiseStatus | string;
  progress?: number;
}

interface CreateCommentRequestBody {
  content?: string;
}

const parseProgress = (progress: number | undefined) => {
  if (typeof progress === 'undefined' || progress === null) {
    return undefined;
  }
  if (progress < 0 || progress > 100) {
    throw new Error('O progresso deve estar entre 0 e 100.');
  }
  return Math.round(progress);
};

const router = Router();

router.patch('/:promiseId', async (req: Request, res: Response) => {
  const promiseId = Number(req.params.promiseId);
  const { title, description, status, progress } = req.body as UpdatePromiseRequestBody;

  if (Number.isNaN(promiseId)) {
    return res.status(400).json({ error: 'ID da promessa inválido.' });
  }

  let parsedProgress: number | undefined;
  try {
    parsedProgress = parseProgress(progress);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }

  const data: {
    title?: string;
    description?: string | null;
    status?: PromiseStatus;
    progress?: number;
  } = {};
  if (typeof title !== 'undefined') data.title = title;
  if (typeof description !== 'undefined') data.description = description ?? null;
  if (typeof status !== 'undefined') data.status = (status as PromiseStatus) ?? PromiseStatus.NOT_STARTED;
  if (typeof parsedProgress !== 'undefined') data.progress = parsedProgress;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar foi enviado.' });
  }

  try {
    const updated = await prisma.promise.update({
      where: { id: promiseId },
      data,
      include: { comments: { orderBy: { createdAt: 'desc' } } },
    });

    res.status(200).json(formatPromise(updated));
  } catch (error) {
    console.error('Erro ao atualizar promessa:', error);
    res.status(404).json({ error: 'Promessa não encontrada.' });
  }
});

router.post('/:promiseId/comments', async (req: Request, res: Response) => {
  const promiseId = Number(req.params.promiseId);
  const { content } = req.body as CreateCommentRequestBody;

  if (Number.isNaN(promiseId)) {
    return res.status(400).json({ error: 'ID da promessa inválido.' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comentário é obrigatório.' });
  }

  try {
    const comment = await prisma.promiseComment.create({
      data: {
        content: content.trim(),
        promiseId,
      },
    });

    res.status(201).json(formatPromiseComment(comment));
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(404).json({ error: 'Promessa não encontrada.' });
  }
});

export default router;
