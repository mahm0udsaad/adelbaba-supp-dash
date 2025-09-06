import { useState, useCallback } from 'react'
import apiClient from '@/lib/axios'

interface UseDeleteAuthResult<T> {
  mutate: (id?: string | number) => Promise<T>
  loading: boolean
  error: Error | null
  data: T | null
  reset: () => void
}

export function useDeleteAuth<T = any>(url: string): UseDeleteAuthResult<T> {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = useCallback(async (id?: string | number): Promise<T> => {
    setLoading(true)
    setError(null)
    
    try {
      const deleteUrl = id ? `${url}/${id}` : url
      const response = await apiClient.delete<T>(deleteUrl)
      setData(response.data)
      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete request failed')
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
