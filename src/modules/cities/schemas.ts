import { ValidationError } from '../../core/errors';

export const parseCityQuery = (stateCodeParam: unknown) => {
  const stateCode = Number(stateCodeParam);

  if (!stateCodeParam || Number.isNaN(stateCode)) {
    throw new ValidationError('Parâmetro state_code é obrigatório e deve ser numérico.');
  }

  return { stateCode };
};
