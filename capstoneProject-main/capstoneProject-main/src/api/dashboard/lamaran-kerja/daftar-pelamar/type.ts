import type { TResponseData } from "@/commons/types/response";

export type TApplicationStatus = 'submitted' | 'short_listed' | 'hired' | 'rejected';

export type TJobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  job_title: string;
  email: string;
  file_id: string;
  status: TApplicationStatus;
  phone_number: string;
  submitted_at: string;
  interview_at?: string;
};

export type TApplicationRequest = {
  job_id?: string;
  file_id?: string;
  phone_number?: string;
  status?: TApplicationStatus;
  interview_at?: string;
};

export type TFilterApplication = {
  limit?: number;
  cursor?: string;
  status?: TApplicationStatus;
  job_title?: string;
};

// Cursor-based pagination response
export type TJobApplicationsData = {
  next_cursor: string | null;
  list: TJobApplication[];
};

export type TJobApplicationsResponse = {
  job_applications: TJobApplicationsData;
  message: string;
};

export type TApplicationListResponse = TJobApplicationsResponse;
export type TApplicationDetailResponse = TResponseData<TJobApplication>;
