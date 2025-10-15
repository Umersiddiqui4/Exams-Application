# Improvement Action Checklist
## Quick Reference Guide

---

## 🔴 Critical - Do This Week

### 1. Fix React Hooks Violations ⏰ 2-4 hours
**File:** `src/components/application-form.tsx`

```typescript
// Current structure (WRONG):
export function ApplicationForm() {
  // some state
  if (!params.examId) return null; // ❌ Early return
  const form = useForm(...); // ❌ Hook after return
}

// Fixed structure:
export function ApplicationForm() {
  const params = useParams();
  // ALL hooks here first
  const form = useForm(...);
  const [state, setState] = useState(...);
  useEffect(() => {...});
  
  // THEN conditional returns
  if (!params.examId) return null;
}
```

**Action Items:**
- [ ] Move all `useForm` calls to top of component
- [ ] Move all `useState` calls to top
- [ ] Move all `useEffect` calls to top
- [ ] Move all `useMemo` calls to top
- [ ] Test the form still works
- [ ] Run `npm run lint` to verify

---

### 2. Reduce Bundle Size with Code Splitting ⏰ 4-6 hours

**Step 1: Update vite.config.ts**
```typescript
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
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'pdf-vendor': ['@react-pdf/renderer', 'jspdf', 'html2pdf.js'],
          'form-vendor': ['react-hook-form', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Step 2: Add lazy loading to App.tsx**
```typescript
import { lazy, Suspense } from 'react';

const ApplicationForm = lazy(() => import('./components/application-form'));
const ExamComponent = lazy(() => import('./components/examComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* ... routes */}
      </Routes>
    </Suspense>
  );
}
```

**Action Items:**
- [ ] Update vite.config.ts with manualChunks
- [ ] Add lazy loading to App.tsx
- [ ] Create LoadingSpinner component
- [ ] Test all routes still work
- [ ] Run `npm run build` and check bundle sizes
- [ ] Target: Initial bundle < 1MB

---

### 3. Add Environment Validation ⏰ 1 hour

**Create:** `src/lib/envValidator.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

export function validateEnv() {
  try {
    envSchema.parse({
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Environment validation failed');
  }
}
```

**Update:** `src/main.tsx`
```typescript
import { validateEnv } from './lib/envValidator';

validateEnv(); // Add this line

ReactDOM.createRoot(...)
```

**Action Items:**
- [ ] Create envValidator.ts
- [ ] Update main.tsx
- [ ] Test with missing env vars
- [ ] Test with invalid env vars

---

## 🟡 High Priority - Do Next Week

### 4. Set Up Testing Framework ⏰ 2 hours

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Create:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Create:** `src/test/setup.ts`
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
afterEach(() => {
  cleanup();
});
```

**Update:** `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Action Items:**
- [ ] Install testing dependencies
- [ ] Create vitest.config.ts
- [ ] Create test setup file
- [ ] Add test scripts to package.json
- [ ] Write first test (e.g., formatName utility)
- [ ] Run `npm test` to verify

---

### 5. Set Up CI/CD Pipeline ⏰ 2-3 hours

**Create:** `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, AKT-ExamFinal]
  pull_request:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
```

**Action Items:**
- [ ] Create .github/workflows directory
- [ ] Create ci.yml file
- [ ] Push to GitHub
- [ ] Verify CI runs
- [ ] Fix any CI failures

---

### 6. Add Error Monitoring ⏰ 2 hours

```bash
npm install @sentry/react
```

**Update:** `src/main.tsx`
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
  });
}
```

**Action Items:**
- [ ] Create Sentry account (free tier)
- [ ] Get DSN from Sentry
- [ ] Add VITE_SENTRY_DSN to .env
- [ ] Install Sentry package
- [ ] Update main.tsx
- [ ] Test error reporting

---

## 🟢 Medium Priority - This Month

### 7. Write Critical Tests ⏰ 8-12 hours

**Priority Test Files:**

1. **Authentication (2 hours)**
   - [ ] `src/auth/__tests__/ProtectedRoute.test.tsx`
   - [ ] `src/components/__tests__/LoginForm.test.tsx`

2. **API Client (2 hours)**
   - [ ] `src/api/clients/__tests__/apiClient.test.ts`

3. **Utilities (1 hour)**
   - [ ] `src/lib/__tests__/utils.test.ts`
   - [ ] `src/lib/__tests__/errorHandler.test.ts`

4. **Form Validation (3 hours)**
   - [ ] `src/components/schema/__tests__/applicationSchema.test.ts`

5. **Components (4 hours)**
   - [ ] `src/components/__tests__/dashboard.test.tsx`
   - [ ] `src/components/__tests__/Applications.test.tsx`

**Target:** 50-60% code coverage

---

### 8. Reduce TypeScript `any` Types ⏰ 10-15 hours

**Priority Files:**
1. [ ] `application-form.tsx` (20+ any types)
2. [ ] `exam.tsx` (20+ any types)
3. [ ] `LoginForm.tsx` (3 any types)
4. [ ] `SignupForm.tsx` (3 any types)

**Strategy:**
```typescript
// ❌ Before
const handleChange = (e: any) => { ... }

// ✅ After
import { ChangeEvent } from 'react';
const handleChange = (e: ChangeEvent<HTMLInputElement>) => { ... }
```

---

### 9. Add Performance Monitoring ⏰ 1 hour

```bash
npm install web-vitals
```

**Create:** `src/lib/analytics.ts`
```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  if (import.meta.env.PROD) {
    onCLS(metric => console.log('CLS:', metric));
    onFID(metric => console.log('FID:', metric));
    onFCP(metric => console.log('FCP:', metric));
    onLCP(metric => console.log('LCP:', metric));
    onTTFB(metric => console.log('TTFB:', metric));
  }
}
```

**Action Items:**
- [ ] Install web-vitals
- [ ] Create analytics.ts
- [ ] Call in main.tsx
- [ ] Set up analytics dashboard (optional)

---

## ⚡ Quick Wins - Do Anytime

### 10. Update Browser Data ⏰ 5 minutes
```bash
npx update-browserslist-db@latest
```

### 11. Add .nvmrc ⏰ 1 minute
```bash
echo "18.17.0" > .nvmrc
```

### 12. Add Accessibility Linting ⏰ 30 minutes
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

Update `eslint.config.js`:
```javascript
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // ... existing config
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  }
);
```

---

## 📊 Progress Tracking

### Week 1 Progress
- [ ] Fix React Hooks violations
- [ ] Implement code splitting
- [ ] Add environment validation
- [ ] Update browserslist

**Target:** Bundle size < 1MB, 0 critical lint errors

### Week 2 Progress
- [ ] Set up testing framework
- [ ] Write critical path tests
- [ ] Set up CI/CD pipeline
- [ ] Add error monitoring

**Target:** 40-50% test coverage, CI passing

### Week 3 Progress
- [ ] Reduce TypeScript any types
- [ ] Add performance monitoring
- [ ] Audit dependencies
- [ ] Add accessibility linting

**Target:** < 80 any types, all audits passing

### Week 4 Progress
- [ ] Add component documentation
- [ ] Improve README
- [ ] Add CONTRIBUTING.md
- [ ] Create CHANGELOG.md

**Target:** Complete documentation

---

## 📈 Success Metrics

After completion, you should have:

✅ **Performance**
- Initial bundle: < 1 MB
- Load time: < 3s
- Lighthouse: > 90

✅ **Quality**
- 0 critical lint errors
- Test coverage: > 60%
- TypeScript any: < 50

✅ **DevOps**
- CI/CD pipeline running
- Error monitoring active
- Automated deployments

---

## 🚀 Getting Started

**Start with this command sequence:**

```bash
# 1. Fix React Hooks (open application-form.tsx and refactor)

# 2. Implement code splitting
# Update vite.config.ts and App.tsx as shown above

# 3. Add env validation
npm run dev  # Test everything works

# 4. Install testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom

# 5. Update browserslist
npx update-browserslist-db@latest

# 6. Rebuild and test
npm run build
npm run lint
npm run type-check
```

---

## 📞 Need Help?

Refer to:
- Full details: `PROJECT_IMPROVEMENT_RECOMMENDATIONS.md`
- Existing issues: `REMAINING_ISSUES.md`
- Project status: `COMPLETE_PROJECT_STATUS.md`

---

**Last Updated:** October 13, 2025
**Next Review:** After Week 1 completion

