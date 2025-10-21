# Component Organization Guide

## 📁 Directory Structure

```
components/
├── common/                # Shared reusable components
├── features/              # Feature-specific components
│   ├── applications/      # Application management
│   ├── auth/             # Authentication & authorization
│   ├── dashboard/        # Dashboard views
│   ├── exams/            # Exam management
│   └── settings/         # Application settings
├── layout/               # Layout & wrapper components
├── pdf/                  # PDF generation & preview
├── theme/                # Theme-related components
└── ui/                   # UI primitives (shadcn/ui)
```

## 🎯 Organization Principles

### 1. **Feature-Based Organization**
Components are organized by feature domain, not by technical type. This makes it easier to:
- Locate related components
- Understand feature boundaries
- Scale the application
- Maintain feature isolation

### 2. **Separation of Concerns**
Each directory has a specific purpose:

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `common/` | Shared components used across multiple features | Data tables, status cards, dialogs |
| `features/` | Domain-specific business logic components | Application forms, exam lists |
| `layout/` | Page structure and navigation components | Sidebar, menus, wrappers |
| `pdf/` | PDF-specific functionality | PDF generator, preview panels |
| `theme/` | Theming and appearance | Theme toggles, providers |
| `ui/` | Basic UI primitives (shadcn/ui library) | Buttons, inputs, dialogs |

---

## 📂 Directory Details

### `/common/` - Shared Components
**Purpose**: Reusable components that are used across multiple features but are too specific to be in `/ui/`.

**Current Components**:
- `columns.tsx` - Table column definitions
- `data-table.tsx` - Generic data table component
- `date-range-picker.tsx` - Date range selection component
- `field-selection-dialog.tsx` - Field selection dialog
- `notFound.tsx` - 404 not found component
- `status-card.tsx` - Status display card

**When to Add Here**:
- ✅ Component is used by 2+ features
- ✅ Component has business logic specific to this app
- ✅ Component is NOT a basic UI primitive
- ❌ Don't add feature-specific components
- ❌ Don't add basic UI elements (those go in `/ui/`)

**Example**:
```typescript
// Good: Shared data table used across features
import { DataTable } from '@/components/common/data-table'

// Usage in applications and exams features
<DataTable columns={columns} data={applications} />
```

---

### `/features/` - Feature Components
**Purpose**: Components that belong to a specific business domain/feature.

#### `/features/applications/`
Application management components including forms, tables, and detail views.

**Components**:
- `application-detail-view.tsx` - Detailed application view
- `application-form.tsx` - Application creation/editing form
- `ApplicationDetailPage.tsx` - Full detail page
- `Applications.tsx` - Main applications list page
- `applicationTable.tsx` - Applications table
- `DraftApplications.tsx` - Draft applications page
- `draftApplicationTable.tsx` - Draft applications table

#### `/features/auth/`
Authentication and user management components.

**Components**:
- `EmailVerification.tsx` - Email verification flow
- `LoginForm.tsx` - Login form component
- `ResetPassword.tsx` - Password reset flow
- `SignupForm.tsx` - User registration form

#### `/features/dashboard/`
Dashboard and analytics views.

**Components**:
- `dashboard.tsx` - Main dashboard component

#### `/features/exams/`
Exam management and display components.

**Components**:
- `exam.tsx` - Main exam component
- `examClosed.tsx` - Closed exams view
- `examClosedApplication.tsx` - Closed exam applications
- `examComponent.tsx` - Exam display component

#### `/features/settings/`
Application settings and configuration.

**Components**:
- `settings.tsx` - Settings page component

**When to Add Here**:
- ✅ Component is specific to one feature domain
- ✅ Component contains business logic for that feature
- ✅ Component won't be reused in other features
- ❌ Don't add if used by multiple features (use `/common/` instead)

**Example**:
```typescript
// Feature-specific component
import { ApplicationForm } from '@/components/features/applications/application-form'

// Only used in application-related pages
<ApplicationForm onSubmit={handleSubmit} />
```

---

### `/layout/` - Layout Components
**Purpose**: Components that provide page structure, navigation, and app-wide wrappers.

**Current Components**:
- `BrowserCompatibilityWrapper.tsx` - Browser compatibility checks
- `BrowserRestriction.tsx` - Browser restriction enforcement
- `ErrorBoundary.tsx` - React error boundary
- `GooeyMenu.tsx` - Animated menu component
- `SidebarNav.tsx` - Sidebar navigation

**When to Add Here**:
- ✅ Component wraps pages or sections
- ✅ Component provides navigation structure
- ✅ Component is used for layout purposes
- ✅ Component handles app-wide concerns (errors, compatibility)

**Example**:
```typescript
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { SidebarNav } from '@/components/layout/SidebarNav'

<ErrorBoundary>
  <SidebarNav />
  <MainContent />
</ErrorBoundary>
```

---

### `/pdf/` - PDF Components
**Purpose**: PDF generation, preview, and manipulation components.

**Current Components**:
- `pdf-generator.tsx` - PDF generation logic
- `pdf-preview-panel.tsx` - PDF preview display
- `pdfToImage.tsx` - PDF to image conversion

**When to Add Here**:
- ✅ Component deals with PDF functionality
- ✅ Component generates or displays PDFs
- ✅ Component converts PDF formats

**Example**:
```typescript
import { PdfGenerator } from '@/components/pdf/pdf-generator'
import { PdfPreviewPanel } from '@/components/pdf/pdf-preview-panel'

<PdfPreviewPanel>
  <PdfGenerator data={applicationData} />
</PdfPreviewPanel>
```

---

### `/theme/` - Theme Components
**Purpose**: Components related to application theming and appearance.

**Current Components**:
- `AnimatedThemeToggle.tsx` - Animated theme switcher
- `SimpleAnimatedThemeToggle.tsx` - Simple theme toggle
- `theme-provider.tsx` - Theme context provider

**When to Add Here**:
- ✅ Component controls theming
- ✅ Component provides theme context
- ✅ Component switches between themes

**Example**:
```typescript
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AnimatedThemeToggle } from '@/components/theme/AnimatedThemeToggle'

<ThemeProvider>
  <App />
  <AnimatedThemeToggle />
</ThemeProvider>
```

---

### `/ui/` - UI Primitives
**Purpose**: Basic, reusable UI components from shadcn/ui library. These are the building blocks for all other components.

**Categories**:

#### Form Components
`input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `calendar.tsx`, `phone-input.tsx`, `input-otp.tsx`, `form.tsx`, `label.tsx`

#### Display Components
`card.tsx`, `badge.tsx`, `avatar.tsx`, `skeleton.tsx`, `progress.tsx`, `separator.tsx`, `alert.tsx`, `aspect-ratio.tsx`, `chart.tsx`

#### Navigation Components
`tabs.tsx`, `breadcrumb.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `sidebar.tsx`

#### Overlay Components
`dialog.tsx`, `sheet.tsx`, `drawer.tsx`, `popover.tsx`, `tooltip.tsx`, `hover-card.tsx`, `alert-dialog.tsx`, `command.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`

#### Interactive Components
`button.tsx`, `toggle.tsx`, `toggle-group.tsx`, `slider.tsx`, `scroll-area.tsx`, `resizable.tsx`, `collapsible.tsx`, `accordion.tsx`, `carousel.tsx`

#### Utility Components
`table.tsx`, `rich-text-editor.tsx`, `toast.tsx`, `toaster.tsx`, `sonner.tsx`, `use-toast.ts`

**When to Add Here**:
- ✅ Component is a basic UI primitive
- ✅ Component has NO business logic
- ✅ Component is highly reusable
- ✅ Component comes from shadcn/ui library
- ❌ Don't add feature-specific components
- ❌ Don't add components with business logic

**Example**:
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

<Card>
  <Input placeholder="Enter name" />
  <Button>Submit</Button>
</Card>
```

---

## 📝 Naming Conventions

### Files
- **React Components**: Use kebab-case for files (following project convention)
  - Examples: `application-form.tsx`, `data-table.tsx`, `theme-provider.tsx`
- **Component Names**: Use PascalCase for exports
  - Examples: `ApplicationForm`, `DataTable`, `ThemeProvider`

### Component Structure
```typescript
// application-form.tsx
export function ApplicationForm() {
  return <div>...</div>
}

// OR with default export
export default function ApplicationForm() {
  return <div>...</div>
}
```

---

## 🎨 Component Guidelines

### 1. **Single Responsibility**
Each component should do one thing well.

```typescript
// ✅ Good: Focused component
export function LoginForm() {
  // Only handles login form UI and validation
}

// ❌ Bad: Too many responsibilities
export function AuthPage() {
  // Handles login, signup, reset password, AND layout
}
```

### 2. **Composition Over Complexity**
Build complex UIs by composing simple components.

```typescript
// ✅ Good: Composed from smaller components
export function ApplicationDetailPage() {
  return (
    <div>
      <ApplicationHeader />
      <ApplicationForm />
      <ApplicationDocuments />
      <ApplicationActions />
    </div>
  )
}
```

### 3. **Props Interface**
Always define props interfaces for type safety.

```typescript
interface ApplicationFormProps {
  initialData?: Application
  onSubmit: (data: Application) => void
  isLoading?: boolean
}

export function ApplicationForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: ApplicationFormProps) {
  // Component implementation
}
```

### 4. **Hooks Integration**
Use custom hooks for data fetching and state management.

```typescript
import { useApplications } from '@/hooks/useApplications'

export function Applications() {
  const { items, loadState, error, create } = useApplications()
  
  // Component implementation
}
```

---

## 🔄 Import Patterns

### Absolute Imports
Always use absolute imports with the `@/` alias.

```typescript
// ✅ Good: Absolute imports
import { Button } from '@/components/ui/button'
import { ApplicationForm } from '@/components/features/applications/application-form'
import { DataTable } from '@/components/common/data-table'

// ❌ Bad: Relative imports
import { Button } from '../../ui/button'
import { ApplicationForm } from './application-form'
```

### Import Organization
Group and order imports logically.

```typescript
// 1. React and third-party libraries
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Common components
import { DataTable } from '@/components/common/data-table'

// 4. Feature components
import { ApplicationForm } from '@/components/features/applications/application-form'

// 5. Hooks
import { useApplications } from '@/hooks/useApplications'

// 6. Utilities
import { cn } from '@/lib/utils'

// 7. Types
import type { Application } from '@/types/api'
```

---

## 🚀 Adding New Components

### Decision Flow

```
Is it a basic UI element with no business logic?
├─ YES → Add to /ui/
└─ NO → Continue

Does it handle layout/navigation/app-wide concerns?
├─ YES → Add to /layout/
└─ NO → Continue

Is it PDF-related?
├─ YES → Add to /pdf/
└─ NO → Continue

Is it theme-related?
├─ YES → Add to /theme/
└─ NO → Continue

Is it used by multiple features?
├─ YES → Add to /common/
└─ NO → Continue

Is it feature-specific?
└─ YES → Add to /features/{feature-name}/
```

### Examples

**Example 1: Adding a notification component**
```
Question: Where should a notification toast component go?
Answer: /ui/ - It's a basic UI primitive

File: /ui/toast.tsx (already exists)
```

**Example 2: Adding an exam schedule component**
```
Question: Where should an exam scheduling component go?
Answer: /features/exams/ - It's specific to the exam feature

File: /features/exams/exam-schedule.tsx
```

**Example 3: Adding a filter panel**
```
Question: Where should a reusable filter panel go?
Answer: /common/ - If used across multiple features
OR: /features/{name}/ - If only used in one feature

File: /common/filter-panel.tsx (if shared)
OR: /features/applications/application-filter.tsx (if specific)
```

---

## 🔧 Common Patterns

### 1. **Form Components**
Use form components for data collection.

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ApplicationForm() {
  const form = useForm({
    resolver: zodResolver(applicationSchema)
  })
  
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <Input {...field} />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

### 2. **Table Components**
Use data table for listing data.

```typescript
import { DataTable } from '@/components/common/data-table'
import { columns } from './columns'

export function Applications() {
  const { items } = useApplications()
  
  return <DataTable columns={columns} data={items} />
}
```

### 3. **Dialog Components**
Use dialogs for modals and overlays.

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function ApplicationDialog({ open, onOpenChange }: ApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

---

## 📊 Component Metrics

### Current Organization

| Directory | Components | Purpose |
|-----------|-----------|---------|
| `/common/` | 6 | Shared reusable components |
| `/features/applications/` | 7 | Application management |
| `/features/auth/` | 4 | Authentication |
| `/features/dashboard/` | 1 | Dashboard views |
| `/features/exams/` | 4 | Exam management |
| `/features/settings/` | 1 | Settings |
| `/layout/` | 5 | Layout & structure |
| `/pdf/` | 3 | PDF functionality |
| `/theme/` | 3 | Theming |
| `/ui/` | 50+ | UI primitives |

---

## ✨ Best Practices

### 1. **Co-location**
Keep related files close together.

```
/features/applications/
  ├── application-form.tsx
  ├── application-form.test.tsx (if tests exist)
  ├── application-form.utils.ts (helper functions)
  └── application-form.styles.css (if needed)
```

### 2. **Component Size**
Keep components small and focused. If a component file exceeds ~300 lines, consider splitting it.

### 3. **Reusability**
Before creating a new component, check if:
- A similar component exists in `/ui/`
- A similar component exists in `/common/`
- An existing component can be extended with props

### 4. **Documentation**
Add JSDoc comments for complex components.

```typescript
/**
 * Application form component for creating and editing applications.
 * 
 * @param initialData - Optional initial application data for editing
 * @param onSubmit - Callback function when form is submitted
 * @param isLoading - Loading state for submit button
 * 
 * @example
 * <ApplicationForm 
 *   initialData={application} 
 *   onSubmit={handleSubmit}
 *   isLoading={isSubmitting}
 * />
 */
export function ApplicationForm({ initialData, onSubmit, isLoading }: ApplicationFormProps) {
  // Implementation
}
```

### 5. **Error Boundaries**
Wrap features with error boundaries from `/layout/`.

```typescript
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'

export function ApplicationsPage() {
  return (
    <ErrorBoundary>
      <Applications />
    </ErrorBoundary>
  )
}
```

---

## 🎓 Learning Resources

### Internal References
- **Project Structure**: `/docs/PROJECT_STRUCTURE.md` - Overall project organization
- **API Layer**: `/src/api/README.md` - API integration patterns
- **Hooks**: `/src/hooks/` - Custom React hooks usage
- **Types**: `/src/types/` - TypeScript type definitions

### External Resources
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/) - UI component library
- **React Hook Form**: [https://react-hook-form.com/](https://react-hook-form.com/) - Form handling
- **Zod**: [https://zod.dev/](https://zod.dev/) - Schema validation

---

## 🔍 Quick Reference

### Component Import Cheat Sheet

```typescript
// UI Primitives
import { Button, Input, Card, Dialog } from '@/components/ui/{component}'

// Common Components
import { DataTable, StatusCard } from '@/components/common/{component}'

// Feature Components
import { ApplicationForm } from '@/components/features/applications/{component}'
import { LoginForm } from '@/components/features/auth/{component}'
import { Dashboard } from '@/components/features/dashboard/{component}'

// Layout Components
import { SidebarNav, ErrorBoundary } from '@/components/layout/{component}'

// Theme Components
import { ThemeProvider, AnimatedThemeToggle } from '@/components/theme/{component}'

// PDF Components
import { PdfGenerator, PdfPreviewPanel } from '@/components/pdf/{component}'
```

---

**Status**: ✅ Well-Organized Component Structure  
**Maintainability**: 🟢 High - Clear boundaries and responsibilities  
**Scalability**: 🟢 High - Easy to add new features and components  

For questions or suggestions about component organization, refer to this guide or consult the team.

