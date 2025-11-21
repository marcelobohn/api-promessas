import { Candidate, Election, Office, Promise as CampaignPromise, PromiseComment } from '@prisma/client';

export interface CandidateResponse {
  id: number;
  name: string;
  political_party_id: number | null;
  political_party: string | null;
  office_id: number;
  office: string;
  election_id: number | null;
  election_year: number | null;
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
  candidate: Candidate & { election?: Election | null; office?: Office; politicalParty?: { acronym: string; id: number } | null }
): CandidateResponse => ({
  id: candidate.id,
  name: candidate.name,
  political_party_id: candidate.politicalPartyId ?? null,
  political_party: candidate.politicalParty ? candidate.politicalParty.acronym : null,
  office_id: candidate.officeId,
  office: candidate.office?.name ?? '',
  election_id: candidate.electionId ?? null,
  election_year: candidate.election?.year ?? null,
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
  created_at: promise.createdAt,
  updated_at: promise.updatedAt,
  comments: (promise.comments ?? []).map(formatPromiseComment),
});
