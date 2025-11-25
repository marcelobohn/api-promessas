import prisma from '../../db';

export const findAllElections = () =>
  prisma.election.findMany({
    orderBy: { year: 'desc' },
  });

export const createElection = (data: { year: number; description: string | null }) =>
  prisma.election.create({ data });
