const express = require('express');
const db = require('../db');

const router = express.Router();

// Rota para LISTAR todos os candidatos (GET /api/v1/candidates)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM candidates ORDER BY id ASC');
    res.status(200).json(rows);
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
    const queryText = `
      INSERT INTO candidates (name, political_party, election_year, office)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, political_party, election_year, office];
    const { rows } = await db.query(queryText, values);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

