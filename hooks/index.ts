// Auth-aware API hooks (moved to src/hooks/auth/)
export { useFetchAuth } from '../src/hooks/auth/use-fetch-auth'
export { usePostAuth } from '../src/hooks/auth/use-post-auth'
export { usePutAuth } from '../src/hooks/auth/use-put-auth'
export { usePatchAuth } from '../src/hooks/auth/use-patch-auth'
export { useDeleteAuth } from '../src/hooks/auth/use-delete-auth'

// Auth utilities
export { useAuthErrorHandler } from '../src/hooks/auth/use-auth-error-handler'

// Other hooks
export { useApiWithFallback } from './useApiWithFallback'
export { useToast } from './use-toast'
export { useIsMobile } from './use-mobile'
