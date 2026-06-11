import { api } from "@/libs/axios";
import type { 
  TJobPositionListResponse, 
  TJobPositionDetailResponse,
  TFilterJobPosition,
  TJobApplicationResponse,
  TJobPosition,
  TJobApplicationHistory,
  TJobApplicationsHistoryResponse
} from "./type";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Get list of job positions with cursor-based pagination
 * @param params - Filter parameters including limit and cursor
 * @returns Promise with job positions list
 */
export const getJobPositions = async (
  params: TFilterJobPosition = {}
): Promise<TJobPositionListResponse> => {
  const { limit = 3, cursor, search } = params;
  
  const queryParams: Record<string, string> = {
    limit: limit.toString(),
  };
  
  if (cursor) {
    queryParams.cursor = cursor;
  }
  
  if (search) {
    queryParams.search = search;
  }

  try {
    const response = await api.get(
      '/job-positions',
      { params: queryParams }
    );
    
    // Handle different response structures
    let responseData = response.data;
    
    // If response.data has a data property (wrapped response)
    if (responseData.data && responseData.data.job_positions) {
      responseData = responseData.data;
    }

    const list = (responseData.job_positions?.list || []).map((item: TJobPosition) => {
      const rawSlug = typeof item.slug === 'string' ? item.slug.trim() : '';
      const fallbackSlug = typeof item.title === 'string' ? toSlug(item.title) : '';

      return {
        ...item,
        slug: rawSlug || fallbackSlug,
      };
    });

    // Ensure proper structure matching backend response
    const result: TJobPositionListResponse = {
      job_positions: {
        list,
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
 * Get detail of a specific job position
 * @param params - Object containing job position id
 * @returns Promise with job position detail
 */
export const getDetailJobPosition = async (
  params: { slug: string }
): Promise<TJobPositionDetailResponse> => {
  try {
    const response = await api.get(
      `/job-positions/slug/${params.slug}`
    );

    let responseData = response.data;

    if (responseData.data) {
      responseData = responseData.data;
    }

    const result: TJobPositionDetailResponse = {
      job_positions: responseData.job_positions || responseData,
      message: responseData.message || response.data.message || 'success',
    };

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Submit job application
 * @param formData - FormData containing job application information
 * @returns Promise with submission response
 */
export const submitJobApplication = async (
  formData: FormData
): Promise<TJobApplicationResponse> => {
  try {
    // Authorization will be automatically added by axios interceptor from localStorage token
    const response = await api.post(
      '/job-applications',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    const result: TJobApplicationResponse = {
      message: response.data.message || 'Job application submitted successfully',
      data: response.data.data,
    };

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get job application history for the logged-in user
 * @param params - Optional filter/search params
 * @returns Promise with job application history list
 */
export const getJobApplicationsHistory = async (
  params: { search?: string; limit?: number; cursor?: string } = {}
): Promise<TJobApplicationsHistoryResponse> => {
  try {
    const { limit = 8, cursor, search } = params;
    const queryParams: Record<string, string> = {
      limit: limit.toString(),
    };
    if (cursor) queryParams.cursor = cursor;
    if (search) queryParams.search = search;

    const response = await api.get('/job-applications/history', { params: queryParams });
    // Normalisasi agar selalu return dalam bentuk { job_applications: { items: [...] }, message }
    let items: TJobApplicationHistory[] = [];
    let message = 'success';
    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data?.job_applications?.items) {
      items = response.data.job_applications.items;
      message = response.data.message || message;
    } else if (Array.isArray(response.data?.items)) {
      items = response.data.items;
      message = response.data.message || message;
    }
    return {
      job_applications: { items },
      message,
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};