import prisma from '../../db';

export const findStates = () => prisma.state.findMany({ orderBy: { abbreviation: 'asc' } });
