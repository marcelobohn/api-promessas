import { Candidate, Promise as CampaignPromise, PromiseComment } from '@prisma/client';

export interface CandidateResponse {
  id: number;
  name: string;
  political_party: string | null;
  election_year: number | null;
  office: string;
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

export const formatCandidate = (candidate: Candidate): CandidateResponse => ({
  id: candidate.id,
  name: candidate.name,
  political_party: candidate.politicalParty,
  election_year: candidate.electionYear,
  office: candidate.office,
  created_at: candidate.createdAt,
  updated_at: candidate.updatedAt,
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
