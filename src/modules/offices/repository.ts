import prisma from '../../db';

export const findMany = (type?: 'FEDERAL_ESTADUAL' | 'MUNICIPAL') => {
  return prisma.office.findMany({
    where: type ? { type } : undefined,
    orderBy: { id: 'asc' },
  });
};

export const createOffice = (data: { name: string; description: string | null }) => {
  return prisma.office.create({
    data,
  });
};

export const updateOffice = (id: number, data: { name?: string; description?: string | null }) => {
  return prisma.office.update({
    where: { id },
    data,
  });
};
