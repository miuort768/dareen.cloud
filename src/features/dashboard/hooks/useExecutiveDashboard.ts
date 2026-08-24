import { useQuery } from '@tanstack/react-query'
import { executiveService } from '../services/executiveService'

const REFETCH = {
  upcoming: 10_000,
  presence: 5_000,
  fast: 30_000,
  slow: 60_000,
}

export function useExecutiveDashboard() {
  const query = useQuery({
    queryKey: ['executive-dashboard'],
    queryFn: () => executiveService.getDashboard(),
    refetchInterval: REFETCH.fast,
    staleTime: 10_000,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
