import { api } from "@/libs/axios";
import type { TResponseData } from "@/commons/types/response";
import type { 
  TApplicationListResponse, 
  TApplicationRequest, 
  TFilterApplication,
  TJobApplication
} from "./type";

/**
 * Get list of job applications with cursor-based pagination
 * @param params - Filter parameters including limit and cursor
 * @returns Promise with job applications list
 */
export const getJobApplications = async (
  params: TFilterApplication = {}
): Promise<TApplicationListResponse> => {
  const { limit = 10, cursor, status, job_title } = params;
  
  const queryParams: Record<string, string> = {
    limit: limit.toString(),
  };
  
  if (cursor) {
    queryParams.cursor = cursor;
  }
  
  if (status) {
    queryParams.status = status;
  }
  
  if (job_title) {
    queryParams.job_title = job_title;
  }

  console.log('Fetching job applications with params:', queryParams);

  try {
    const response = await api.get(
      '/job-applications/admin',
      { params: queryParams }
    );
    
    console.log('Raw response:', response);
    console.log('Response data:', response.data);
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data && responseData.data.job_applications) {
      responseData = responseData.data;
    }
    
    // Ensure proper structure
    const result: TApplicationListResponse = {
      job_applications: {
        list: responseData.job_applications?.list || [],
        next_cursor: responseData.job_applications?.next_cursor || null,
      },
      message: responseData.message || 'success',
    };
    
    console.log('Formatted result:', result);
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get detail of a specific job application
 * @param params - Object containing application id
 * @returns Promise with job application detail
 */
export const getDetailJobApplication = async (id: string) => {
  const { data } = await api.get(`/job-applications/admin/${id}`);
  return data.job_applications as TJobApplication;
};

/**
 * Delete a job application
 * @param params - Object containing application id
 * @returns Promise with delete response
 */
export const deleteJobApplication = async (
  params: { id: string }
): Promise<TResponseData<null>> => {
  const response = await api.delete<TResponseData<null>>(
    `/job-applications/admin/${params.id}`
  );
  
  return response.data;
};

/**
 * Update a job application status or data
 * @param params - Object containing application id
 * @param req - Partial application data to update
 * @returns Promise with update response
 */
export const updateJobApplication = async (
  params: { id: string },
  req: Partial<TApplicationRequest>
): Promise<TResponseData<null>> => {
  const response = await api.patch<TResponseData<null>>(
    `/job-applications/admin/${params.id}/status`,
    req
  );
  
  return response.data;
};

export const setInterviewSchedule = async ({
  application_id,
  interview_at,
  application_status,
}: {
  application_id: string;
  interview_at: string;
  application_status: string;
}) => {
  const response = await api.post('/interviews', {
    application_id,
    interview_at,
    application_status,
  });
  return response.data;
};

/**
 * Fetch and download CV PDF for a job application
 * @param id - Application ID
 * @returns Promise<void>
 */
export const  viewJobApplicationCV = async (file_id: string): Promise<string> => {
  const response = await api.get(`/job-applications/admin/${file_id}/cv`);
  return response.data.job_applications;
};