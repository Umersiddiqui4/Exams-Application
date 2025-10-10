# Actionable Improvement Plan

## 🎯 Quick Summary

**Overall Grade:** B (80/100)  
**Status:** Production-ready but needs refactoring  
**Critical Issues:** 3  
**High Priority:** 6  
**Medium Priority:** 8  

---

## 🔴 CRITICAL - Fix This Week

### 1. Fix React Hooks Violations (URGENT)
**File:** `src/components/application-form.tsx`  
**Issue:** 19 React Hooks called conditionally  
**Time:** 2-3 hours  
**Priority:** 🔴 **CRITICAL**

**Problem:**
```typescript
// Line ~140: Early return
if (occurrenceLoading) {
  return <div>Loading...</div>;
}

// Lines 149+: Hooks called AFTER early return ❌
const form = useForm(...);
useEffect(...);
```

**Quick Fix:**
```typescript
function ApplicationForm() {
  // ✅ MOVE ALL HOOKS TO TOP (before any returns)
  const form = useForm(...);
  const [state1, setState1] = useState(...);
  const [state2, setState2] = useState(...);
  useEffect(...);  // All hooks first
  
  // THEN conditional logic
  if (occurrenceLoading) {
    return <LoadingSpinner />;
  }
  
  // Rest of component...
}
```

**Steps:**
1. Open `src/components/application-form.tsx`
2. Find all `useState`, `useEffect`, `useForm`, `useMemo` calls
3. Move them ALL to the top (lines 71-150)
4. Ensure NO hooks after any `if/return` statements
5. Test the form still works
6. Commit: `fix: resolve React Hooks violations in ApplicationForm`

---

### 2. Reduce Bundle Size by 40% (HIGH)
**Current:** 5.37 MB → 1.43 MB gzipped (TOO LARGE!)  
**Target:** < 2 MB uncompressed  
**Time:** 1-2 hours  
**Priority:** 🔴 **CRITICAL**

**Implementation:**

Create `vite.config.ts` optimization:

```typescript
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split PDF libraries (largest dependency)
          'pdf-libs': ['pdfjs-dist', '@react-pdf/renderer', 'html2pdf.js'],
          
          // Split UI libraries
          'ui-libs': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
          ],
          
          // Split vendor
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Split form libraries
          'form-libs': ['react-hook-form', 'zod', '@hookform/resolvers'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
  }
})
```

**Add Lazy Loading:**

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const ApplicationForm = lazy(() => import('@/components/application-form'));
const PDFGenerator = lazy(() => import('@/components/ui/pdf-generator'));
const ApplicationTable = lazy(() => import('@/components/ui/applicationTable'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ApplicationForm />
</Suspense>
```

**Expected Result:** Bundle 2-3 MB (40-50% reduction!)

---

### 3. Add Testing Infrastructure (HIGH)
**Current:** 0 tests  
**Target:** Basic test setup  
**Time:** 2 hours  
**Priority:** 🟡 **HIGH**

**Quick Start:**

```bash
# Install testing libraries
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom happy-dom
```

**Update `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Write First Test:**

```typescript
// src/lib/__tests__/logger.test.ts
import { describe, it, expect, vi } from 'vitest';
import { logger } from '../logger';

describe('Logger', () => {
  it('should log debug messages in development', () => {
    const consoleSpy = vi.spyOn(console, 'debug');
    logger.debug('test message');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
```

---

## 🟡 HIGH PRIORITY - This Sprint

### 4. Centralize File Upload Logic
**Time:** 3-4 hours

**Create:**
```typescript
// src/hooks/useFileUpload.ts
import { useState } from 'react';
import { logger } from '@/lib/logger';

interface UseFileUploadOptions {
  maxSize: number;
  allowedTypes: string[];
  category: string;
  onSuccess?: (fileId: string) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    // Validation
    if (file.size > options.maxSize) {
      setError('File too large');
      return null;
    }
    
    if (!options.allowedTypes.includes(file.type)) {
      setError('Invalid file type');
      return null;
    }

    // Upload logic
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('/api/v1/attachments/upload', 'POST', formData);
      
      setPreview(URL.createObjectURL(file));
      options.onSuccess?.(response.id);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      options.onError?.(err as Error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setError(null);
    setProgress(0);
  };

  return { upload, uploading, progress, preview, error, clear };
}
```

**Use in components:**
```typescript
const { upload, uploading, preview, error } = useFileUpload({
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png'],
  category: 'passport',
});

// In upload handler
const handleUpload = async (file: File) => {
  const result = await upload(file);
  if (result) {
    // Success
  }
};
```

**Removes:** ~500 lines of duplicate code!

---

### 5. Replace All fetch() with apiClient
**Time:** 2 hours

**Find all direct fetch calls:**
```bash
grep -rn "fetch(" src/components/application-form.tsx
```

**Replace pattern:**

```typescript
// ❌ Before
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/applications`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

// ✅ After
import { apiRequest } from '@/api/clients/apiClient';

const response = await apiRequest('/api/v1/applications', 'POST', payload);
```

**Benefits:**
- Consistent error handling
- Automatic retry logic
- Token refresh handled
- Centralized logging

---

### 6. Extract Form Schemas
**Time:** 1 hour

**Problem:** Schemas mixed with component code

**Solution:**
```
/src/schemas/
├── applicationSchema.ts
├── aktFormSchema.ts
├── osceFormSchema.ts
└── validationRules.ts
```

---

## 🔵 MEDIUM PRIORITY - Next Sprint

### 7. Add Auto-Save for Forms
**Time:** 2-3 hours

```typescript
// src/hooks/useAutoSave.ts
export function useAutoSave(formData: any, interval = 30000) {
  useEffect(() => {
    const timer = setInterval(() => {
      const draft = {
        ...formData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('application_draft', JSON.stringify(draft));
      logger.info('Draft auto-saved');
    }, interval);

    return () => clearInterval(timer);
  }, [formData, interval]);
}

// In ApplicationForm
useAutoSave(form.watch(), 30000); // Save every 30s
```

---

### 8. Implement Multi-Step Form
**Time:** 1 day

**Benefits:**
- Less overwhelming
- Better UX
- Can validate per step
- Save progress

```typescript
const steps = [
  { id: 1, title: 'Personal Information', component: PersonalInfoStep },
  { id: 2, title: 'Educational Background', component: EducationStep },
  { id: 3, title: 'Documents', component: DocumentsStep },
  { id: 4, title: 'Review & Submit', component: ReviewStep },
];
```

---

### 9. Add Loading Skeletons
**Time:** 2 hours

Replace spinners with skeleton screens for better perceived performance.

---

### 10. Mobile Testing & Optimization
**Time:** 1 day

- Test on actual mobile devices
- Fix any layout issues
- Optimize touch interactions
- Test file uploads on mobile

---

## 📊 Implementation Timeline

### Sprint 1 (Week 1-2): Critical Fixes
```
Day 1-2:  Fix React Hooks violations
Day 3-4:  Implement code splitting
Day 5-6:  Set up testing infrastructure
Day 7-8:  Write first 20 tests
Day 9-10: Centralize file uploads
```

### Sprint 2 (Week 3-4): Refactoring
```
Day 1-3:  Split application-form.tsx
Day 4-5:  Replace fetch() with apiClient
Day 6-7:  Extract form schemas
Day 8-10: Add React Query
```

### Sprint 3 (Week 5-6): UX & Performance
```
Day 1-2:  Add auto-save
Day 3-4:  Multi-step forms
Day 5-6:  Loading skeletons
Day 7-8:  Mobile optimization
Day 9-10: Performance testing
```

---

## 🎓 Learning Resources

### For React Hooks
- https://react.dev/learn/rules-of-hooks
- https://react.dev/learn/reusing-logic-with-custom-hooks

### For Code Splitting
- https://react.dev/reference/react/lazy
- https://vitejs.dev/guide/build.html#chunking-strategy

### For Testing
- https://vitest.dev/guide/
- https://testing-library.com/docs/react-testing-library/intro/

### For Performance
- https://react.dev/reference/react/useMemo
- https://react.dev/reference/react/memo

---

## ✅ Checklist for Next Week

### Critical
- [ ] Fix React Hooks violations in application-form.tsx
- [ ] Implement code splitting in vite.config.ts
- [ ] Set up Vitest testing

### High Priority
- [ ] Create useFileUpload hook
- [ ] Replace 19 direct fetch() calls
- [ ] Split application-form into 3-4 components

### Quick Wins
- [ ] Add Error Boundary to App.tsx
- [ ] Create constants.ts file
- [ ] Add loading skeletons to dashboard
- [ ] Fix unused variable warnings

---

**Start Here:** Fix React Hooks violations → It's the most critical issue and will force you to refactor the monster component anyway!

