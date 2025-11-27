import { getCache, setCache } from '../../infra/cache';
import { formatCity } from '../../utils/formatters';
import { findCitiesByState } from './repository';

export const listCities = async (stateCode: number) => {
  const cacheKey = `cities:${stateCode}`;
  const cached = await getCache<ReturnType<typeof formatCity>[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const cities = await findCitiesByState(stateCode);
  const formatted = cities.map(formatCity);
  await setCache(cacheKey, formatted, Number(process.env.CITIES_CACHE_TTL ?? 300));

  return formatted;
};
