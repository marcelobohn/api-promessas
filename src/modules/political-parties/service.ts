import { formatPoliticalParty } from '../../utils/formatters';
import { findParties } from './repository';

export const listParties = async () => {
  const parties = await findParties();
  return parties.map(formatPoliticalParty);
};
