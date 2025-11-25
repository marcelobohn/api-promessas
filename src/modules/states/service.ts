import { formatState } from '../../utils/formatters';
import { findStates } from './repository';

export const listStates = async () => {
  const states = await findStates();
  return states.map(formatState);
};
