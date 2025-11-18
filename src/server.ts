import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import candidateRoutes from './routes/candidates';

dotenv.config();

const app = express();
const port = parseInt(process.env.APP_PORT || '3000', 10);

const swaggerPath = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.parse(fs.readFileSync(swaggerPath, 'utf8'));

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});

app.get('/', (_req, res) => {
  res.send('API de Promessas de Campanha no ar!');
});

app.use('/api/v1/candidates', candidateRoutes);

app.listen(port, () => {
  console.log(`Servidor da API de Promessas rodando na porta ${port}`);
});

export default app;
