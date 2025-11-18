import { Router, Request, Response } from 'express';
import { Candidate } from '@prisma/client';
import prisma from '../db';

interface CandidateRequestBody {
  name?: string;
  political_party?: string | null;
  election_year?: number | null;
  office?: string;
}

interface CandidateResponse {
  id: number;
  name: string;
  political_party: string | null;
  election_year: number | null;
  office: string;
  created_at: Date;
  updated_at: Date;
}

const formatCandidate = (candidate: Candidate): CandidateResponse => ({
  id: candidate.id,
  name: candidate.name,
  political_party: candidate.politicalParty,
  election_year: candidate.electionYear,
  office: candidate.office,
  created_at: candidate.createdAt,
  updated_at: candidate.updatedAt,
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json(candidates.map(formatCandidate));
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request<unknown, unknown, CandidateRequestBody>, res: Response) => {
  const { name, political_party, election_year, office } = req.body;

  if (!name || !office) {
    return res.status(400).json({ error: 'Nome e cargo são campos obrigatórios.' });
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        name,
        politicalParty: political_party || null,
        electionYear: typeof election_year === 'number' ? election_year : null,
        office,
      },
    });

    res.status(201).json(formatCandidate(candidate));
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
