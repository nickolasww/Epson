import type { TFilterParams } from "@/commons/types/filter";
import type { TResponseData, TResponsePaginate } from "@/commons/types/response";

export type TFaqStatus = "active" | "hide";

export type TFaq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  status: TFaqStatus;
  valid_date: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type TFaqRequest = {
  category: string;
  question: string;
  answer: string;
  status?: TFaqStatus;
  valid_date: string;
};

export type TFilterFaq = TFilterParams<{ category?: string }>;
export type TFaqListResponse = TResponsePaginate<TFaq>;
export type TFaqDetailResponse = TResponseData<TFaq>;
