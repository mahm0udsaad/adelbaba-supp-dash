import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { signOut } from 'next-auth/react'

interface AuthErrorHandlerOptions {
  redirectOnUnauth?: boolean
  showToast?: boolean
}

export function useAuthErrorHandler(options: AuthErrorHandlerOptions = {}) {
  const { redirectOnUnauth = true, showToast = true } = options
  const { toast } = useToast()

  const handleAuthError = useCallback((error: any) => {
    const isAuthError = error?.message?.includes('AUTH_ERROR') || error?.response?.status === 401
    
    if (isAuthError) {
      if (showToast) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to continue',
          variant: 'destructive',
        })
      }
      
      if (redirectOnUnauth) {
        signOut({ redirect: true, callbackUrl: '/login' })
      }
      
      return true
    }
    
    return false
  }, [toast, redirectOnUnauth, showToast])

  const handleError = useCallback((error: any, customMessage?: string) => {
    if (handleAuthError(error)) {
      return
    }

    const message = customMessage || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'An unexpected error occurred'

    if (showToast) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    }

    console.error('[Error Handler]', error)
  }, [handleAuthError, toast, showToast])

  return {
    handleError,
    handleAuthError,
  }
}
