import { getCache, setCache } from '../../infra/cache';
import { formatState } from '../../utils/formatters';
import { findStates } from './repository';

export const listStates = async () => {
  const cacheKey = 'states:all';
  const cached = await getCache<ReturnType<typeof formatState>[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const states = await findStates();
  const formatted = states.map(formatState);
  await setCache(cacheKey, formatted, Number(process.env.STATES_CACHE_TTL ?? 300));

  return formatted;
};
