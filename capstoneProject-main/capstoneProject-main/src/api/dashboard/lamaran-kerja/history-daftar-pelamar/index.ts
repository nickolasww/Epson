import {api} from "@/libs/axios";
import type { TApplicationListHistoryResponse } from "./type";
import { TFilterApplication } from "../daftar-pelamar/type";

export const getJobApplicationsHistory = async (
  params: TFilterApplication = {}
): Promise<TApplicationListHistoryResponse> => {
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
    const result: TApplicationListHistoryResponse = {
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

export const  viewJobApplicationCV = async (file_id: string): Promise<string> => {
  const response = await api.get(`/job-applications/admin/${file_id}/cv`);
  return response.data.job_applications;
};

export const deleteJobApplicationHistory = async (id: string) : Promise<void> => { 
  await api.delete(`/job-applications/admin/${id}`);
}