import { useCallback, useEffect, useRef, useState } from "react"

export interface UseApiWithFallbackOptions<T> {
  // Function that fetches data from the API. Should throw on error.
  fetcher: () => Promise<T | null | undefined>
  // Fallback data source used when the API fails or returns empty/invalid.
  fallback: () => Promise<T> | T
  // Dependencies array to re-run the fetch on change.
  deps?: ReadonlyArray<unknown>
  // Initial data value while mounting
  initialData?: T
}

export interface UseApiWithFallbackResult<T> {
  data: T | undefined
  setData: React.Dispatch<React.SetStateAction<T | undefined>>
  loading: boolean
  error: unknown
  refetch: () => Promise<void>
}

export function useApiWithFallback<T>(options: UseApiWithFallbackOptions<T>): UseApiWithFallbackResult<T> {
  const { fetcher, fallback, deps = [], initialData } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<unknown>(undefined)

  const mountedRef = useRef<boolean>(false)
  const requestIdRef = useRef<number>(0)

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(undefined)

    try {
      const apiData = await fetcher()
      if (requestId !== requestIdRef.current) return

      // If API returns a valid, non-empty value, use it. Otherwise, fall back.
      // Consider arrays and objects differently.
      let isValid = true
      if (Array.isArray(apiData)) {
        isValid = apiData.length > 0
      } else if (apiData && typeof apiData === "object") {
        isValid = Object.keys(apiData as Record<string, unknown>).length > 0
      } else {
        isValid = apiData !== null && apiData !== undefined
      }

      if (isValid) {
        setData(apiData as T)
      } else {
        const fb = await fallback()
        if (requestId !== requestIdRef.current) return
        setData(fb)
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err)
      try {
        const fb = await fallback()
        if (requestId !== requestIdRef.current) return
        setData(fb)
      } catch (fallbackErr) {
        if (requestId !== requestIdRef.current) return
        setError(fallbackErr)
        setData(undefined)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [fetcher, fallback, ...deps])

  const refetch = useCallback(async () => {
    await run()
  }, [run])

  useEffect(() => {
    mountedRef.current = true
    run()
    return () => {
      mountedRef.current = false
      requestIdRef.current++
    }
  }, [run])

  return { data, setData, loading, error, refetch }
}


