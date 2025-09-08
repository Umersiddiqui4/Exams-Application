// Utility for updating Chrome version requirements
// This can be used to easily update the supported Chrome versions

export interface ChromeVersionConfig {
  latestVersions: string[];
  lastUpdated: string;
  updateFrequency: 'monthly' | 'quarterly' | 'manual';
}

/**
 * Configuration for supported Chrome versions
 * Update this when new Chrome versions are released
 */
export const CHROME_VERSION_CONFIG: ChromeVersionConfig = {
  latestVersions: ['131', '130', '129'], // Update these when new versions are released
  lastUpdated: '2024-01-15', // Update this date when you update versions
  updateFrequency: 'monthly'
};

/**
 * Get the minimum supported Chrome version
 */
export const getMinimumSupportedVersion = (): string => {
  return CHROME_VERSION_CONFIG.latestVersions[CHROME_VERSION_CONFIG.latestVersions.length - 1];
};

/**
 * Get the latest Chrome version
 */
export const getLatestChromeVersion = (): string => {
  return CHROME_VERSION_CONFIG.latestVersions[0];
};

/**
 * Check if a version update is needed based on the update frequency
 */
export const isVersionUpdateNeeded = (): boolean => {
  const lastUpdated = new Date(CHROME_VERSION_CONFIG.lastUpdated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (CHROME_VERSION_CONFIG.updateFrequency) {
    case 'monthly':
      return daysSinceUpdate >= 30;
    case 'quarterly':
      return daysSinceUpdate >= 90;
    case 'manual':
    default:
      return false;
  }
};

/**
 * Instructions for updating Chrome versions
 */
export const getUpdateInstructions = (): string => {
  return `
To update Chrome version requirements:

1. Check the latest Chrome versions at: https://www.chromium.org/developers/calendar
2. Update the 'latestVersions' array in CHROME_VERSION_CONFIG
3. Update the 'lastUpdated' date
4. Test the application with different Chrome versions
5. Deploy the updated configuration

Current supported versions: ${CHROME_VERSION_CONFIG.latestVersions.join(', ')}
Last updated: ${CHROME_VERSION_CONFIG.lastUpdated}
  `.trim();
};
