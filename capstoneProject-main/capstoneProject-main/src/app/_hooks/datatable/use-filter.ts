import { useState, useCallback } from 'react';

type ForFilter = { 
  status?: 'active' | 'inactive';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type FilterParams = {
  search?: string;
  filter?: ForFilter;
  sort_by?: string;
  order?: 'ASC' | 'DESC';
};

export const useFilter = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
  });

  const [filters, setFilters] = useState<FilterParams>({});

  const handleChange = useCallback(
    (params: {
      pagination?: { page?: number; per_page?: number };
      filters?: FilterParams;
    }) => {
      if (params.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...params.pagination,
        }));
      }
      if (params.filters) {
        setFilters((prev) => ({
          ...prev,
          ...params.filters,
        }));
      }
    },
    []
  );

  return {
    pagination,
    filters,
    handleChange,
  };
};
