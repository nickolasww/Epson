export type TJobStatus = 'active' | 'draft';
export type TEmploymentType = 'full_time' | 'contract' | 'part_time' | 'internship';

export interface TJobPosting {
  id: string;
  title: string;
  location: string;
  slug: string;
  department: string;
  salary?: string | null;
  employment_type: TEmploymentType;
  requirements: string;
  responsibilities: string;
  publication_status: TJobStatus;
  is_active: boolean;
  closed_at: string;
  applicant_count: number;
  posted_at: string;
  updated_at: string;
}

export interface TJobPostingRequest {
  title: string;
  location: string;
  slug: string;
  department: string;
  salary?: string | null;
  employment_type: TEmploymentType;
  requirements: string;
  responsibilities: string;
  publication_status: TJobStatus;
  is_active: boolean;
  closed_at: string | null;
}

export interface TFilterJobPosting {
  limit?: number;
  cursor?: string;
  status?: TJobStatus;
  search?: string;
}

// Response structure matching the API
export type TJobPostingsData = {
  list: TJobPosting[];
  total_applicant: number;
  total_active: number;
  total_vacancy: number;
  next_cursor: string | null;
};

export type TJobPostingsResponse = {
  job_positions: TJobPostingsData;
  message: string;
};

// Single job posting detail response
export type TJobPostingDetailData = {
  job_positions: TJobPosting;
  message: string;
};

// Update response (only returns message)
export type TJobPostingUpdateResponse = {
  message: string;
};

export type TJobPostingListResponse = TJobPostingsResponse;
export type TJobPostingDetailResponse = TJobPostingDetailData;
