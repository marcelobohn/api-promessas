import prisma from '../../db';

export const findParties = () =>
  prisma.politicalParty.findMany({
    orderBy: [{ number: 'asc' }, { acronym: 'asc' }],
  });
