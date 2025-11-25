import { PromiseStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../core/errors';
import { formatCandidate, formatPromise } from '../../utils/formatters';
import {
  createCandidate,
  createPromiseForCandidate,
  findCandidateById,
  findCandidates,
  findCityById,
  findElectionById,
  findOfficeById,
  findPartyById,
  findPromisesByCandidate,
  findStateByCode,
} from './repository';
import { CandidateQuery, CreateCandidateInput, CreatePromiseInput } from './schemas';

export const listCandidates = async (filters: CandidateQuery) => {
  const where: any = { officeId: filters.officeId };
  if (filters.electionId) where.electionId = filters.electionId;
  if (typeof filters.state_code === 'number' && !Number.isNaN(filters.state_code)) where.stateCode = filters.state_code;
  if (typeof filters.city_id === 'number' && !Number.isNaN(filters.city_id)) where.cityId = filters.city_id;

  const candidates = await findCandidates(where);
  const withCounts = candidates.map((candidate) => ({
    ...candidate,
    commentsCount: (candidate.promises ?? []).reduce((acc, p) => acc + (p._count?.comments ?? 0), 0),
    promisesCount: candidate.promises?.length ?? 0,
  }));

  return withCounts.map(formatCandidate);
};

export const createNewCandidate = async (input: CreateCandidateInput) => {
  const { name, political_party_id, election_id, office_id, state_code, city_id } = input;

  let electionIdValue: number | null = null;
  if (typeof election_id !== 'undefined' && election_id !== null) {
    const election = await findElectionById(election_id);
    if (!election) {
      throw new NotFoundError('Eleição não encontrada.');
    }
    electionIdValue = election.id;
  }

  let politicalPartyIdValue: number | null = null;
  if (typeof political_party_id !== 'undefined' && political_party_id !== null) {
    const party = await findPartyById(political_party_id);
    if (!party) {
      throw new NotFoundError('Partido não encontrado.');
    }
    politicalPartyIdValue = party.id;
  }

  const office = await findOfficeById(office_id!);
  if (!office) {
    throw new NotFoundError('Cargo (office) não encontrado.');
  }

  const noLocation = ['Presidente'];
  const stateOnly = ['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'];
  const cityRequired = ['Prefeito', 'Vereador'];

  let stateCodeValue: number | null = null;
  let cityIdValue: number | null = null;

  if (noLocation.includes(office.name)) {
    if (typeof state_code !== 'undefined' || typeof city_id !== 'undefined') {
      throw new ValidationError('Para Presidente não informe state_code nem city_id.');
    }
  } else if (cityRequired.includes(office.name) || office.type === 'MUNICIPAL') {
    if (typeof city_id !== 'number') {
      throw new ValidationError('Para cargos municipais, city_id é obrigatório.');
    }
    const city = await findCityById(city_id);
    if (!city) {
      throw new NotFoundError('Cidade não encontrada.');
    }
    if (typeof state_code === 'number' && state_code !== city.stateCode) {
      throw new ValidationError('state_code informado não corresponde à cidade.');
    }
    cityIdValue = city.id;
    stateCodeValue = city.stateCode;
  } else if (stateOnly.includes(office.name)) {
    if (typeof state_code !== 'number') {
      throw new ValidationError('Para este cargo, state_code é obrigatório e city_id não é permitido.');
    }
    if (typeof city_id !== 'undefined' && city_id !== null) {
      throw new ValidationError('city_id não é permitido para este cargo.');
    }
    const state = await findStateByCode(state_code);
    if (!state) {
      throw new NotFoundError('Estado não encontrado.');
    }
    stateCodeValue = state.codigoUf;
  } else {
    if (typeof city_id !== 'undefined' && city_id !== null) {
      throw new ValidationError('city_id só é permitido para cargos municipais.');
    }
    if (typeof state_code === 'number') {
      const state = await findStateByCode(state_code);
      if (!state) {
        throw new NotFoundError('Estado não encontrado.');
      }
      stateCodeValue = state.codigoUf;
    }
  }

  const candidate = await createCandidate({
    name: name!,
    politicalPartyId: politicalPartyIdValue,
    electionId: electionIdValue,
    officeId: office.id,
    stateCode: stateCodeValue,
    cityId: cityIdValue,
  });

  return formatCandidate(candidate);
};

const parseProgress = (progress: number | undefined) => {
  if (typeof progress === 'undefined' || progress === null) {
    return 0;
  }
  if (progress < 0 || progress > 100) {
    throw new ValidationError('O progresso deve estar entre 0 e 100.');
  }
  return Math.round(progress);
};

export const listCandidatePromises = async (candidateId: number) => {
  const exists = await findCandidateById(candidateId);
  if (!exists) {
    throw new NotFoundError('Candidato não encontrado.');
  }

  const promises = await findPromisesByCandidate(candidateId);
  return promises.map(formatPromise);
};

export const createCandidatePromise = async (
  candidateId: number,
  data: CreatePromiseInput
) => {
  const exists = await findCandidateById(candidateId);
  if (!exists) {
    throw new NotFoundError('Candidato não encontrado.');
  }

  const progressValue = parseProgress(data.progress);
  const promise = await createPromiseForCandidate({
    title: data.title!,
    description: data.description ?? null,
    status: (data.status as PromiseStatus) ?? PromiseStatus.NOT_STARTED,
    progress: progressValue,
    candidateId,
  });

  return formatPromise(promise);
};
