require('dotenv').config();
const express = require('express');
const candidateRoutes = require('./routes/candidates');

const app = express();
const port = parseInt(process.env.APP_PORT || '3000', 10);

// Middleware para analisar o corpo das requisições em JSON
app.use(express.json());

// Rota principal da API
app.get('/', (req, res) => {
  res.send('API de Promessas de Campanha no ar!');
});

// Conecta as rotas de candidatos com o prefixo /api/v1/candidates
app.use('/api/v1/candidates', candidateRoutes);

app.listen(port, () => {
  console.log(`Servidor da API de Promessas rodando na porta ${port}`);
});
