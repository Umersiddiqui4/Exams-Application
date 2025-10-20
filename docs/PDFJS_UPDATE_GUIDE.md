# PDF.js Update Guide: v2.16 → v5.4

## 🎯 Overview

**Current Version:** 2.16.105 (Released 2022)  
**Target Version:** 5.4.296 (Latest 2025)  
**Impact:** BREAKING CHANGES - Requires code modifications

---

## 📋 Step-by-Step Update Process

### Step 1: Update the Package

```bash
# Update pdfjs-dist to latest version
npm install pdfjs-dist@latest

# Check installed version
npm list pdfjs-dist
```

**Expected Result:** Should show `pdfjs-dist@5.4.296` or similar

---

### Step 2: Update Type Definitions (Optional)

The package includes its own TypeScript definitions, but you may want to update your custom types:

**Current file:** `/pdfjs-dist.d.ts`
```typescript
declare module "pdfjs-dist/webpack" {
  import * as pdfjsLib from "pdfjs-dist";
  export = pdfjsLib;
}
```

**This file can likely be removed** as v5 has better built-in types.

---

### Step 3: Update Import Statements

#### Files that need updating:
1. `src/components/ui/ApplicationDetailPage.tsx`
2. `src/components/ui/draftApplicationTable.tsx`
3. `src/components/ui/applicationTable.tsx`
4. `src/components/ui/application-detail-view.tsx`
5. `src/components/ui/pdfToImage.tsx`

#### Change #1: Import Statement

**OLD (v2.16):**
```typescript
import * as pdfjsLib from "pdfjs-dist/";
import "pdfjs-dist/build/pdf.worker.entry";
```

**NEW (v5.4):**
```typescript
import * as pdfjsLib from "pdfjs-dist";
// Worker import is handled differently now
```

#### Change #2: Worker Configuration

**OLD (v2.16):**
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
```

**NEW (v5.4) - Option A (Recommended for Vite):**
```typescript
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
```

**NEW (v5.4) - Option B (CDN):**
```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```

**NEW (v5.4) - Option C (Copy to public):**
```typescript
import * as pdfjsLib from "pdfjs-dist";

// After copying worker file to /public
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

---

### Step 4: Update vite.config.ts (If using Option A)

Add optimizations for pdfjs-dist:

```typescript
export default defineConfig({
  // ... existing config
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  }
});
```

---

## 🔧 File-by-File Changes

### File 1: `src/components/ui/pdfToImage.tsx`

**BEFORE:**
```typescript
import * as pdfjsLib from "pdfjs-dist/";
import "pdfjs-dist/build/pdf.worker.entry";

export async function pdfToImages(base64Data: string): Promise<string[]> {
  const pdfData = atob(base64Data.split(",")[1]);
  const uint8Array = new Uint8Array(pdfData.length);
  for (let i = 0; i < pdfData.length; i++) {
    uint8Array[i] = pdfData.charCodeAt(i);
  }

  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  // ... rest of code
}
```

**AFTER:**
```typescript
import * as pdfjsLib from "pdfjs-dist";

// Set worker (do this once at module level)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function pdfToImages(base64Data: string): Promise<string[]> {
  const pdfData = atob(base64Data.split(",")[1]);
  const uint8Array = new Uint8Array(pdfData.length);
  for (let i = 0; i < pdfData.length; i++) {
    uint8Array[i] = pdfData.charCodeAt(i);
  }

  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  // ... rest of code (no changes needed)
}
```

---

### File 2-5: Application Components

For all files that have:
```typescript
import * as pdfjsLib from "pdfjs-dist/";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
```

**Replace with:**
```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```

---

## 🧪 Testing After Update

### Test Checklist:

1. **PDF Preview in Applications Table**
   - [ ] Can preview PDF attachments
   - [ ] Can view all pages
   - [ ] Can download PDFs

2. **PDF Preview in Draft Applications**
   - [ ] Can preview PDF attachments
   - [ ] Thumbnail generation works

3. **PDF Generation**
   - [ ] Can generate application PDFs
   - [ ] All data renders correctly

4. **Performance**
   - [ ] PDF loading is fast
   - [ ] No console errors
   - [ ] Worker loads correctly

### Test Commands:

```bash
# 1. Build the project
npm run build

# Should complete without errors

# 2. Start dev server
npm run dev

# Test in browser:
# - Upload a PDF
# - View PDF preview
# - Generate application PDF
# - Check browser console for errors
```

---

## 🚨 Breaking Changes in v5

### 1. Import Paths Changed
- `pdfjs-dist/` → `pdfjs-dist`
- Worker path changed from `.js` to `.mjs`

### 2. Worker Configuration
- Old worker entry point removed
- New worker uses ES modules (`.mjs`)
- Better support for Vite/modern bundlers

### 3. API Changes (Minor)
- Most APIs are backward compatible
- `getDocument()` API is the same
- Rendering API is the same

### 4. Performance Improvements
- Faster PDF parsing
- Better memory management
- Improved rendering performance

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'pdfjs-dist/build/pdf.worker.entry'"

**Solution:** Remove the worker entry import and use CDN or URL import instead.

```typescript
// ❌ Remove this
import "pdfjs-dist/build/pdf.worker.entry";

// ✅ Add this
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```

---

### Issue 2: "Setting up fake worker failed"

**Solution:** Check that the worker path is correct and accessible.

```typescript
// Debug: Log the worker path
console.log('PDF.js version:', pdfjsLib.version);
console.log('Worker path:', pdfjsLib.GlobalWorkerOptions.workerSrc);
```

---

### Issue 3: Build warnings about worker

**Solution:** Add to `vite.config.ts`:

```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  worker: {
    format: 'es'
  }
});
```

---

### Issue 4: TypeScript errors

**Solution:** Remove custom type definitions:

```bash
# If you have custom pdfjs-dist.d.ts
rm pdfjs-dist.d.ts

# The package now includes its own types
```

---

## 🎯 Recommended Approach (Easiest)

### Option 1: CDN Worker (Simplest)

**Pros:**
- No build configuration needed
- Always uses correct version
- Easy to implement

**Cons:**
- Requires internet connection
- Extra network request

**Implementation:**
```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```

---

### Option 2: Copy Worker to Public (Best for Production)

**Pros:**
- Self-hosted (no external dependencies)
- Fast loading
- Works offline

**Cons:**
- Need to copy file after each update
- Slightly more setup

**Implementation:**

Step 1: Copy worker after install:
```bash
# Add to package.json scripts
"postinstall": "cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/"
```

Step 2: Use in code:
```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

---

## 📊 Migration Checklist

- [ ] Step 1: Update package (`npm install pdfjs-dist@latest`)
- [ ] Step 2: Update import in `pdfToImage.tsx`
- [ ] Step 3: Update import in `ApplicationDetailPage.tsx`
- [ ] Step 4: Update import in `draftApplicationTable.tsx`
- [ ] Step 5: Update import in `applicationTable.tsx`
- [ ] Step 6: Update import in `application-detail-view.tsx`
- [ ] Step 7: Update worker configuration in all files
- [ ] Step 8: Remove `pdfjs-dist.d.ts` if it exists
- [ ] Step 9: Run `npm run build` to check for errors
- [ ] Step 10: Test PDF preview functionality
- [ ] Step 11: Test PDF generation
- [ ] Step 12: Check browser console for errors
- [ ] Step 13: Test in production build

---

## 🚀 Quick Start Commands

```bash
# 1. Update the package
npm install pdfjs-dist@latest

# 2. Build to check for errors
npm run build

# 3. Test in dev mode
npm run dev

# 4. If all good, commit
git add package.json package-lock.json
git commit -m "chore: update pdfjs-dist from 2.16 to 5.4"
```

---

## 📚 Additional Resources

- [PDF.js GitHub](https://github.com/mozilla/pdf.js)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Migration Guide](https://github.com/mozilla/pdf.js/wiki/Migration-Guide)
- [Vite + PDF.js Guide](https://github.com/mozilla/pdf.js/issues/15006)

---

## ⚠️ Important Notes

1. **Backup First:** Make sure your code is committed before updating
2. **Test Thoroughly:** PDF rendering is critical - test all features
3. **Worker is Required:** PDFs won't load without proper worker setup
4. **Version Matching:** Worker version must match pdfjs-dist version
5. **Browser Compatibility:** v5 requires modern browsers (ES6+)

---

## 🎉 Benefits of Updating

1. ✅ **Security:** 3 years of security patches
2. ✅ **Performance:** 30-50% faster PDF rendering
3. ✅ **Memory:** Better memory management
4. ✅ **Features:** Support for newer PDF formats
5. ✅ **Compatibility:** Better ES modules support
6. ✅ **Bugs:** Hundreds of bug fixes

---

**Estimated Time:** 30 minutes  
**Risk Level:** Medium (breaking changes but straightforward)  
**Recommended:** YES - Security and performance improvements

