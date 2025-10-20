# Field Selection for Excel Export

This feature allows administrators to customize which fields are included in Excel exports and in what order they appear.

## Features

### 1. Field Selection Dialog
- **Location**: `src/components/ui/field-selection-dialog.tsx`
- **Purpose**: Provides a comprehensive interface for selecting and ordering export fields

### 2. Key Capabilities

#### Field Management
- **Search**: Filter available fields by name or key
- **Select All/None**: Quick selection controls
- **Field Categories**: Fields are categorized as:
  - `application`: Application-specific data
  - `exam`: Exam-related information  
  - `system`: System-generated data (timestamps, status, etc.)

#### Drag & Drop Reordering
- **Library**: `@hello-pangea/dnd`
- **Functionality**: Drag fields up/down to reorder them
- **Visual Feedback**: Real-time preview during dragging

#### Export Configuration
- **Sheet Name**: Customizable Excel sheet name
- **Export Options**:
  - Include waiting list applications
  - Include rejected applications
- **Field Configuration**: JSON structure sent to backend API

### 3. Integration

#### Backend API Integration
The field configuration is sent to the backend as a JSON string in the `fieldConfig` query parameter:

```json
{
  "fields": [
    {
      "key": "email",
      "displayName": "Email Address", 
      "type": "application"
    },
    {
      "key": "fullName",
      "displayName": "Full Name",
      "type": "application"
    }
  ],
  "sheetName": "Applications"
}
```

#### API Endpoint
```
GET /api/v1/applications/exam-occurrence/{examOccurrenceId}/export
```

**Query Parameters**:
- `includeWaitingList`: boolean
- `includeRejected`: boolean  
- `fieldConfig`: JSON string (as shown above)

### 4. Available Fields

The component includes all fields from the `ApplicationData` type:

#### Basic Information
- Candidate ID, Full Name, Email Address
- WhatsApp Number, Emergency Contact

#### Address Information  
- Street Address, P.O. Box, District, City
- Province, Country, Country of Origin
- Country of Experience

#### Registration Information
- Registration Authority, Registration Number
- Registration Date

#### Exam Information
- Part 1 Passing Date, Previous OSCE Attempts
- Preference Dates (1, 2, 3)

#### Status and System
- Application Status, Application Date
- Last Updated, Waiting List Status
- Notes, Admin Notes

### 5. Usage

#### In Application Table
The field selection dialog is integrated into the existing export functionality in `src/components/ui/applicationTable.tsx`:

```tsx
<FieldSelectionDialog
  isOpen={isFieldSelectionOpen}
  onClose={() => setIsFieldSelectionOpen(false)}
  onExport={handleConfirmExport}
  isExporting={isExporting}
/>
```

#### Demo Component
A demo component is available at `src/components/ui/field-selection-demo.tsx` for testing and showcasing the functionality.

### 6. Dependencies

- `@hello-pangea/dnd`: Drag and drop functionality
- `@radix-ui/react-*`: UI components
- `lucide-react`: Icons

### 7. Styling

The component follows the existing design system:
- Uses Tailwind CSS classes
- Consistent with other UI components
- Dark mode support
- Responsive design

### 8. Error Handling

- Validates field selection (at least one field required)
- Validates sheet name (non-empty)
- Shows appropriate error messages via toast notifications
- Graceful handling of API errors

### 9. Known Issues & Solutions

#### Cursor Offset During Drag
- **Issue**: The dragged element may appear far from the cursor during drag operations
- **Cause**: This is a known issue with the `@hello-pangea/dnd` library in certain browser configurations
- **Solution**: CSS fixes have been applied in `src/globals.css` to minimize this issue
- **Workaround**: Use the up/down arrow buttons as an alternative to drag and drop

### 10. Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Implementation Notes

1. **State Management**: Uses React hooks for local state management
2. **Performance**: Efficient re-rendering with proper key props
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Reusability**: Component is designed to be reusable across the application
5. **Consistency**: Follows existing code patterns and conventions
