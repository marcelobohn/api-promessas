import prisma from '../../db';

export const findCitiesByState = (stateCode: number) =>
  prisma.city.findMany({
    where: { stateCode },
    orderBy: { name: 'asc' },
  });
