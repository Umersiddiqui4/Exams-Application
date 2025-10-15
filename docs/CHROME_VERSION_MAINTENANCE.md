# Chrome Version Maintenance Guide

This document explains how to maintain the Chrome browser version requirements for the Exams Application.

## Overview

The application restricts candidates to use only Google Chrome browser and specifically the latest 3 versions for security and compatibility reasons.

## Current Configuration

- **Supported Versions**: 131, 130, 129
- **Last Updated**: 2024-01-15
- **Update Frequency**: Monthly

## How to Update Chrome Versions

### 1. Check Latest Chrome Versions

Visit the [Chrome Release Calendar](https://www.chromium.org/developers/calendar) to see the latest stable releases.

### 2. Update Configuration

Edit the file: `src/lib/chromeVersionUpdater.ts`

```typescript
export const CHROME_VERSION_CONFIG: ChromeVersionConfig = {
  latestVersions: ['132', '131', '130'], // Update these versions
  lastUpdated: '2024-02-15', // Update this date
  updateFrequency: 'monthly'
};
```

### 3. Test the Changes

1. Build the application: `npm run build`
2. Test with different Chrome versions
3. Verify the restriction screen displays correctly for unsupported browsers

## Files Involved

- `src/lib/browserDetection.ts` - Core browser detection logic
- `src/lib/chromeVersionUpdater.ts` - Version configuration
- `src/components/BrowserRestriction.tsx` - User interface for restrictions
- `src/components/BrowserCompatibilityWrapper.tsx` - Wrapper component
- `src/main.tsx` - Application entry point
- `src/auth/ProtectedRoute.tsx` - Additional protection for authenticated routes

## Browser Detection Logic

The system:

1. **Detects Chrome**: Checks if the browser is Chrome (not Edge, Opera, etc.)
2. **Extracts Version**: Parses the Chrome version from the user agent string
3. **Validates Version**: Ensures the version is within the latest 3 supported versions
4. **Shows Restriction**: Displays a user-friendly error message if requirements aren't met

## Security Benefits

- **Prevents Cheating**: Ensures all candidates use the same browser environment
- **Consistent Experience**: Eliminates browser-specific issues
- **Security Features**: Latest Chrome versions have the most up-to-date security patches
- **Compatibility**: Ensures all features work as expected

## User Experience

When a user accesses the application with an unsupported browser:

1. They see a clear error message explaining the requirements
2. They get specific instructions on how to resolve the issue
3. They can download Chrome directly from the provided link
4. They can refresh the page after updating their browser

## Monitoring

Consider implementing:

- Analytics to track browser usage
- Alerts when new Chrome versions are released
- Automated testing for different Chrome versions

## Troubleshooting

### Common Issues

1. **False Positives**: If legitimate Chrome users are blocked, check the user agent parsing logic
2. **Version Detection**: Ensure the version extraction regex is working correctly
3. **UI Issues**: Verify the restriction screen displays properly on different screen sizes

### Testing

Test the following scenarios:

- Latest Chrome version (should work)
- Older Chrome versions (should be blocked)
- Non-Chrome browsers (should be blocked)
- Mobile Chrome (should be blocked if not supported)
- Chrome with modified user agent (should be handled appropriately)

## Future Enhancements

Consider adding:

- Support for Chrome mobile versions
- More granular version checking
- Integration with Chrome's release API
- Automated version updates
- Browser extension detection
- Incognito mode detection
