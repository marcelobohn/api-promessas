import { NotFoundError, ValidationError } from '../../core/errors';
import { getCache, setCache, delByPattern } from '../../infra/cache';
import { formatOffice } from '../../utils/formatters';
import { createOffice, findMany, updateOffice } from './repository';
import { OfficeType } from './schemas';

export const listOffices = async (type?: OfficeType) => {
  const cacheKey = `offices:${type ?? 'all'}`;
  const cached = await getCache<ReturnType<typeof formatOffice>[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const offices = await findMany(type);
  const formatted = offices.map(formatOffice);
  await setCache(cacheKey, formatted, Number(process.env.OFFICES_CACHE_TTL ?? 300));

  return formatted;
};

export const createNewOffice = async (data: { name: string; description: string | null }) => {
  try {
    const office = await createOffice(data);
    await delByPattern('offices:*');
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
    await delByPattern('offices:*');
    return formatOffice(office);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    throw new NotFoundError('Cargo não encontrado.');
  }
};
