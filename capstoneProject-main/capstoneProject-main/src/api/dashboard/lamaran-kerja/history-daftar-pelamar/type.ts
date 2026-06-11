export type TJobApplicationHistory = { 
    id: string;
    job_id: string;
    applicant_id: string;
    file_id: string;
    job_title: string;
    email: string;
    status: string;
    phone_number: string;
    submitted_at: string;
    address: string;
    interview_at?: string;
}



export type TJobApplicationsHistoryData = {
  next_cursor: string | null;
  list: TJobApplicationHistory[];
};

export type TJobApplicationsHistoryResponse = {
  job_applications: TJobApplicationsHistoryData;
  message: string;
};

export type TApplicationListHistoryResponse = TJobApplicationsHistoryResponse;