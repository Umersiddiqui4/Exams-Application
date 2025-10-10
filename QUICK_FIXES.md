# Quick Fixes - Priority Actions

This document lists the **most critical issues** that should be fixed immediately, in order of priority.

## 🚨 Immediate Actions (Do These First)

### 1. Create Environment Variables File
**Status**: ✅ File created as `env.example`

**Action Required**:
```bash
# Rename the file
mv env.example .env.example

# Create your local .env file
cp .env.example .env

# Fill in your actual values in .env
```

### 2. Remove Unused Next.js Code
**Files to Delete**:
- `/app/actions/auth.ts` - Contains Next.js server actions (not compatible with Vite)
- `/app/globals.css` - Duplicate of `/src/globals.css`

**Action**:
```bash
# Remove the entire app directory
rm -rf app/
```

**Why**: This is Next.js code in a Vite/React project. It's not being used and causes confusion.

### 3. Fix Unused Auth Context
**File to Delete**: `/src/auth/AuthContex.tsx` (also has typo in name)

**Action**:
```bash
rm src/auth/AuthContex.tsx
```

**Why**: You're already using Redux for auth state management. This Context is created but never used.

### 4. Remove Duplicate PostCSS Config
**File to Delete**: `postcss.config.cjs`

**Action**:
```bash
rm postcss.config.cjs
```

**Keep**: `postcss.config.js` (standard for Vite)

### 5. Consolidate Duplicate Folders

**Move files from root-level folders to src**:
```bash
# Check if files are duplicates first, then:
# If /hooks files are different from /src/hooks, move them
# If /lib files are different from /src/lib, move them
# Otherwise delete the root-level folders

# Example (verify first):
# mv hooks/* src/hooks/ 2>/dev/null || true
# mv lib/* src/lib/ 2>/dev/null || true
# rm -rf hooks/ lib/
```

---

## 🔧 Code Fixes (High Priority)

### 6. Fix TypeScript `any` in Redux Selectors

**Files to Fix**:

#### `src/auth/ProtectedRoute.tsx` (Line 17)
**Before**:
```typescript
const { isAuthenticated } = useSelector((state: any) => state.auth);
```

**After**:
```typescript
import type { RootState } from '../redux/store';

const { isAuthenticated } = useSelector((state: RootState) => state.auth);
```

#### `src/components/LoginForm.tsx` (Line 22)
**Before**:
```typescript
const { isAuthenticated, error, loading, errorType } = useSelector((state: any) => state.auth);
```

**After**:
```typescript
import type { RootState } from '@/redux/store';

const { isAuthenticated, error, loading, errorType } = useSelector((state: RootState) => state.auth);
```

### 7. Add RootState Type to Redux Store

**File**: `src/redux/store.ts`

**Add these lines at the end**:
```typescript
// Export types for use in components
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 8. Remove Hardcoded API URLs

**File**: `src/lib/authApi.ts`

**Before** (Lines 57-58, 62-63):
```typescript
export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	return apiRequest<LoginResponse>("/api/v1/auth/email/login", "POST", { email, password }, { baseUrl });
}

export async function signupWithEmail(data: SignupRequest): Promise<SignupResponse> {
	const baseUrl = "https://mrcgp-api.omnifics.io";
	return apiRequest<SignupResponse>("/api/v1/auth/email/signup", "POST", data, { baseUrl });
}
```

**After**:
```typescript
export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
	// Uses baseUrl from environment variable via apiRequest defaults
	return apiRequest<LoginResponse>("/api/v1/auth/email/login", "POST", { email, password });
}

export async function signupWithEmail(data: SignupRequest): Promise<SignupResponse> {
	return apiRequest<SignupResponse>("/api/v1/auth/email/signup", "POST", data);
}
```

**Same fix needed in**:
- `src/components/ui/draftApplicationTable.tsx`
- `src/components/ui/applicationTable.tsx`
- `src/components/ui/ApplicationDetailPage.tsx`
- `src/components/application-form.tsx`
- `src/lib/useDashboardData.ts`

**Pattern**: Remove `const baseUrl = "https://mrcgp-api.omnifics.io"` and the `{ baseUrl }` option. The `apiRequest` function already reads from `VITE_API_BASE_URL`.

### 9. Fix `any` Type in authApi.ts

**File**: `src/lib/authApi.ts` (Line 79)

**Before**:
```typescript
export type UploadImageResponse = {
	message: string;
	statusCode: number;
	success: boolean;
	data?: any;
};
```

**After**:
```typescript
export type UploadImageResponse = {
	message: string;
	statusCode: number;
	success: boolean;
	data?: {
		id: string;
		url: string;
		fileName: string;
		// Add other known fields from your API response
	};
};
```

### 10. Fix `any` in LoginForm

**File**: `src/components/LoginForm.tsx` (Line 86)

**Before**:
```typescript
} catch (err: any) {
	dispatch(loginFailure({ message:'Invalid email or password', type: 'general' }));
}
```

**After**:
```typescript
} catch (err) {
	const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
	dispatch(loginFailure({ message: errorMessage, type: 'general' }));
}
```

---

## 📋 Enhanced ESLint Configuration

**File**: `eslint.config.js`

**Add these rules**:
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // NEW RULES:
      '@typescript-eslint/no-explicit-any': 'warn', // Warn on 'any' usage
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Warn on console.log
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
)
```

---

## 📦 Setup Testing Framework

### Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Create Vitest Config
**File**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

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
})
```

### Create Test Setup File
**File**: `src/test/setup.ts`
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})
```

### Add Test Script to package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🔒 Setup Pre-commit Hooks

### Install Husky and lint-staged
```bash
npm install -D husky lint-staged
npx husky init
```

### Configure lint-staged
**File**: `package.json` (add this section)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Create pre-commit hook
**File**: `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

---

## 📊 Bundle Analysis

### Install Bundle Analyzer
```bash
npm install -D rollup-plugin-visualizer
```

### Update vite.config.ts
```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
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
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
        },
      },
    },
  },
})
```

---

## ✅ Verification Checklist

After making the fixes, verify:

- [ ] Project builds without errors: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] TypeScript compiles: `tsc --noEmit`
- [ ] All routes work in dev mode: `npm run dev`
- [ ] No hardcoded URLs in codebase (search for "mrcgp-api.omnifics.io")
- [ ] No `any` types in critical files (auth, API clients)
- [ ] Environment variables loaded correctly
- [ ] Unused files deleted
- [ ] Tests run (after setting up testing): `npm test`

---

## 📈 Expected Improvements

After these fixes:
- ✅ Reduced `any` types by ~30%
- ✅ Cleaner project structure
- ✅ Proper environment configuration
- ✅ Better type safety in Redux
- ✅ Testing framework ready
- ✅ Code quality enforcement via ESLint
- ✅ Pre-commit hooks preventing bad code

---

## 🆘 If Something Breaks

1. **Revert changes**: `git checkout -- <file>`
2. **Check console errors**: Look for import errors
3. **Verify environment**: Make sure `.env` file exists and has correct values
4. **Clear cache**: `rm -rf node_modules/.vite` and restart dev server

---

**Time Estimate**: 2-4 hours for all quick fixes  
**Difficulty**: Medium  
**Impact**: High - Significantly improves code quality


