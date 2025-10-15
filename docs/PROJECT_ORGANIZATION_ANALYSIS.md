# Project Organization Analysis

## 🔍 Issues Identified

### 1. **Naming Inconsistencies**

#### Mixed Case Conventions
**Components:**
- ✅ PascalCase (Correct): `AnimatedThemeToggle.tsx`, `Applications.tsx`, `LoginForm.tsx`, `ErrorBoundary.tsx`
- ❌ kebab-case: `application-form.tsx`, `status-card.tsx`, `data-table.tsx`, `theme-provider.tsx`
- ❌ camelCase: `examComponent.tsx`

**Files with Issues:**
```
❌ src/components/application-form.tsx → Should be ApplicationForm.tsx
❌ src/components/status-card.tsx → Should be StatusCard.tsx
❌ src/components/data-table.tsx → Should be DataTable.tsx
❌ src/components/examComponent.tsx → Should be ExamComponent.tsx
❌ src/components/theme-provider.tsx → Should be ThemeProvider.tsx
❌ src/components/ui/status-card.tsx → Should be StatusCard.tsx (duplicate!)
❌ src/auth/authLogin.tsx → Should be AuthLogin.tsx
❌ src/auth/AuthContex.tsx → Should be AuthContext.tsx (typo!)
```

### 2. **Duplicate Files**
- `src/components/status-card.tsx` 
- `src/components/ui/status-card.tsx`

### 3. **Hooks Organization Issues**

**Current Location Problems:**
```
❌ /src/lib/ contains React hooks (should be in /src/hooks/)
   - useAktPastExams.ts
   - useApplications.ts
   - useDashboardData.ts
   - useEmailTemplates.ts
   - useExam.ts
   - useExamOccurrences.ts
   - useExams.ts
   - useFilePreview.ts

❌ /src/hooks/ contains form field components (not hooks!)
   - aktFeilds.tsx → Should be in /src/components/forms/
   - osceFeilds.tsx → Should be in /src/components/forms/

❌ /src/components/ui/ contains hooks
   - use-mobile.tsx (duplicate of /src/hooks/use-mobile.ts)
   - use-toast.ts
```

### 4. **Mixed Concerns in /src/lib/**
Currently contains BOTH:
- ✅ API clients (correct)
- ❌ React hooks (should move to /src/hooks/)
- ✅ Utilities (correct)

### 5. **Component Organization**

**UI Primitives (Correct in /src/components/ui/):**
- button.tsx, input.tsx, card.tsx, etc.

**Business Components (Should move):**
```
❌ Currently in /src/components/ui/:
   - applicationTable.tsx → Should be in /src/components/applications/
   - draftApplicationTable.tsx → Should be in /src/components/applications/
   - ApplicationDetailPage.tsx → Should be in /src/components/applications/
   - application-detail-view.tsx → Should be in /src/components/applications/
   - pdf-generator.tsx → Should be in /src/components/pdf/
   - pdf-preview-panel.tsx → Should be in /src/components/pdf/
   - examClosed.tsx → Should be in /src/components/exam/
   - examClosedApplication.tsx → Should be in /src/components/exam/
   - notFound.tsx → Should be in /src/components/common/
   - field-selection-demo.tsx → Should be in /src/components/applications/
   - field-selection-dialog.tsx → Should be in /src/components/applications/
```

### 6. **Missing Structure**
- No `/src/api/` directory for API clients
- No `/src/services/` directory for business logic
- No `/src/features/` directory for feature-based organization
- No `/src/config/` directory for configuration files
- No `/src/constants/` directory for constants

## 📋 Recommended Structure

```
src/
├── api/                          # API clients (move from lib/)
│   ├── aktPastExamsApi.ts
│   ├── applicationsApi.ts
│   ├── authApi.ts
│   ├── emailTemplatesApi.ts
│   ├── examApi.ts
│   ├── examOccurrencesApi.ts
│   └── apiClient.ts
│
├── hooks/                        # All React hooks
│   ├── useAktPastExams.ts       # Move from lib/
│   ├── useApplications.ts       # Move from lib/
│   ├── useDashboardData.ts      # Move from lib/
│   ├── useEmailTemplates.ts     # Move from lib/
│   ├── useExam.ts               # Move from lib/
│   ├── useExamOccurrences.ts    # Move from lib/
│   ├── useExams.ts              # Move from lib/
│   ├── useFilePreview.ts        # Move from lib/
│   ├── useMobile.ts             # Rename and consolidate
│   └── useToast.ts              # Move from components/ui/
│
├── components/
│   ├── common/                  # Shared components
│   │   ├── ErrorBoundary.tsx
│   │   ├── NotFound.tsx         # Move from ui/
│   │   ├── BrowserRestriction.tsx
│   │   └── BrowserCompatibilityWrapper.tsx
│   │
│   ├── layout/                  # Layout components
│   │   ├── Dashboard.tsx        # Rename from dashboard.tsx
│   │   ├── SidebarNav.tsx
│   │   └── DataTable.tsx        # Rename from data-table.tsx
│   │
│   ├── auth/                    # Auth components
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx   # Move from /src/auth/
│   │
│   ├── applications/            # Application feature
│   │   ├── ApplicationForm.tsx  # Rename from application-form.tsx
│   │   ├── Applications.tsx
│   │   ├── DraftApplications.tsx
│   │   ├── ApplicationTable.tsx # Move from ui/
│   │   ├── DraftApplicationTable.tsx # Move from ui/
│   │   ├── ApplicationDetailPage.tsx # Move from ui/
│   │   ├── ApplicationDetailView.tsx # Move from ui/
│   │   ├── FieldSelectionDialog.tsx # Move from ui/
│   │   ├── FieldSelectionDemo.tsx # Move from ui/
│   │   ├── Columns.tsx          # Rename from columns.tsx
│   │   └── StatusCard.tsx       # Rename & consolidate
│   │
│   ├── exam/                    # Exam feature
│   │   ├── Exam.tsx            # Rename from exam.tsx
│   │   ├── ExamComponent.tsx   # Rename from examComponent.tsx
│   │   ├── ExamClosed.tsx      # Move from ui/
│   │   └── ExamClosedApplication.tsx # Move from ui/
│   │
│   ├── pdf/                     # PDF components
│   │   ├── PdfGenerator.tsx    # Move from ui/
│   │   ├── PdfPreviewPanel.tsx # Move from ui/
│   │   └── PdfToImage.tsx      # Move from ui/
│   │
│   ├── forms/                   # Form field components
│   │   ├── AktFields.tsx       # Move from hooks/aktFeilds.tsx
│   │   ├── OsceFields.tsx      # Move from hooks/osceFeilds.tsx
│   │   └── schema/
│   │       └── applicationSchema.tsx
│   │
│   ├── theme/                   # Theme components
│   │   ├── AnimatedThemeToggle.tsx
│   │   ├── SimpleAnimatedThemeToggle.tsx
│   │   ├── ThemeToggleDemo.tsx
│   │   ├── ThemeProvider.tsx   # Rename from theme-provider.tsx
│   │   └── GooeyMenu.tsx
│   │
│   └── ui/                      # UI primitives only
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (all other UI primitives)
│
├── lib/                         # Utilities only (no hooks!)
│   ├── utils.ts
│   ├── logger.ts
│   ├── errorHandler.ts
│   ├── browserDetection.ts
│   ├── chromeVersionUpdater.ts
│   ├── supabaseClient.ts
│   ├── html2pdf.ts
│   └── polyfills.ts
│
├── types/                       # TypeScript types
│   ├── api.ts
│   ├── exam.ts
│   ├── input-otp.d.ts
│   └── quill.d.ts
│
├── redux/                       # Redux state
│   ├── store.ts
│   ├── rootReducer.ts
│   ├── slices/
│   │   ├── authSlice.ts        # Rename from Slice.ts
│   │   ├── applicationsSlice.ts
│   │   └── examDataSlice.ts
│
├── auth/                        # Auth context only
│   └── AuthContext.tsx          # Rename from AuthContex.tsx
│
├── assets/
├── styles/
│   ├── globals.css
│   └── index.css
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## 🎯 Benefits of Reorganization

### 1. **Clear Separation of Concerns**
- API clients in `/api/`
- React hooks in `/hooks/`
- Utilities in `/lib/`
- Components organized by feature

### 2. **Consistent Naming**
- All React components use PascalCase
- All files use consistent naming conventions
- Hooks prefixed with `use`

### 3. **Feature-Based Organization**
- `/components/applications/` - All application-related components
- `/components/exam/` - All exam-related components
- `/components/pdf/` - All PDF-related components

### 4. **Scalability**
- Easy to find files
- Easy to add new features
- Clear boundaries between modules

### 5. **Better Imports**
```typescript
// Before (confusing)
import { useApplications } from '@/lib/useApplications'
import { aktFeilds } from '@/hooks/aktFeilds'
import { ApplicationTable } from '@/components/ui/applicationTable'

// After (clear)
import { useApplications } from '@/hooks/useApplications'
import { AktFields } from '@/components/forms/AktFields'
import { ApplicationTable } from '@/components/applications/ApplicationTable'
```

## 🔄 Migration Priority

### Phase 1: Critical Fixes (Do First)
1. Fix typo: `AuthContex.tsx` → `AuthContext.tsx`
2. Remove duplicate: `status-card.tsx` files
3. Move hooks from `/lib/` to `/hooks/`
4. Fix component naming (PascalCase)

### Phase 2: Structural Improvements
5. Create feature directories
6. Move business components out of `/ui/`
7. Create `/api/` directory
8. Organize by feature

### Phase 3: Final Polish
9. Update all imports
10. Update documentation
11. Add index files for cleaner imports

## ⚠️ Risks & Considerations

1. **Import Path Updates** - All imports will need updating
2. **Git History** - Use `git mv` to preserve history
3. **Team Communication** - Coordinate with team
4. **Incremental Changes** - Do in small PRs
5. **Testing** - Test after each phase

## 📝 Next Steps

1. Review this plan with team
2. Create backup branch
3. Start with Phase 1 (critical fixes)
4. Update imports progressively
5. Test thoroughly
6. Document new structure

