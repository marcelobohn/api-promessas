import { getCache, setCache } from '../../infra/cache';
import { formatPoliticalParty } from '../../utils/formatters';
import { findParties } from './repository';

export const listParties = async () => {
  const cacheKey = 'parties:all';
  const cached = await getCache<ReturnType<typeof formatPoliticalParty>[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const parties = await findParties();
  const formatted = parties.map(formatPoliticalParty);
  await setCache(cacheKey, formatted, Number(process.env.PARTIES_CACHE_TTL ?? 300));

  return formatted;
};
