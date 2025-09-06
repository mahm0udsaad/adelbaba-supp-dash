import { useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/axios'

interface UseFetchAuthOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

interface UseFetchAuthResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFetchAuth<T>(
  url: string,
  options: UseFetchAuthOptions = {}
): UseFetchAuthResult<T> {
  const { enabled = true, refetchOnMount = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.get<T>(url)
      setData(response.data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData()
    }
  }, [enabled, refetchOnMount, fetchData])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}
