import { formatCity } from '../../utils/formatters';
import { findCitiesByState } from './repository';

export const listCities = async (stateCode: number) => {
  const cities = await findCitiesByState(stateCode);
  return cities.map(formatCity);
};
