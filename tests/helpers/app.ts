import express from 'express';
import jwt from 'jsonwebtoken';
import candidateRoutes from '../../src/modules/candidates/routes';
import promiseRoutes from '../../src/modules/promises/routes';
import electionRoutes from '../../src/modules/elections/routes';
import officeRoutes from '../../src/modules/offices/routes';
import politicalPartyRoutes from '../../src/modules/political-parties/routes';
import stateRoutes from '../../src/modules/states/routes';
import cityRoutes from '../../src/modules/cities/routes';
import authRoutes from '../../src/modules/auth/routes';
import prisma from '../../src/db';

jest.mock('../../src/db', () => ({
  candidate: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  city: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  state: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  promise: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  promiseComment: {
    create: jest.fn(),
  },
  election: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  politicalParty: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  office: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

export const prismaMock = prisma as unknown as {
  candidate: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
  };
  city: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  state: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  promise: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  promiseComment: {
    create: jest.Mock;
  };
  election: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };
  politicalParty: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  office: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

export const buildToken = () =>
  jwt.sign({ userId: 1, email: 'tester@example.com' }, process.env.JWT_SECRET || 'default_jwt_secret');

export const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/candidates', candidateRoutes);
  app.use('/api/v1/promises', promiseRoutes);
  app.use('/api/v1/elections', electionRoutes);
  app.use('/api/v1/offices', officeRoutes);
  app.use('/api/v1/political-parties', politicalPartyRoutes);
  app.use('/api/v1/states', stateRoutes);
  app.use('/api/v1/cities', cityRoutes);
  return app;
};

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}
