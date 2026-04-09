import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

function isClientError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const s = error.response?.status;
    return typeof s === 'number' && s >= 400 && s < 500;
  }
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: unknown) => {
        if (isClientError(error)) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
