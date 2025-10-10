# Quick Reference Guide - Project Structure & Utilities

## 📁 Where Things Are

```
src/
├── api/               # API communication layer
├── hooks/             # All React hooks
├── lib/               # Utilities (logger, error handler, utils)
├── components/        # React components
├── types/             # TypeScript type definitions
├── redux/             # State management
└── auth/              # Auth context
```

## 🔗 Common Import Patterns

### API Calls
```typescript
import { apiRequest } from '@/api/clients/apiClient';
import { getApplication } from '@/api/applicationsApi';
import { loginWithEmailPassword } from '@/api/authApi';
```

### React Hooks
```typescript
import { useApplications } from '@/hooks/useApplications';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useExamOccurrences } from '@/hooks/useExamOccurrences';
```

### Utilities
```typescript
import { logger } from '@/lib/logger';
import { handleError, safeLocalStorage } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
```

### Types
```typescript
import { Application, ApiResponse } from '@/types/api';
import { ExamOccurrence } from '@/types/exam';
import { RootState } from '@/redux/rootReducer';
```

### Components
```typescript
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

## 🛠️ Common Utilities

### Logging
```typescript
import { logger } from '@/lib/logger';

// Different log levels
logger.debug("Debug message", data);  // Dev only
logger.info("Info message", data);
logger.warn("Warning message", data);
logger.error("Error message", error);

// Specialized
logger.api("POST", "/api/endpoint", payload);
logger.form("LoginForm", "submitted", formData);
```

### Error Handling
```typescript
import { 
  handleError, 
  safeLocalStorage, 
  ApiError,
  formatErrorForUser 
} from '@/lib/errorHandler';

// Handle errors
try {
  await operation();
} catch (error) {
  handleError(error, 'context');
}

// Safe localStorage
safeLocalStorage(() => {
  localStorage.setItem('key', value);
}, 'Failed to save');

// Custom errors
throw new ApiError('Failed', 500, '/api/users', 'GET');

// User-friendly errors
const formatted = formatErrorForUser(error);
toast({
  title: formatted.title,
  message: formatted.message,
  variant: formatted.variant
});
```

### Environment Variables
```typescript
// Always use environment variables
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Never hardcode
❌ const apiUrl = "https://api.example.com";
```

### Type-Safe Redux
```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';

// Correct way
const auth = useSelector((state: RootState) => state.auth);

// Wrong way
❌ const auth = useSelector((state: any) => state.auth);
```

## ⚠️ Don'ts

### ❌ Don't Use
```typescript
// NO console.log
console.log("debug");  // Use logger.debug() instead

// NO empty catch
try {
  operation();
} catch {}  // Use catch (error) { logger.error(...) }

// NO any types (where possible)
const data: any = ...;  // Use proper types

// NO hardcoded URLs
const url = "https://...";  // Use import.meta.env.VITE_API_BASE_URL
```

### ✅ Do Use
```typescript
// YES logger
logger.debug("debug message", data);

// YES proper error handling
try {
  operation();
} catch (error) {
  logger.error("operation failed", error);
}

// YES proper types
const data: Application = ...;

// YES environment variables
const url = import.meta.env.VITE_API_BASE_URL;
```

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase.tsx | `ErrorBoundary.tsx` |
| Hooks | camelCase.ts with `use` | `useApplications.ts` |
| API Clients | camelCase.ts with `Api` | `applicationsApi.ts` |
| Utilities | camelCase.ts | `logger.ts`, `utils.ts` |
| Types | camelCase.ts | `api.ts`, `exam.ts` |

## 🔍 Finding Files

### "Where is...?"

**API endpoints?** → `/src/api/`  
**React hooks?** → `/src/hooks/`  
**Utilities?** → `/src/lib/`  
**UI components?** → `/src/components/ui/`  
**Type definitions?** → `/src/types/`  
**Redux state?** → `/src/redux/`  
**Error boundary?** → `/src/components/ErrorBoundary.tsx`  
**Logger?** → `/src/lib/logger.ts`  
**Error handler?** → `/src/lib/errorHandler.ts`  

## 🎯 Quick Wins

### Add New API Endpoint
1. Create file in `/src/api/` (e.g., `usersApi.ts`)
2. Import `apiRequest` from `@/api/clients/apiClient`
3. Export functions
4. Import where needed: `from '@/api/usersApi'`

### Add New Hook
1. Create file in `/src/hooks/` (e.g., `useUsers.ts`)
2. Import API functions from `/src/api/`
3. Export hook
4. Import where needed: `from '@/hooks/useUsers'`

### Add New Component
1. Create in appropriate directory:
   - UI primitive → `/src/components/ui/`
   - Feature component → `/src/components/{feature}/`
2. Use PascalCase naming
3. Import from `@/components/...`

### Add New Type
1. Add to `/src/types/api.ts` or create new type file
2. Export type
3. Import: `from '@/types/api'`

## 📊 Project Health

| Metric | Status |
|--------|--------|
| Build | ✅ Passing |
| TypeScript | ✅ No errors |
| ESLint | ✅ Configured |
| Structure | ✅ Organized |
| Documentation | ✅ Complete |
| Production Ready | ✅ Yes |

---

**Quick Start**: Read `PROJECT_STRUCTURE.md` for full details  
**For Specific Topics**: See individual fix summaries  
**Need Help?**: Check `ALL_FIXES_SUMMARY.md`

