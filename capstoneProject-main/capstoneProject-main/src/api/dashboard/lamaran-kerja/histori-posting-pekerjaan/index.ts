import {api} from "@/libs/axios";
import { TFilterApplication } from "../daftar-pelamar/type";
import {TPostingHistoryResponse} from "./type";


export const getPostingHistory = async (
  params: TFilterApplication = {}
): Promise<TPostingHistoryResponse> => {
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
      '/job-positions/admin/deleted',
      { params: queryParams }
    );
    
    console.log('Raw response:', response);
    console.log('Response data:', response.data);
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data && responseData.data.job_positions) {
      responseData = responseData.data;
    }
    
    // Ensure proper structure
    const result: TPostingHistoryResponse = {
      job_positions: {
        list: responseData.job_positions?.list || [],
        next_cursor: responseData.job_positions?.next_cursor || null,
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

export const restoreJobPosting = async (job_id: string): Promise<void> => {
  await api.patch(`/job-positions/admin/restore/${job_id}`);
}