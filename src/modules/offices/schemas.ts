import { ValidationError } from '../../core/errors';

const allowedTypes = ['FEDERAL_ESTADUAL', 'MUNICIPAL'] as const;
export type OfficeType = (typeof allowedTypes)[number];

export interface CreateOfficeInput {
  name?: string;
  description?: string | null;
}

export interface UpdateOfficeInput {
  name?: string;
  description?: string | null;
}

export const parseListQuery = (typeParam: unknown): { type?: OfficeType } => {
  const normalized = typeof typeParam === 'string' ? typeParam.toUpperCase() : undefined;

  if (normalized && !allowedTypes.includes(normalized as OfficeType)) {
    throw new ValidationError('Tipo de eleição inválido. Use FEDERAL_ESTADUAL ou MUNICIPAL.');
  }

  return normalized ? { type: normalized as OfficeType } : {};
};

export const validateCreateOffice = (body: CreateOfficeInput) => {
  if (!body.name) {
    throw new ValidationError('Nome do cargo é obrigatório.');
  }

  return {
    name: body.name,
    description: body.description ?? null,
  };
};

export const validateUpdateOffice = (body: UpdateOfficeInput) => {
  if (typeof body.name === 'undefined' && typeof body.description === 'undefined') {
    throw new ValidationError('Informe ao menos um campo para atualizar.');
  }

  return {
    name: body.name,
    description: typeof body.description === 'undefined' ? undefined : body.description ?? null,
  };
};
