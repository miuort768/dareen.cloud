import { QueryClient } from '@tanstack/react-query'
import type { Persister } from '@tanstack/react-query-persist-client'
import { get, set, del } from 'idb-keyval'

/**
 * Shared React Query client + IndexedDB persister.
 * Kept in its own module so stores (auth) can clear the cache on logout/login.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const PERSIST_KEY = 'react-query-cache'

/** Custom async persister using IndexedDB */
export const persister: Persister = {
  persistClient: async (client) => {
    await set(PERSIST_KEY, client)
  },
  restoreClient: async () => {
    return await get(PERSIST_KEY)
  },
  removeClient: async () => {
    await del(PERSIST_KEY)
  },
}

/**
 * Wipe all cached queries from memory AND IndexedDB. Call on logout/login so a
 * different account never sees the previous user's persisted data, and so a
 * fresh session always starts from server truth.
 */
export const clearQueryCache = async () => {
  queryClient.clear()
  try {
    await persister.removeClient?.()
  } catch {
    // IndexedDB unavailable (SSR/private mode) — memory clear is enough
  }
}
