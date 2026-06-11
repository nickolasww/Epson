import { TResponseError } from "@/commons/types/response";
import { QueryKey } from "@/commons/constants/query-key";
import {
  QueryClient,
  UseMutationOptions,
  useMutation as useMutationOrigin,
} from "@tanstack/react-query";

type CustomMutationMeta = {
  invalidateQueries?: readonly QueryKey[];
};

type CustomMutationOptions<
  TData = unknown,
  TError = TResponseError,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "meta"> & {
  meta?: CustomMutationMeta;
};

export const useMutation = <
  TData = unknown,
  TError = TResponseError,
  TVariables = void,
  TContext = unknown,
>(
  options: CustomMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient
) =>
  useMutationOrigin<TData, TError, TVariables, TContext>(
    options as UseMutationOptions<TData, TError, TVariables, TContext>,
    queryClient
  );
