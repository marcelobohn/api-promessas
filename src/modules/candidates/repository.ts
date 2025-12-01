import prisma from '../../db';

export const findCandidates = (where: any) => {
  return prisma.candidate.findMany({
    where,
    orderBy: { id: 'asc' },
    include: {
      election: true,
      office: true,
      politicalParty: true,
      state: true,
      city: true,
      promises: {
        select: {
          _count: { select: { comments: true } },
        },
      },
    },
  });
};

export const createCandidate = (data: {
  name: string;
  politicalPartyId: number | null;
  electionId: number | null;
  officeId: number;
  number?: number | null;
  stateCode: number | null;
  cityId: number | null;
}) => {
  return prisma.candidate.create({
    data,
    include: { election: true, office: true, politicalParty: true, state: true, city: true },
  });
};

export const findElectionById = (id: number) => prisma.election.findUnique({ where: { id } });
export const findPartyById = (id: number) => prisma.politicalParty.findUnique({ where: { id } });
export const findOfficeById = (id: number) => prisma.office.findUnique({ where: { id } });
export const findStateByCode = (codigoUf: number) => prisma.state.findUnique({ where: { codigoUf } });
export const findCityById = (id: number) =>
  prisma.city.findUnique({ where: { id }, select: { id: true, stateCode: true } });

export const findCandidateById = (id: number) =>
  prisma.candidate.findUnique({
    where: { id },
    select: { id: true },
  });

export const findPromisesByCandidate = (candidateId: number) =>
  prisma.promise.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
    include: { comments: { orderBy: { createdAt: 'desc' } } },
  });

export const createPromiseForCandidate = (data: {
  title: string;
  description: string | null;
  status: import('@prisma/client').PromiseStatus;
  progress: number;
  candidateId: number;
}) =>
  prisma.promise.create({
    data,
    include: { comments: { orderBy: { createdAt: 'desc' } } },
  });
