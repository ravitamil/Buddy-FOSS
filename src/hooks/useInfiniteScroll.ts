import {useState, useCallback, useEffect, useRef} from 'react';

interface InfiniteScrollState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
}

interface PaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
}

const useInfiniteScroll = <T>(
  fetchFunction: (page: number, pageSize: number) => Promise<PaginatedResult<T>>,
  pageSize: number = 20,
) => {
  const [state, setState] = useState<InfiniteScrollState<T>>({
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
  });

  // Ref to track if we're currently loading to prevent duplicate calls
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous load calls
    if (isLoadingRef.current || state.loading || !state.hasMore) return;

    isLoadingRef.current = true;

    try {
      setState((prev) => ({...prev, loading: true, error: null}));
      const result = await fetchFunction(state.page, pageSize);

      setState((prev) => ({
        data: [...prev.data, ...result.data],
        loading: false,
        error: null,
        hasMore: result.hasNextPage,
        page: prev.page + 1,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchFunction, pageSize, state.loading, state.hasMore, state.page]);

  const refresh = useCallback(async () => {
    // Prevent multiple simultaneous refresh calls
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      setState((prev) => ({...prev, loading: true, error: null}));
      const result = await fetchFunction(0, pageSize);

      setState({
        data: result.data,
        loading: false,
        error: null,
        hasMore: result.hasNextPage,
        page: 1,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchFunction, pageSize]);

  // Load initial page
  useEffect(() => {
    void refresh();
  }, []); // Empty dependency array to only run once on mount

  return {
    ...state,
    loadMore,
    refresh,
  };
};

export default useInfiniteScroll;
