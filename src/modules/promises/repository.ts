import prisma from '../../db';

export const updatePromiseById = (promiseId: number, data: any) => {
  return prisma.promise.update({
    where: { id: promiseId },
    data,
    include: { comments: { orderBy: { createdAt: 'desc' } } },
  });
};

export const createComment = (promiseId: number, content: string) =>
  prisma.promiseComment.create({
    data: {
      content,
      promiseId,
    },
  });
