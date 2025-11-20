import { Router, Request, Response } from 'express';
import prisma from '../db';
import { formatOffice } from '../utils/formatters';

interface CreateOfficeRequest {
  name?: string;
  description?: string | null;
}

interface UpdateOfficeRequest {
  name?: string;
  description?: string | null;
}

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const offices = await prisma.office.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(offices.map(formatOffice));
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request<unknown, unknown, CreateOfficeRequest>, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome do cargo é obrigatório.' });
  }

  try {
    const office = await prisma.office.create({
      data: {
        name,
        description: description ?? null,
      },
    });

    res.status(201).json(formatOffice(office));
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    res.status(400).json({ error: 'Não foi possível criar o cargo. Verifique se o nome já existe.' });
  }
});

router.patch(
  '/:officeId',
  async (req: Request<{ officeId: string }, unknown, UpdateOfficeRequest>, res: Response) => {
    const officeId = Number(req.params.officeId);

    if (Number.isNaN(officeId)) {
      return res.status(400).json({ error: 'ID do cargo inválido.' });
    }

    const { name, description } = req.body;

    if (typeof name === 'undefined' && typeof description === 'undefined') {
      return res.status(400).json({ error: 'Informe ao menos um campo para atualizar.' });
    }

    try {
      const office = await prisma.office.update({
        where: { id: officeId },
        data: {
          name,
          description: typeof description === 'undefined' ? undefined : description ?? null,
        },
      });

      res.status(200).json(formatOffice(office));
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      res.status(404).json({ error: 'Cargo não encontrado.' });
    }
  }
);

export default router;
