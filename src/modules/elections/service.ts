import { ValidationError } from '../../core/errors';
import { delCache, getCache, setCache } from '../../infra/cache';
import { formatElection } from '../../utils/formatters';
import { createElection, findAllElections } from './repository';

export const listElections = async () => {
  const cacheKey = 'elections:all';
  const cached = await getCache<ReturnType<typeof formatElection>[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const elections = await findAllElections();
  const formatted = elections.map(formatElection);
  await setCache(cacheKey, formatted, Number(process.env.ELECTIONS_CACHE_TTL ?? 300));

  return formatted;
};

export const createNewElection = async (data: { year: number; description: string | null }) => {
  try {
    const election = await createElection(data);
    await delCache('elections:all');
    return formatElection(election);
  } catch (error) {
    console.error('Erro ao criar eleição:', error);
    throw new ValidationError('Não foi possível criar a eleição. Verifique se o ano já existe.');
  }
};
