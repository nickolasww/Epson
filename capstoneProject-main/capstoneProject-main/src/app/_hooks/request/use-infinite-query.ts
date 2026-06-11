import { TErrorResponse } from "@/commons/types/error";
import {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryOptions,
  useInfiniteQuery as useInfiniteQueryOriginal,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useInfinityQuery = <
  TQueryFnData = unknown,
  TError = AxiosError<TErrorResponse>,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  queryClient?: QueryClient,
) => {
  return useInfiniteQueryOriginal<TQueryFnData, TError, TData, TQueryKey, TPageParam>(options, queryClient);
};

