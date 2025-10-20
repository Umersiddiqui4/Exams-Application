# Git Hooks Guide

## 🎯 Overview

This project uses **Husky** and **lint-staged** to automatically maintain code quality through Git hooks.

## 🪝 Hooks Configured

### 1. Pre-Commit Hook
**Runs:** Before each commit  
**Purpose:** Ensure code quality of committed files

**What it does:**
```bash
✓ Lints staged TypeScript files
✓ Auto-fixes ESLint errors
✓ Prevents commits with unfixable errors
```

**Example:**
```bash
$ git add src/components/MyComponent.tsx
$ git commit -m "feat: add new component"

# Automatically runs:
✔ ESLint checking MyComponent.tsx
✔ Auto-fixing code style issues
✔ Commit proceeds if no errors
```

### 2. Pre-Push Hook
**Runs:** Before pushing to remote  
**Purpose:** Ensure TypeScript correctness and buildability

**What it does:**
```bash
✓ Type checks all TypeScript files (tsc --noEmit)
✓ Runs full build to ensure code compiles
✓ Prevents broken code from reaching repository
```

**Example:**
```bash
$ git push origin feature-branch

# Automatically runs:
Running type check...
✔ TypeScript compilation successful

Running build check...
✔ Build successful

✔ Push proceeds
```

### 3. Commit-Msg Hook
**Runs:** When writing commit message  
**Purpose:** Enforce conventional commits format

**What it does:**
```bash
✓ Validates commit message format
✓ Enforces conventional commits standard
✓ Ensures clear, consistent commit history
```

**Example:**
```bash
$ git commit -m "updated stuff"
❌ Invalid commit message format!

$ git commit -m "fix: update authentication logic"
✅ Commit message format is valid
```

## 📝 Commit Message Format

### Required Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user dashboard` |
| `fix` | Bug fix | `fix: resolve login error` |
| `docs` | Documentation only | `docs: update API docs` |
| `style` | Code style (formatting) | `style: fix indentation` |
| `refactor` | Code restructuring | `refactor: simplify auth flow` |
| `perf` | Performance improvement | `perf: optimize image loading` |
| `test` | Add/update tests | `test: add unit tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `build` | Build system changes | `build: update webpack` |
| `ci` | CI/CD changes | `ci: add GitHub Actions` |
| `revert` | Revert previous commit | `revert: undo feature X` |

### Examples

**Good Commits:**
```bash
✅ feat: add email notification system
✅ feat(auth): implement OAuth login
✅ fix: prevent race condition in API calls
✅ fix(forms): validate phone number format
✅ docs: add deployment instructions
✅ refactor(hooks): consolidate data fetching
✅ perf: lazy load PDF components
✅ chore: update React to v18.3
```

**Bad Commits:**
```bash
❌ updated files
❌ fix bug
❌ changes
❌ WIP
❌ asdf
❌ minor updates
```

## 🛠️ Configuration

### package.json

**Scripts:**
```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

**lint-staged:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
npx lint-staged
```

### .husky/pre-push
```bash
#!/usr/bin/env sh
npm run type-check
npm run build
```

### .husky/commit-msg
```bash
#!/usr/bin/env sh
# Validates conventional commits format
```

## 🚫 Bypassing Hooks

**⚠️ Emergency Use Only**

Sometimes you may need to bypass hooks (deployment emergency, hotfix, etc.):

```bash
# Skip pre-commit
git commit --no-verify -m "emergency: hotfix production"

# Skip pre-push
git push --no-verify

# Skip both
git commit --no-verify && git push --no-verify
```

**Best Practice:** Only bypass in true emergencies. Fix the issues properly instead.

## 🔧 Customization

### Add More Pre-Commit Checks

Edit `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Add additional checks
npm run test:unit           # Run unit tests
npm run check-imports       # Check import consistency
npm run check-translations  # Validate i18n files
```

### Add Prettier Formatting

Update `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"  // Add prettier
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

### Customize Commit Format

Edit `.husky/commit-msg` to change:
- Allowed types
- Scope requirements
- Description length
- Custom patterns

## 📊 Benefits

### Automated Quality
✅ Code is always linted before commit  
✅ Type errors caught before push  
✅ Build failures prevented  
✅ Consistent code style enforced  

### Team Collaboration
✅ Consistent commit messages  
✅ Clear project history  
✅ Easy to generate changelogs  
✅ Better code reviews  

### Developer Experience
✅ Auto-fix linting errors  
✅ Immediate feedback  
✅ No CI failures for linting  
✅ Professional workflow  

## 🎓 Developer Workflow

### Daily Development

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Make changes
# ... code ...

# 3. Stage changes
git add src/components/NewComponent.tsx

# 4. Commit (hooks run automatically)
git commit -m "feat: add new component"
# → Pre-commit runs ESLint
# → Commit-msg validates format
# → Commit succeeds ✅

# 5. Push (hooks run automatically)
git push origin feat/new-feature
# → Pre-push runs type-check
# → Pre-push runs build
# → Push succeeds ✅
```

### If Hooks Fail

**Pre-commit fails (ESLint errors):**
```bash
$ git commit -m "feat: add component"
❌ ESLint found errors in MyComponent.tsx

# Fix the errors
# Then commit again
```

**Commit-msg fails (invalid format):**
```bash
$ git commit -m "updated code"
❌ Invalid commit message format!

# Use proper format
$ git commit -m "chore: update code"
✅ Success
```

**Pre-push fails (type errors):**
```bash
$ git push
❌ TypeScript found type errors

# Fix type errors
# Then push again
```

## 🔍 Troubleshooting

### Hook Not Running

```bash
# Reinstall hooks
npm run prepare

# Or manually
npx husky install
```

### Permission Denied

```bash
# Make hooks executable
chmod +x .husky/*
```

### Want to Disable Temporarily

```bash
# Set environment variable
HUSKY=0 git commit -m "message"
HUSKY=0 git push
```

## ✨ Advanced Features

### Run Hooks Manually

```bash
# Test pre-commit
.husky/pre-commit

# Test pre-push
.husky/pre-push

# Test commit-msg
echo "test: validate message" | .husky/commit-msg /dev/stdin
```

### Check What Would Run

```bash
# See what lint-staged would check
npx lint-staged --debug
```

### Skip Specific Checks

Edit individual hooks to comment out checks you don't want.

## 📚 Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Prettier Documentation](https://prettier.io/)

---

**Hooks Active:** ✅ Yes  
**Auto-Installed:** ✅ On `npm install`  
**Bypassable:** ✅ With `--no-verify` (emergency only)  
**Production Ready:** ✅ Yes

