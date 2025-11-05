// React Query configuration for consistent data loading behavior
// This prevents data flickering on page reload

export const queryConfig = {
  // Prevent showing stale data while fetching
  refetchOnWindowFocus: false,
  // Keep data in cache for 5 minutes
  staleTime: 5 * 60 * 1000,
  // Cache data for 10 minutes
  cacheTime: 10 * 60 * 1000,
  // Retry failed requests once
  retry: 1,
  // Show loading state while fetching
  keepPreviousData: true,
};

// Use this for queries that should show loading state initially
export const initialLoadingConfig = {
  ...queryConfig,
  // Don't use initialData - let it show loading state
  placeholderData: undefined,
};

// Use this for queries that need placeholder data
export const withPlaceholderConfig = (placeholder = []) => ({
  ...queryConfig,
  placeholderData: placeholder,
});
