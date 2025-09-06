# Authentication System Implementation

## Overview

This document describes the comprehensive authentication system implemented for the Adelbaba Dashboard. The system provides seamless data persistence, context management, and API integration for user authentication and company data management.

## Key Features

### ✅ 1. Authentication Context (`src/contexts/auth-context.tsx`)
- **Centralized State Management**: Single source of truth for authentication data
- **localStorage Persistence**: Automatic data persistence across browser sessions
- **Real-time Updates**: Context updates automatically when session changes
- **Type Safety**: Full TypeScript support with proper interfaces

### ✅ 2. Company API Service (`src/services/company-api.ts`)
- **RESTful API Integration**: Clean interface for company operations
- **Error Handling**: Comprehensive error management and logging
- **Type Safety**: Strongly typed request/response interfaces
- **FormData Support**: Handles file uploads (logos, documents)

### ✅ 3. Custom Hooks (`src/hooks/use-company.ts`)
- **Simplified API**: Easy-to-use hooks for company operations
- **Loading States**: Built-in loading and error state management
- **Automatic Updates**: Context updates when data changes

### ✅ 4. Utility Functions (`src/utils/auth-utils.ts`)
- **Data Persistence**: localStorage management utilities
- **Navigation Logic**: Smart routing based on user status
- **Data Formatting**: Helper functions for form population

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                      │
├─────────────────────────────────────────────────────────────┤
│  NextAuth (JWT Strategy)                                    │
│  ├── Credentials Provider (/api/v1/company/login)          │
│  ├── Google OAuth                                          │
│  └── Facebook OAuth                                        │
├─────────────────────────────────────────────────────────────┤
│  AuthContext (React Context)                                │
│  ├── User Data Management                                   │
│  ├── Company Data Management                                │
│  ├── localStorage Persistence                               │
│  └── Real-time State Updates                               │
├─────────────────────────────────────────────────────────────┤
│  Company API Service                                        │
│  ├── GET /api/v1/company                                   │
│  ├── POST /api/v1/company/update                           │
│  └── Status Checking                                        │
├─────────────────────────────────────────────────────────────┤
│  Custom Hooks                                               │
│  ├── useAuth() - Authentication context                     │
│  ├── useCompany() - Company data management                │
│  └── useCompanyHook() - Company API operations             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Login Process
```
User Login → NextAuth → Backend API → Response Data → localStorage → AuthContext → UI Update
```

### 2. Company Data Loading
```
Component Mount → Check Context → Fetch from API → Update Context → Populate Forms
```

### 3. Data Persistence
```
Session Update → AuthContext → localStorage → Browser Storage → Next Session Load
```

## Usage Examples

### Basic Authentication Context Usage

```tsx
import { useAuth } from "@/src/contexts/auth-context"

function MyComponent() {
  const { authData, isLoading, error, fetchCompanyData } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h1>Welcome, {authData.user?.name}</h1>
      <p>Company: {authData.company?.name}</p>
    </div>
  )
}
```

### Company Data Management

```tsx
import { useCompany } from "@/src/hooks/use-company"

function CompanyForm() {
  const { company, isLoading, updateCompany } = useCompany()
  
  const handleSubmit = async (formData) => {
    try {
      await updateCompany({
        name: formData.companyName,
        description: formData.description,
        contacts: [
          {
            phone: formData.phone,
            email: formData.email,
            is_primary: 1,
          }
        ]
      })
    } catch (error) {
      console.error("Update failed:", error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Navigation Logic

```tsx
import { getRedirectPath } from "@/src/utils/auth-utils"

function LoginHandler() {
  const redirectPath = getRedirectPath(user, roles, completionStatus)
  router.replace(redirectPath)
}
```

## Data Structures

### User Interface
```typescript
interface User {
  id: number
  name: string
  picture: string
  email: string
  phone: string
  has_company: boolean
  unread_notifications_count: number
}
```

### Company Interface
```typescript
interface Company {
  id: number
  name: string
  description: string
  founded_year: number
  is_active: boolean
  verified_at: string | null
  location: string
  logo: string
  owner: User
  contacts: Array<{
    id: number
    phone: string
    email: string
    is_primary: number
    created_at: string
    updated_at: string
  }>
  city: { id: number; name: string }
  region: { id: number; name: string; picture: string }
  state: { id: number; name: string }
  supplier: {
    id: number
    name: string
    location: string
    logo: string
    on_time_delivery_rate: string
    rating: string
    status: string
  }
}
```

### Completion Status Interface
```typescript
interface CompletionStatus {
  profile_completed: boolean
  shipping_configured: boolean
  certificates_uploaded: boolean
  first_product_added: boolean
}
```

## localStorage Keys

- `adelbaba_auth_data`: Main authentication data (excluding token for security)
- `adelbaba_company_data`: Company-specific data

## Security Considerations

1. **Token Storage**: Authentication tokens are NOT stored in localStorage for security
2. **Data Validation**: All data is validated before storage
3. **Error Handling**: Comprehensive error handling prevents data corruption
4. **Cleanup**: Corrupted data is automatically cleared

## Integration Points

### Onboarding Form
The onboarding form now automatically:
- Loads company data from context/localStorage
- Populates form fields with existing data
- Updates company data via the new API service
- Maintains data persistence across sessions

### Navigation
Smart routing based on:
- User authentication status
- Role-based access
- Onboarding completion status

### Data Persistence
Automatic persistence of:
- User profile data
- Company information
- Completion status
- Form progress

## Error Handling

The system includes comprehensive error handling:
- API request failures
- Data validation errors
- localStorage corruption
- Network connectivity issues

## Performance Optimizations

- **Lazy Loading**: Data is loaded only when needed
- **Caching**: localStorage provides instant data access
- **Debouncing**: API calls are optimized to prevent excessive requests
- **Memory Management**: Proper cleanup of resources

## Testing

The system is designed for easy testing:
- Mock data support
- Isolated context providers
- Predictable state management
- Error simulation capabilities

## Future Enhancements

Potential improvements:
- Real-time data synchronization
- Offline support
- Advanced caching strategies
- Performance monitoring
- Analytics integration

## Troubleshooting

### Common Issues

1. **Data not persisting**: Check localStorage permissions
2. **API errors**: Verify backend connectivity and authentication
3. **Form not populating**: Ensure company data is loaded
4. **Navigation issues**: Check completion status logic

### Debug Tools

- Browser DevTools localStorage inspection
- Network tab for API monitoring
- React DevTools for context inspection
- Console logging for debugging

## Conclusion

This authentication system provides a robust, scalable foundation for user management and data persistence in the Adelbaba Dashboard. It follows React best practices, maintains type safety, and provides excellent developer experience while ensuring data security and performance.
