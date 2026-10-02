import {useState, useCallback, useEffect} from 'react';

interface PaginationState<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading: boolean;
  error: Error | null;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const usePagination = <T>(
  fetchFunction: (page: number, pageSize: number) => Promise<PaginatedResult<T>>,
  pageSize: number = 20,
) => {
  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    totalCount: 0,
    currentPage: 0,
    pageSize,
    hasNextPage: false,
    hasPreviousPage: false,
    loading: false,
    error: null,
  });

  const loadPage = useCallback(
    async (page: number) => {
      try {
        setState((prev) => ({...prev, loading: true, error: null}));
        const result = await fetchFunction(page, pageSize);

        setState({
          data: result.data,
          totalCount: result.totalCount,
          currentPage: page,
          pageSize,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: page > 0,
          loading: false,
          error: null,
        });
      } catch (error: unknown) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
      }
    },
    [fetchFunction, pageSize],
  );

  const nextPage = useCallback(() => {
    if (state.hasNextPage) {
      void loadPage(state.currentPage + 1);
    }
  }, [state.hasNextPage, state.currentPage, loadPage]);

  const previousPage = useCallback(() => {
    if (state.hasPreviousPage) {
      void loadPage(state.currentPage - 1);
    }
  }, [state.hasPreviousPage, state.currentPage, loadPage]);

  const refresh = useCallback(() => {
    void loadPage(0);
  }, [loadPage]);

  // Load initial page
  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  return {
    ...state,
    loadPage,
    nextPage,
    previousPage,
    refresh,
  };
};

export default usePagination;
