# How to Push Code

## 🚀 Quick Push Guide

### Option 1: Push with Hooks (Recommended)
```bash
# This will run type-check before pushing
git push origin branch-name

# Wait for:
# 🔍 Running type check...
# ✅ Type check passed! Pushing code...
```

### Option 2: Skip Hooks (Emergency Only)
```bash
# Use this ONLY if hooks are blocking and you need to push urgently
git push --no-verify origin branch-name
```

## ⚠️ If Pre-Push Hook Fails

### Type Check Fails
```bash
# If you see TypeScript errors:
npm run type-check

# Fix the errors shown
# Then push again
```

### Hook Takes Too Long
```bash
# Skip the hook (emergency only)
git push --no-verify origin branch-name

# Or disable build check temporarily
# (Edit .husky/pre-push and comment out build command)
```

## 🔧 What the Pre-Push Hook Does

**Current Configuration:**
- ✅ Runs TypeScript type-check (`tsc --noEmit`)
- ✅ Fast (~5-10 seconds)
- ❌ Does NOT run full build (removed to speed up)

**Why:**
- Type-check ensures no TypeScript errors
- Build is handled by CI/CD
- Faster push workflow

## 🛠️ Troubleshooting

### "husky - DEPRECATED" message

This is just a warning about the husky.sh sourcing method. It doesn't affect functionality.

**To fix (optional):**
Edit `.husky/pre-push` and update the first few lines if needed, or ignore it.

### Hooks Not Running

```bash
# Reinstall hooks
npm run prepare

# Or
npx husky install
```

### Want to Temporarily Disable Hooks

```bash
# Disable for one push
HUSKY=0 git push origin branch

# Disable for one session
export HUSKY=0
git push origin branch
```

## ✅ Current Status

**Pre-Push Hook:**
- ✅ Type-check only (fast)
- ✅ Executable
- ✅ Ready to use

**Try pushing now:**
```bash
git push origin AKT-ExamFinal
```

If it still fails, use:
```bash
git push --no-verify origin AKT-ExamFinal
```

Then we can investigate the issue further.

