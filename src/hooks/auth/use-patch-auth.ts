import { useState, useCallback } from 'react'
import apiClient from '@/lib/axios'

interface UsePatchAuthResult<T, P> {
  mutate: (data: P) => Promise<T>
  loading: boolean
  error: Error | null
  data: T | null
  reset: () => void
}

export function usePatchAuth<T = any, P = any>(url: string): UsePatchAuthResult<T, P> {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = useCallback(async (payload: P): Promise<T> => {
    setLoading(true)
    setError(null)
    
    try {
      const headers: Record<string, string> = {}
      if (!(payload instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await apiClient.patch<T>(url, payload, { headers })
      setData(response.data)
      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Patch request failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [url])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return { mutate, loading, error, data, reset }
}
