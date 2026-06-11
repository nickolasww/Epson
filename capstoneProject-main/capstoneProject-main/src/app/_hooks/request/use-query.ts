import { TErrorResponse } from "@/commons/types/error";
import {
  QueryClient,
  QueryKey,
  UseQueryOptions,
  useQuery as useQueryOriginal,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useQuery = <
  TQueryFnData = unknown,
  TError = AxiosError<TErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
) => {
  return useQueryOriginal<TQueryFnData, TError, TData, TQueryKey>(
    {
      refetchOnMount: "always",
      ...options,
    },
    queryClient,
  );
};
