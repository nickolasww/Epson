import { api } from "@/libs/axios";
import type { TResponseData } from "@/commons/types/response";
import type {
  TJobPostingRequest,
  TFilterJobPosting,
  TJobPostingListResponse,
  TJobPostingDetailResponse,
  TJobPostingUpdateResponse,
} from './type';

/**
 * Get list of job postings with cursor-based pagination
 * @param params - Filter parameters including limit and cursor
 * @returns Promise with job postings list
 */
export const getJobPostings = async (
  params: TFilterJobPosting = {}
): Promise<TJobPostingListResponse> => {
  const { limit = 100, cursor, status = 'active', search } = params;
  
  const queryParams: Record<string, string> = {
    limit: limit.toString(),
  };
  
  if (status) {
    queryParams.status = status;
  }
  
  if (cursor) {
    queryParams.cursor = cursor;
  }
  
  if (search) {
    queryParams.search = search;
  }

  try {
    const response = await api.get(
      '/job-positions/admin',
      { params: queryParams }
    );
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data && responseData.data.job_positions) {
      responseData = responseData.data;
    }
    
    // Ensure proper structure
    const result: TJobPostingListResponse = {
      job_positions: {
        list: responseData.job_positions?.list || [],
        total_applicant: responseData.job_positions?.total_applicant || 0,
        total_active: responseData.job_positions?.total_active || 0,
        total_vacancy: responseData.job_positions?.total_vacancy || 0,
        next_cursor: responseData.job_positions?.next_cursor || null,
      },
      message: responseData.message || 'success',
    };
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get detail of a specific job posting
 * @param params - Object containing job posting id
 * @returns Promise with job posting detail
 */
export const getDetailJobPosting = async (
  params: { id: string }
): Promise<TJobPostingDetailResponse> => {
  try {
    const response = await api.get(
      `/job-positions/admin/${params.id}`
    );
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data && responseData.data.job_positions) {
      responseData = responseData.data;
    }
    
    // Ensure proper structure
    const result: TJobPostingDetailResponse = {
      job_positions: responseData.job_positions,
      message: responseData.message || 'success',
    };
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Create a new job posting
 * @param data - Job posting request data
 * @returns Promise with create response
 */
export const createJobPosting = async (
  data: TJobPostingRequest
): Promise<TJobPostingDetailResponse> => {
  const response = await api.post<TJobPostingDetailResponse>(
    '/job-positions/admin',
    data
  );
  
  return response.data;
};

/**
 * Update a job posting
 * @param params - Object containing job posting id
 * @param data - Partial job posting data to update
 * @returns Promise with update response
 */
export const updateJobPosting = async (
  params: { id: string },
  data: Partial<TJobPostingRequest>
): Promise<TJobPostingUpdateResponse> => {
  try {
    const response = await api.patch(
      `/job-positions/admin/${params.id}`,
      data
    );
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data) {
      responseData = responseData.data;
    }
    
    // Return simple message response
    const result: TJobPostingUpdateResponse = {
      message: responseData.message || 'successfully updated job position',
    };
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Delete a job posting
 * @param params - Object containing job posting id
 * @returns Promise with delete response
 */
export const deleteJobPosting = async (
  params: { id: string }
): Promise<TResponseData<null>> => {
  const response = await api.delete<TResponseData<null>>(
    `/job-positions/admin/${params.id}/soft`
  );
  
  return response.data;
};
