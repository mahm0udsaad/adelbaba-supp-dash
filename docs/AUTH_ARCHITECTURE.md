# Authentication Architecture

## Overview

This document outlines the improved authentication system for the dashboard, designed with mobile-first principles and robust error handling.

## Key Improvements

### ✅ 1. Enhanced Axios Interceptor
- **Token Refresh**: Automatic session refresh on 401 errors
- **Retry Logic**: Failed requests are retried with refreshed tokens
- **Better Error Handling**: More comprehensive cleanup and error recovery

### ✅ 2. Authentication Hooks
New auth-aware API hooks provide a cleaner interface:
- `useFetchAuth<T>` - GET requests with auth
- `usePostAuth<T, P>` - POST requests with auth
- `usePutAuth<T, P>` - PUT requests with auth  
- `usePatchAuth<T, P>` - PATCH requests with auth
- `useDeleteAuth<T>` - DELETE requests with auth
- `useAuthErrorHandler` - Centralized error handling

### ✅ 3. Improved Session Validation
- Session expiry checking
- Data validation for cached auth state
- Better error recovery for corrupted data
- Comprehensive logging for debugging

### ✅ 4. Mobile-First Auth Guard
- Responsive loading indicators
- Better UX for redirects on mobile
- Onboarding flow integration
- Optimized for touch interfaces

## Auth Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication Flow                     │
├─────────────────────────────────────────────────────────────┤
│  NextAuth (JWT Strategy)                                    │
│  ├── Credentials Provider (/api/v1/company/login)          │
│  ├── Google OAuth                                          │
│  └── Facebook OAuth                                        │
├─────────────────────────────────────────────────────────────┤
│  Client State Management                                    │
│  ├── AuthProvider Context                                  │
│  ├── localStorage Cache                                    │
│  └── Axios Interceptors                                    │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                 │
│  ├── Auth-aware Hooks                                      │
│  ├── Token Management                                      │
│  └── Error Handling                                        │
├─────────────────────────────────────────────────────────────┤
│  Route Protection                                          │
│  ├── AuthGuard Component                                   │
│  ├── Layout-based Guards                                   │
│  └── Onboarding Flow                                       │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Using Auth Hooks

```typescript
import { useFetchAuth, usePostAuth } from '@/hooks'

// GET request with auth
const { data, loading, error, refetch } = useFetchAuth<UserProfile>('/api/v1/profile')

// POST request with auth
const { mutate, loading } = usePostAuth<ApiResponse, FormData>('/api/v1/products')

const handleSubmit = async (formData: FormData) => {
  try {
    const result = await mutate(formData)
    // Handle success
  } catch (error) {
    // Error is automatically handled by the hook
  }
}
```

### Error Handling

```typescript
import { useAuthErrorHandler } from '@/hooks'

const { handleError } = useAuthErrorHandler()

try {
  await someApiCall()
} catch (error) {
  handleError(error, 'Failed to save changes')
}
```

### Mobile-Optimized Auth Guard

```typescript
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard requireOnboarding={true}>
      {children}
    </AuthGuard>
  )
}
```

## Token Lifecycle

1. **Login**: User authenticates via credentials or social OAuth
2. **Session Creation**: NextAuth creates JWT with 30-day expiry
3. **Token Storage**: Token stored in localStorage and axios headers
4. **API Requests**: Automatic Bearer token attachment
5. **Token Refresh**: 401 errors trigger session refresh attempt
6. **Logout**: Complete cleanup of all auth state

## Mobile Considerations

- **Touch-Friendly**: Responsive UI elements and loading states
- **Navigation**: Proper back button handling with `router.replace`
- **Performance**: Optimized loading states and minimal re-renders
- **Offline**: Graceful handling of network failures
- **Security**: Secure token storage and automatic cleanup

## Security Features

- **Session Validation**: Automatic expiry checking
- **Data Integrity**: Validation of cached auth data
- **Error Recovery**: Cleanup of corrupted state
- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Token Security**: Secure storage and transmission

## Environment Variables

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

## Migration Guide

### From Direct axios to Auth Hooks

**Before:**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/api/data')
      setData(response.data)
    } catch (error) {
      // Manual error handling
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**After:**
```typescript
const { data, loading, error } = useFetchAuth('/api/data')
```

## Troubleshooting

### Common Issues

1. **401 Errors**: Check if backend token validation matches frontend
2. **Session Expiry**: Verify NextAuth configuration and token refresh
3. **Mobile Navigation**: Ensure proper redirect handling
4. **CORS Issues**: Configure backend CORS for your domain

### Debug Commands

```bash
# Check auth state in browser console
localStorage.getItem('token')
localStorage.getItem('user')

# Monitor network requests
# Open DevTools > Network > Filter by "api"
```

## Future Enhancements

- [ ] Biometric authentication for mobile
- [ ] Multi-factor authentication  
- [ ] Session management dashboard
- [ ] Advanced security monitoring
- [ ] Progressive Web App features
