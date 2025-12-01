import { PromiseStatus } from '@prisma/client';
import { ValidationError } from '../../core/errors';

export interface CandidateQuery {
  electionId?: number;
  officeId: number;
  state_code?: number;
  city_id?: number;
}

export interface CreateCandidateInput {
  name?: string;
  number?: number | null;
  political_party_id?: number | null;
  election_id?: number | null;
  office_id?: number | null;
  state_code?: number | null;
  city_id?: number | null;
}

export interface CreatePromiseInput {
  title?: string;
  description?: string | null;
  status?: PromiseStatus | string;
  progress?: number;
}

export const parseListQuery = (query: any): CandidateQuery => {
  const { electionId, officeId, state_code, city_id } = query;
  const parsedOfficeId = Number(officeId);

  if (Number.isNaN(parsedOfficeId)) {
    throw new ValidationError('Parâmetro officeId é obrigatório e deve ser numérico.');
  }

  let parsedElectionId: number | undefined;
  if (typeof electionId !== 'undefined') {
    const parsed = Number(electionId);
    if (Number.isNaN(parsed)) {
      throw new ValidationError('Parâmetro electionId inválido.');
    }
    parsedElectionId = parsed;
  }

  const parsedStateCode = typeof state_code !== 'undefined' ? Number(state_code) : undefined;
  const parsedCityId = typeof city_id !== 'undefined' ? Number(city_id) : undefined;

  if (typeof parsedStateCode !== 'undefined' && Number.isNaN(parsedStateCode)) {
    throw new ValidationError('Parâmetro state_code inválido.');
  }
  if (typeof parsedCityId !== 'undefined' && Number.isNaN(parsedCityId)) {
    throw new ValidationError('Parâmetro city_id inválido.');
  }

  return {
    officeId: parsedOfficeId,
    electionId: parsedElectionId,
    state_code: parsedStateCode,
    city_id: parsedCityId,
  };
};

export const validateCreateCandidate = (body: CreateCandidateInput) => {
  if (!body.name) {
    throw new ValidationError('Nome é obrigatório.');
  }
  if (typeof body.office_id !== 'number') {
    throw new ValidationError('office_id é obrigatório.');
  }

  if (typeof body.number !== 'number') {
    throw new ValidationError('Número do candidato é obrigatório e deve ser numérico.');
  }

  const invalidNumberFields =
    (typeof body.election_id !== 'undefined' && body.election_id !== null && typeof body.election_id !== 'number') ||
    (typeof body.political_party_id !== 'undefined' &&
      body.political_party_id !== null &&
      typeof body.political_party_id !== 'number') ||
    (typeof body.number !== 'undefined' && body.number !== null && typeof body.number !== 'number') ||
    (typeof body.state_code !== 'undefined' && body.state_code !== null && typeof body.state_code !== 'number') ||
    (typeof body.city_id !== 'undefined' && body.city_id !== null && typeof body.city_id !== 'number');

  if (invalidNumberFields) {
    throw new ValidationError('Campos numéricos inválidos.');
  }

  return body;
};

export const validateCreatePromise = (body: CreatePromiseInput) => {
  if (!body.title) {
    throw new ValidationError('Título da promessa é obrigatório.');
  }
  return body;
};
