import { NotFoundError, ValidationError } from '../../core/errors';
import { formatOffice } from '../../utils/formatters';
import { createOffice, findMany, updateOffice } from './repository';
import { OfficeType } from './schemas';

export const listOffices = async (type?: OfficeType) => {
  const offices = await findMany(type);
  return offices.map(formatOffice);
};

export const createNewOffice = async (data: { name: string; description: string | null }) => {
  try {
    const office = await createOffice(data);
    return formatOffice(office);
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    throw new ValidationError('Não foi possível criar o cargo. Verifique se o nome já existe.');
  }
};

export const updateExistingOffice = async (
  officeId: number,
  data: { name?: string; description?: string | null }
) => {
  try {
    const office = await updateOffice(officeId, data);
    return formatOffice(office);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    throw new NotFoundError('Cargo não encontrado.');
  }
};
