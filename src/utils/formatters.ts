import { Candidate, Election, Office, Promise as CampaignPromise, PromiseComment, State, City } from '@prisma/client';

export interface CandidateResponse {
  id: number;
  name: string;
  political_party_id: number | null;
  political_party: string | null;
  office_id: number;
  office: string;
  election_id: number | null;
  election_year: number | null;
  state_code: number | null;
  state_name: string | null;
  city_id: number | null;
  city_name: string | null;
  comments_count: number;
  promises_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PoliticalPartyResponse {
  id: number;
  acronym: string;
  number: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface StateResponse {
  codigo_uf: number;
  name: string;
  abbreviation: string;
}

export interface CityResponse {
  id: number;
  ibge_code: number;
  name: string;
  state_code: number;
}

export interface PromiseCommentResponse {
  id: number;
  promise_id: number;
  content: string;
  created_at: Date;
}

export interface PromiseResponse {
  id: number;
  candidate_id: number;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
  comments: PromiseCommentResponse[];
}

export const formatElection = (election: Election) => ({
  id: election.id,
  year: election.year,
  description: election.description ?? null,
  type: election.type,
  created_at: election.createdAt,
  updated_at: election.updatedAt,
});

export const formatOffice = (office: Office) => ({
  id: office.id,
  name: office.name,
  description: office.description ?? null,
  type: office.type,
});

export const formatCandidate = (
  candidate: Candidate & {
    election?: Election | null;
    office?: Office;
    politicalParty?: { acronym: string; id: number } | null;
    state?: State | null;
    city?: City | null;
    promises?: { _count: { comments: number } }[];
    commentsCount?: number;
    promisesCount?: number;
  }
): CandidateResponse => ({
  id: candidate.id,
  name: candidate.name,
  political_party_id: candidate.politicalPartyId ?? null,
  political_party: candidate.politicalParty ? candidate.politicalParty.acronym : null,
  office_id: candidate.officeId,
  office: candidate.office?.name ?? '',
  election_id: candidate.electionId ?? null,
  election_year: candidate.election?.year ?? null,
  state_code: candidate.stateCode ?? candidate.state?.codigoUf ?? null,
  state_name: candidate.state?.name ?? null,
  city_id: candidate.cityId ?? candidate.city?.id ?? null,
  city_name: candidate.city?.name ?? null,
  comments_count:
    typeof candidate.commentsCount === 'number'
      ? candidate.commentsCount
      : (candidate.promises ?? []).reduce((acc, p) => acc + (p._count?.comments ?? 0), 0),
  promises_count:
    typeof candidate.promisesCount === 'number'
      ? candidate.promisesCount
      : candidate.promises?.length ?? 0,
  created_at: candidate.createdAt,
  updated_at: candidate.updatedAt,
});

export const formatPoliticalParty = (party: { id: number; acronym: string; number: number; name: string; createdAt: Date; updatedAt: Date }): PoliticalPartyResponse => ({
  id: party.id,
  acronym: party.acronym,
  number: party.number,
  name: party.name,
  created_at: party.createdAt,
  updated_at: party.updatedAt,
});

export const formatState = (state: State): StateResponse => ({
  codigo_uf: state.codigoUf,
  name: state.name,
  abbreviation: state.abbreviation,
});

export const formatCity = (city: City): CityResponse => ({
  id: city.id,
  ibge_code: city.ibgeCode,
  name: city.name,
  state_code: city.stateCode,
});

export const formatPromiseComment = (comment: PromiseComment): PromiseCommentResponse => ({
  id: comment.id,
  promise_id: comment.promiseId,
  content: comment.content,
  created_at: comment.createdAt,
});

export const formatPromise = (
  promise: CampaignPromise & { comments?: PromiseComment[] }
): PromiseResponse => ({
  id: promise.id,
  candidate_id: promise.candidateId,
  title: promise.title,
  description: promise.description ?? null,
  status: promise.status,
  progress: promise.progress,
  comments_count: promise.comments?.length ?? 0,
  created_at: promise.createdAt,
  updated_at: promise.updatedAt,
  comments: (promise.comments ?? []).map(formatPromiseComment),
});
