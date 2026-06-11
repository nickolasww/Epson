export type TResponsePaginate<T> = {
  status_code: number;
  data: {
    items: T[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      total_page: number;
    };
  };
  version: string;
};

export type TResponseData<T> = {
  status_code: number;
  data: T;
  message?: string;
  version: string;
};

export type TDefaultResponse = TResponseData<null>;

export type TResponseError = {
  status_code: number;
  message: string;
  error?: string;
  stack_trace?: string;
  errors: {
    path: string;
    messages: string[];

    // upload error validation
    cell?: string;
    message?: string;
  }[];
  version?: string;
};
