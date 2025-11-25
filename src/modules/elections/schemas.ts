import { ValidationError } from '../../core/errors';

export interface CreateElectionInput {
  year?: number;
  description?: string | null;
}

export const validateCreateElection = (body: CreateElectionInput) => {
  if (typeof body.year !== 'number') {
    throw new ValidationError('Ano da eleição é obrigatório.');
  }

  return {
    year: body.year,
    description: body.description ?? null,
  };
};
