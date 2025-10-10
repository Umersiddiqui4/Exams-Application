# Project Reorganization Plan

## 🎯 Goal
Create a consistent, scalable project structure following React best practices.

## 📋 Principles

1. **Separation of Concerns** - API, hooks, components, utilities clearly separated
2. **Consistent Naming** - PascalCase for components, camelCase for utilities
3. **Feature-Based** - Group related files together
4. **Scalability** - Easy to add new features
5. **Discoverability** - Intuitive file locations

## 🗂️ New Structure (Standardized)

```
src/
├── api/                          # ✨ NEW: API layer
│   ├── clients/
│   │   └── apiClient.ts
│   ├── aktPastExamsApi.ts
│   ├── applicationsApi.ts
│   ├── authApi.ts
│   ├── emailTemplatesApi.ts
│   ├── examApi.ts
│   └── examOccurrencesApi.ts
│
├── hooks/                        # ✅ React hooks (consolidated)
│   ├── useAktPastExams.ts
│   ├── useApplications.ts
│   ├── useDashboardData.ts
│   ├── useEmailTemplates.ts
│   ├── useExam.ts
│   ├── useExamOccurrences.ts
│   ├── useExams.ts
│   ├── useFilePreview.ts
│   ├── useMobile.ts
│   └── useToast.ts
│
├── components/
│   ├── layout/                  # ✨ NEW: Layout components
│   │   ├── Dashboard.tsx
│   │   ├── SidebarNav.tsx
│   │   └── DataTable.tsx
│   │
│   ├── auth/                    # ✨ NEW: Auth components
│   │   ├── AuthContext.tsx
│   │   ├── AuthLogin.tsx
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── applications/            # ✨ NEW: Application feature
│   │   ├── ApplicationForm.tsx
│   │   ├── Applications.tsx
│   │   ├── DraftApplications.tsx
│   │   ├── ApplicationTable.tsx
│   │   ├── DraftApplicationTable.tsx
│   │   ├── ApplicationDetailPage.tsx
│   │   ├── ApplicationDetailView.tsx
│   │   ├── Columns.tsx
│   │   ├── StatusCard.tsx
│   │   ├── FieldSelectionDialog.tsx
│   │   └── forms/
│   │       ├── AktFields.tsx
│   │       ├── OsceFields.tsx
│   │       └── schema/
│   │           └── ApplicationSchema.tsx
│   │
│   ├── exam/                    # ✨ NEW: Exam feature
│   │   ├── Exam.tsx
│   │   ├── ExamComponent.tsx
│   │   ├── ExamClosed.tsx
│   │   └── ExamClosedApplication.tsx
│   │
│   ├── pdf/                     # ✨ NEW: PDF components
│   │   ├── PdfGenerator.tsx
│   │   ├── PdfPreviewPanel.tsx
│   │   └── PdfToImage.tsx
│   │
│   ├── theme/                   # ✨ NEW: Theme components
│   │   ├── AnimatedThemeToggle.tsx
│   │   ├── SimpleAnimatedThemeToggle.tsx
│   │   ├── ThemeToggleDemo.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── GooeyMenu.tsx
│   │
│   ├── common/                  # ✨ NEW: Shared components
│   │   ├── ErrorBoundary.tsx
│   │   ├── NotFound.tsx
│   │   ├── BrowserRestriction.tsx
│   │   └── BrowserCompatibilityWrapper.tsx
│   │
│   └── ui/                      # UI primitives only
│       └── ... (shadcn/ui components)
│
├── lib/                         # Utilities only
│   ├── utils.ts
│   ├── logger.ts
│   ├── errorHandler.ts
│   ├── browserDetection.ts
│   └── ... (other utilities)
│
├── redux/
│   ├── store.ts
│   ├── rootReducer.ts
│   └── slices/                  # ✨ NEW: Organized slices
│       ├── authSlice.ts
│       ├── applicationsSlice.ts
│       └── examDataSlice.ts
│
├── types/
│   ├── api.ts
│   ├── exam.ts
│   └── ... (type definitions)
│
└── styles/                      # ✨ NEW: Consolidated styles
    ├── globals.css
    ├── index.css
    └── App.css
```

## 🔄 Implementation Steps

### Step 1: Create New Directories ✅
```bash
mkdir -p src/api
mkdir -p src/components/{layout,auth,applications,exam,pdf,theme,common}
mkdir -p src/components/applications/forms/schema
mkdir -p src/redux/slices
mkdir -p src/styles
```

### Step 2: Move API Files
```bash
# Move all *Api.ts files from lib/ to api/
mv src/lib/*Api.ts src/api/
mv src/lib/apiClient.ts src/api/clients/
```

### Step 3: Consolidate Hooks
```bash
# Move all use*.ts files from lib/ to hooks/
mv src/lib/use*.ts src/hooks/
# Move use-toast from ui/ to hooks/
mv src/components/ui/use-toast.ts src/hooks/useToast.ts
# Remove duplicate use-mobile
rm src/components/ui/use-mobile.tsx
```

### Step 4: Reorganize Components
```bash
# Auth components
mv src/components/LoginForm.tsx src/components/auth/
mv src/auth/* src/components/auth/

# Application components  
mv src/components/application-form.tsx src/components/applications/ApplicationForm.tsx
mv src/components/Applications.tsx src/components/applications/
mv src/components/DraftApplications.tsx src/components/applications/
mv src/components/ui/applicationTable.tsx src/components/applications/ApplicationTable.tsx
mv src/components/ui/draftApplicationTable.tsx src/components/applications/DraftApplicationTable.tsx
mv src/components/ui/ApplicationDetailPage.tsx src/components/applications/
mv src/components/ui/application-detail-view.tsx src/components/applications/ApplicationDetailView.tsx
mv src/components/columns.tsx src/components/applications/Columns.tsx

# Exam components
mv src/components/exam.tsx src/components/exam/Exam.tsx
mv src/components/examComponent.tsx src/components/exam/ExamComponent.tsx
mv src/components/ui/examClosed.tsx src/components/exam/ExamClosed.tsx
mv src/components/ui/examClosedApplication.tsx src/components/exam/ExamClosedApplication.tsx

# PDF components
mv src/components/ui/pdf-generator.tsx src/components/pdf/PdfGenerator.tsx
mv src/components/ui/pdf-preview-panel.tsx src/components/pdf/PdfPreviewPanel.tsx
mv src/components/ui/pdfToImage.tsx src/components/pdf/PdfToImage.tsx

# Theme components
mv src/components/theme-provider.tsx src/components/theme/ThemeProvider.tsx

# Common components
mv src/components/ui/notFound.tsx src/components/common/NotFound.tsx

# Form field components
mv src/hooks/aktFeilds.tsx src/components/applications/forms/AktFields.tsx
mv src/hooks/osceFeilds.tsx src/components/applications/forms/OsceFields.tsx

# Layout components
mv src/components/dashboard.tsx src/components/layout/Dashboard.tsx
mv src/components/data-table.tsx src/components/layout/DataTable.tsx
```

### Step 5: Consolidate Styles
```bash
mv src/App.css src/styles/
```

### Step 6: Organize Redux
```bash
mv src/redux/Slice.ts src/redux/slices/authSlice.ts
mv src/redux/applicationsSlice.ts src/redux/slices/
mv src/redux/examDataSlice.ts src/redux/slices/
```

## 📊 File Renaming Map

| Old Path | New Path | Reason |
|----------|----------|--------|
| `auth/AuthContex.tsx` | `components/auth/AuthContext.tsx` | Fix typo + move |
| `auth/authLogin.tsx` | `components/auth/AuthLogin.tsx` | PascalCase + move |
| `auth/ProtectedRoute.tsx` | `components/auth/ProtectedRoute.tsx` | Move |
| `components/application-form.tsx` | `components/applications/ApplicationForm.tsx` | PascalCase + organize |
| `components/exam.tsx` | `components/exam/Exam.tsx` | PascalCase + organize |
| `components/examComponent.tsx` | `components/exam/ExamComponent.tsx` | PascalCase |
| `components/data-table.tsx` | `components/layout/DataTable.tsx` | PascalCase + organize |
| `components/dashboard.tsx` | `components/layout/Dashboard.tsx` | PascalCase + organize |
| `components/theme-provider.tsx` | `components/theme/ThemeProvider.tsx` | PascalCase + organize |
| `components/status-card.tsx` | `components/applications/StatusCard.tsx` | PascalCase + organize |
| `components/columns.tsx` | `components/applications/Columns.tsx` | PascalCase + organize |
| `components/settings.tsx` | `components/layout/Settings.tsx` | PascalCase + organize |
| `hooks/aktFeilds.tsx` | `components/applications/forms/AktFields.tsx` | Fix typo + move |
| `hooks/osceFeilds.tsx` | `components/applications/forms/OsceFields.tsx` | Fix typo + move |
| `lib/use*.ts` | `hooks/use*.ts` | Move all hooks |
| `redux/Slice.ts` | `redux/slices/authSlice.ts` | Better naming + organize |

## 🎨 Import Path Updates (After Reorganization)

All imports will use path aliases:

```typescript
// API imports
import { apiRequest } from '@/api/clients/apiClient'
import { getApplication } from '@/api/applicationsApi'

// Hook imports
import { useApplications } from '@/hooks/useApplications'
import { useDashboardData } from '@/hooks/useDashboardData'

// Component imports
import { ApplicationForm } from '@/components/applications/ApplicationForm'
import { Dashboard } from '@/components/layout/Dashboard'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// Redux imports
import { authSlice } from '@/redux/slices/authSlice'
```

## ⚠️ Important Notes

1. **Git History** - Using `git mv` preserves commit history
2. **Imports** - All imports will need updating (automated via search/replace)
3. **Testing** - Test after each major move
4. **Incremental** - Can be done in phases
5. **Backup** - Current state is safe

## 📈 Benefits After Reorganization

✅ **Clarity** - Clear where every file belongs  
✅ **Consistency** - All files follow same conventions  
✅ **Scalability** - Easy to add new features  
✅ **Maintainability** - Easier to find and update files  
✅ **Onboarding** - New developers can navigate easily  

