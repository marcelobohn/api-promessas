import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import prisma from './db';
import candidateRoutes from './modules/candidates/routes';
import promiseRoutes from './modules/promises/routes';
import electionRoutes from './modules/elections/routes';
import officeRoutes from './modules/offices/routes';
import politicalPartyRoutes from './modules/political-parties/routes';
import stateRoutes from './modules/states/routes';
import cityRoutes from './modules/cities/routes';
import authRoutes from './modules/auth/routes';

dotenv.config();

const app = express();
const port = parseInt(process.env.APP_PORT || '3000', 10);

const swaggerPath = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.parse(fs.readFileSync(swaggerPath, 'utf8'));

app.use(express.json());
app.use(cors());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});

app.get('/', (_req, res) => {
  res.send('API de Promessas de Campanha no ar!');
});

app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/promises', promiseRoutes);
app.use('/api/v1/elections', electionRoutes);
app.use('/api/v1/offices', officeRoutes);
app.use('/api/v1/political-parties', politicalPartyRoutes);
app.use('/api/v1/states', stateRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/auth', authRoutes);

const server = app.listen(port, () => {
  console.log(`Servidor da API de Promessas rodando na porta ${port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}. Closing server...`);
  const forceTimeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 10000);
  const timeout = setTimeout(() => {
    console.error('Shutdown timed out, forcing exit.');
    process.exit(1);
  }, forceTimeoutMs);

  server.close(async (err) => {
    if (err) {
      console.error('Error closing server:', err);
      clearTimeout(timeout);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting Prisma:', error);
    } finally {
      clearTimeout(timeout);
      process.exit(0);
    }
  });
};

['SIGTERM', 'SIGINT'].forEach((sig) => {
  process.on(sig as NodeJS.Signals, shutdown);
});

export default app;
