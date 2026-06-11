export type TPostingPekerjaanHistory = { 
    id: string;
    title: string;
    slug: string;
    location: string;
    employment_type: string;
    department: string;
    salary: string;
    is_active: boolean;
    posted_at: string;
    closed_at?: string;
    applications_count: number;
    updated_at: string;
}

export type TFilterPostingHistory = {
  limit?: number;
  cursor?: string;
  job_title?: string;
};


export type TFilterPostingPekerjaan = {
  limit?: number;
  cursor?: string;
  job_title?: string;
};

export type TPostingHistoryData = {
  next_cursor: string | null;
  list: TPostingPekerjaanHistory[];
};

export type TPostingHistoryResponse = {
  job_positions: TPostingHistoryData;
  message: string;
};