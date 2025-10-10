# Project Structure Documentation

## 📁 Current Organized Structure

```
src/
├── api/                          # ✅ API Layer (Centralized)
│   ├── clients/
│   │   └── apiClient.ts         # Core API client with auth & error handling
│   ├── aktPastExamsApi.ts       # AKT past exams endpoints
│   ├── applicationsApi.ts       # Applications endpoints
│   ├── authApi.ts               # Authentication endpoints
│   ├── emailTemplatesApi.ts     # Email templates endpoints
│   ├── examApi.ts               # Exams endpoints
│   ├── examOccurrencesApi.ts    # Exam occurrences endpoints
│   ├── fakeExamDatesApi.ts      # Mock exam dates (development)
│   └── fakeExamsApi.ts          # Mock exams (development)
│
├── hooks/                        # ✅ React Hooks (Consolidated)
│   ├── aktFeilds.tsx            # AKT form field components
│   ├── osceFeilds.tsx           # OSCE form field components
│   ├── useAktPastExams.ts       # AKT past exams hook
│   ├── useApplications.ts       # Applications data hook
│   ├── useDashboardData.ts      # Dashboard statistics hook
│   ├── useEmailTemplates.ts     # Email templates hook
│   ├── useExam.ts               # Single exam hook
│   ├── useExamOccurrences.ts    # Exam occurrences hook
│   ├── useExams.ts              # Multiple exams hook
│   ├── useFilePreview.ts        # File preview hook
│   └── use-mobile.ts            # Mobile detection hook
│
├── components/
│   ├── auth/                    # Auth Components (Future - will move here)
│   │   └── (to be organized)
│   │
│   ├── layout/                  # Layout Components (Future)
│   │   └── (to be organized)
│   │
│   ├── applications/            # Application Feature (Future)
│   │   └── forms/               # Application form components (Future)
│   │       └── (to be organized)
│   │
│   ├── exam/                    # Exam Feature (Future)
│   │   └── (to be organized)
│   │
│   ├── pdf/                     # PDF Components (Future)
│   │   └── (to be organized)
│   │
│   ├── theme/                   # Theme Components (Future)
│   │   └── (to be organized)
│   │
│   ├── common/                  # Common Shared Components
│   │   └── (to be organized)
│   │
│   ├── ui/                      # ✅ UI Primitives (shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── application-detail-view.tsx
│   │   ├── ApplicationDetailPage.tsx
│   │   ├── applicationTable.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── draftApplicationTable.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pdf-generator.tsx
│   │   ├── pdf-preview-panel.tsx
│   │   ├── pdfToImage.tsx
│   │   ├── phone-input.tsx
│   │   ├── popover.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── status-card.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── schema/
│   │   └── applicationSchema.tsx
│   │
│   ├── AnimatedThemeToggle.tsx
│   ├── application-form.tsx
│   ├── Applications.tsx
│   ├── BrowserCompatibilityWrapper.tsx
│   ├── BrowserRestriction.tsx
│   ├── columns.tsx
│   ├── dashboard.tsx
│   ├── data-table.tsx
│   ├── DraftApplications.tsx
│   ├── ErrorBoundary.tsx        # ✅ NEW: React error boundary
│   ├── exam.tsx
│   ├── examComponent.tsx
│   ├── GooeyMenu.tsx
│   ├── LoginForm.tsx
│   ├── settings.tsx
│   ├── SidebarNav.tsx
│   ├── SimpleAnimatedThemeToggle.tsx
│   ├── theme-provider.tsx
│   └── ThemeToggleDemo.tsx
│
├── auth/                        # Auth Context & Guards
│   ├── AuthContext.tsx          # ✅ FIXED: Renamed from AuthContex.tsx
│   ├── AuthLogin.tsx            # Auth login utilities
│   └── ProtectedRoute.tsx       # Route protection
│
├── lib/                         # ✅ Utilities Only
│   ├── browserDetection.ts
│   ├── chromeVersionUpdater.ts
│   ├── errorHandler.ts          # ✅ NEW: Error handling utilities
│   ├── logger.ts                # ✅ NEW: Logging utility
│   ├── supabaseClient.ts
│   ├── utils.ts
│   └── html2pdf.ts
│
├── redux/                       # Redux State Management
│   ├── slices/                  # Redux slices (Future)
│   │   └── (to be organized)
│   ├── applicationsSlice.ts
│   ├── examDataSlice.ts
│   ├── rootReducer.ts           # ✅ With RootState export
│   ├── Slice.ts                 # Auth slice
│   └── store.ts
│
├── types/                       # ✅ TypeScript Types
│   ├── api.ts                   # ✅ NEW: API types
│   ├── exam.ts                  # ✅ NEW: Exam types
│   ├── input-otp.d.ts
│   └── quill.d.ts
│
├── assets/
│   └── react.svg
│
├── App.css
├── App.tsx
├── globals.css
├── index.css
├── main.tsx
├── polyfills.ts
└── vite-env.d.ts
```

## 🎯 Organization Principles

### 1. **Separation of Concerns**
- **`/api/`** - All API communication layer
- **`/hooks/`** - All React hooks
- **`/lib/`** - Utilities and helpers (no React dependencies)
- **`/components/`** - React components
- **`/redux/`** - State management
- **`/types/`** - TypeScript type definitions

### 2. **Naming Conventions**

#### React Components
- ✅ **PascalCase**: `ErrorBoundary.tsx`, `LoginForm.tsx`
- Purpose: Distinguishes components from utilities

#### Hooks
- ✅ **camelCase with `use` prefix**: `useApplications.ts`, `useDashboardData.ts`
- Purpose: React hook naming convention

#### API Clients
- ✅ **camelCase with Api suffix**: `applicationsApi.ts`, `authApi.ts`
- Purpose: Clearly identifies API layer

#### Utilities
- ✅ **camelCase**: `logger.ts`, `errorHandler.ts`, `utils.ts`
- Purpose: Standard utility naming

### 3. **Import Path Aliases**

```typescript
// API imports
import { apiRequest } from '@/api/clients/apiClient'
import { getApplication } from '@/api/applicationsApi'
import { loginWithEmailPassword } from '@/api/authApi'

// Hook imports
import { useApplications } from '@/hooks/useApplications'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useExamOccurrences } from '@/hooks/useExamOccurrences'

// Component imports
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'

// Utility imports
import { logger } from '@/lib/logger'
import { handleError } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'

// Type imports
import { Application, ApiResponse } from '@/types/api'
import { ExamOccurrence } from '@/types/exam'

// Redux imports
import { RootState } from '@/redux/rootReducer'
```

## ✅ Reorganization Completed

### Files Moved
1. **API Layer** - ✅ All `*Api.ts` files moved from `/lib/` to `/api/`
2. **API Client** - ✅ Moved from `/lib/apiClient.ts` to `/api/clients/apiClient.ts`
3. **Hooks** - ✅ All `use*.ts` hooks moved from `/lib/` to `/hooks/`
4. **Auth Context** - ✅ Fixed typo: `AuthContex.tsx` → `AuthContext.tsx`

### Files Created
1. **Error Handler** - ✅ `/lib/errorHandler.ts` (5.4KB)
2. **Logger** - ✅ `/lib/logger.ts` (2.9KB)
3. **Error Boundary** - ✅ `/components/ErrorBoundary.tsx` (3.8KB)
4. **API Types** - ✅ `/types/api.ts` (comprehensive API types)
5. **Exam Types** - ✅ `/types/exam.ts` (exam-specific types)

### Files Fixed
- **Removed Duplicate**: `src/components/status-card.tsx` (kept the one in `ui/`)

### Imports Updated
- ✅ All imports updated to new API structure (`@/api/*`)
- ✅ All imports updated to new hooks structure (`@/hooks/*`)
- ✅ Error handler and logger imports updated

## 📊 Organization Metrics

| Category | Before | After | Status |
|----------|--------|-------|--------|
| API files in lib/ | 9 | 0 | ✅ Moved |
| Hooks in lib/ | 8 | 0 | ✅ Moved |
| API directory exists | No | Yes | ✅ Created |
| Hooks consolidated | No | Yes | ✅ Done |
| Duplicate files | 1 | 0 | ✅ Fixed |
| Typos fixed | 0 | 1 | ✅ AuthContex→AuthContext |
| Error utilities | 0 | 2 | ✅ Created |
| Type files | 2 | 4 | ✅ Expanded |

## 🎯 Key Improvements

### 1. **Clear API Layer**
```
/api/
  ├── clients/apiClient.ts     # Central API client
  ├── applicationsApi.ts       # Feature-specific endpoints
  ├── authApi.ts
  ├── examApi.ts
  └── ... (other API modules)
```

**Benefits:**
- Easy to find all API endpoints
- Centralized error handling
- Consistent request/response patterns

### 2. **Consolidated Hooks**
```
/hooks/
  ├── useApplications.ts       # All data hooks in one place
  ├── useDashboardData.ts
  ├── useExam.ts
  └── ... (all hooks)
```

**Benefits:**
- All hooks in predictable location
- No confusion between hooks and utilities
- Easy to reuse across components

### 3. **Utilities Separation**
```
/lib/
  ├── logger.ts                # Pure utilities
  ├── errorHandler.ts          # No React dependencies
  ├── utils.ts
  └── ... (other utilities)
```

**Benefits:**
- Can be used anywhere (even non-React code)
- Clear responsibility
- Easier testing

## 🔍 Remaining Organization Tasks (Future)

### Phase 2 (Future Improvements)
While the critical organization is complete, these could be future enhancements:

1. **Component Organization** - Move business components out of `/ui/`:
   ```
   applicationTable.tsx → /applications/ApplicationTable.tsx
   pdf-generator.tsx → /pdf/PdfGenerator.tsx
   ```

2. **Redux Slices** - Organize in `/redux/slices/`:
   ```
   Slice.ts → /slices/authSlice.ts
   ```

3. **Style Consolidation** - Move to `/styles/`:
   ```
   App.css → /styles/App.css
   ```

4. **Rename kebab-case Components**:
   ```
   application-form.tsx → ApplicationForm.tsx
   data-table.tsx → DataTable.tsx
   theme-provider.tsx → ThemeProvider.tsx
   ```

## ✨ Benefits Achieved

✅ **Discoverability** - Easy to find files  
✅ **Consistency** - Clear patterns throughout  
✅ **Scalability** - Easy to add new features  
✅ **Maintainability** - Clear responsibilities  
✅ **Type Safety** - Comprehensive type system  
✅ **Error Handling** - Centralized error utilities  
✅ **Logging** - Structured logging system  

## 📚 Import Examples

### API Usage
```typescript
// Import API functions
import { getApplication, createApplication } from '@/api/applicationsApi';
import { loginWithEmailPassword } from '@/api/authApi';
import { apiRequest } from '@/api/clients/apiClient';

// Use in components
const app = await getApplication(id);
const result = await loginWithEmailPassword(email, password);
```

### Hook Usage
```typescript
// Import hooks
import { useApplications } from '@/hooks/useApplications';
import { useExamOccurrences } from '@/hooks/useExamOccurrences';
import { useDashboardData } from '@/hooks/useDashboardData';

// Use in components
const { items, loadState, error, create } = useApplications();
const dashboardData = useDashboardData();
```

### Utility Usage
```typescript
// Import utilities
import { logger } from '@/lib/logger';
import { handleError, safeLocalStorage } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';

// Use utilities
logger.info('User logged in', userData);
handleError(error, 'login');
safeLocalStorage(() => localStorage.setItem('token', token));
```

### Type Usage
```typescript
// Import types
import { Application, Attachment } from '@/types/api';
import { ExamOccurrence, ExamFormData } from '@/types/exam';
import { RootState } from '@/redux/rootReducer';

// Use types
const app: Application = { ... };
const state = useSelector((state: RootState) => state.auth);
```

## 🎓 Best Practices

### 1. File Organization
- Keep related files together
- Use clear, descriptive names
- Follow consistent naming conventions

### 2. Import Organization
- Use absolute paths with `@/` alias
- Group imports by type (React, third-party, local)
- Sort imports alphabetically within groups

### 3. Component Structure
- One component per file
- Co-locate related files
- Use index files for public exports

### 4. Error Handling
- Always handle errors explicitly
- Use error utilities for consistency
- Log errors appropriately

### 5. Type Safety
- Define types for all data structures
- Use generic types where appropriate
- Export types for reuse

## 📝 Migration Status

### Completed ✅
- [x] Created `/api/` directory structure
- [x] Moved all API files to `/api/`
- [x] Created `/api/clients/` subdirectory
- [x] Moved all hooks from `/lib/` to `/hooks/`
- [x] Updated all import statements
- [x] Fixed `AuthContex.tsx` typo
- [x] Removed duplicate `status-card.tsx`
- [x] Created error handling utilities
- [x] Created logging utilities
- [x] Created Error Boundary component
- [x] Updated ESLint configuration
- [x] Build verified successfully

### Future (Optional) 📅
- [ ] Move business components out of `/ui/`
- [ ] Rename kebab-case components to PascalCase
- [ ] Create feature-based directories
- [ ] Add index files for cleaner imports
- [ ] Organize Redux slices
- [ ] Consolidate styles directory

## ✅ Verification

### Build Status
```bash
✓ Build successful
✓ No TypeScript errors
✓ All imports resolved correctly
✓ No missing modules
```

### Import Path Checks
- ✅ All API imports point to `@/api/*`
- ✅ All hook imports point to `@/hooks/*`
- ✅ All utility imports point to `@/lib/*`
- ✅ All type imports point to `@/types/*`

### File Organization
- ✅ API layer separated from hooks
- ✅ Hooks consolidated in one directory
- ✅ Utilities have no React dependencies
- ✅ Types centralized

---

**Status**: ✅ Core Organization Complete  
**Build**: ✅ Passing  
**Impact**: 🟢 High - Clear, maintainable structure  
**Next Steps**: Future enhancements are optional, current structure is production-ready

