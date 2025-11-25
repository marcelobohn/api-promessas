import prisma from '../../db';

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
  });

export const createUser = (data: { name: string; email: string; passwordHash: string }) =>
  prisma.user.create({ data });
