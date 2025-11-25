import { ValidationError } from '../../core/errors';
import { formatElection } from '../../utils/formatters';
import { createElection, findAllElections } from './repository';

export const listElections = async () => {
  const elections = await findAllElections();
  return elections.map(formatElection);
};

export const createNewElection = async (data: { year: number; description: string | null }) => {
  try {
    const election = await createElection(data);
    return formatElection(election);
  } catch (error) {
    console.error('Erro ao criar eleição:', error);
    throw new ValidationError('Não foi possível criar a eleição. Verifique se o ano já existe.');
  }
};
