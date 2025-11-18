const express = require('express');
const prisma = require('../db');

const formatCandidate = (candidate) => ({
  id: candidate.id,
  name: candidate.name,
  political_party: candidate.politicalParty,
  election_year: candidate.electionYear,
  office: candidate.office,
  created_at: candidate.createdAt,
  updated_at: candidate.updatedAt,
});

const router = express.Router();

// Rota para LISTAR todos os candidatos (GET /api/v1/candidates)
router.get('/', async (req, res) => {
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

// Rota para CRIAR um novo candidato (POST /api/v1/candidates)
router.post('/', async (req, res) => {
  const { name, political_party, election_year, office } = req.body;

  // Validação simples
  if (!name || !office) {
    return res.status(400).json({ error: 'Nome e cargo são campos obrigatórios.' });
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        name,
        politicalParty: political_party || null,
        electionYear: election_year ?? null,
        office,
      },
    });

    res.status(201).json(formatCandidate(candidate));
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
