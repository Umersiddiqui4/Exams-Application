// Browser detection and validation utilities

export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
  isSupported: boolean;
  errorMessage?: string;
}

import { CHROME_VERSION_CONFIG } from './chromeVersionUpdater';

/**
 * Get the latest 3 Chrome versions from Chrome's release history
 * This should be updated periodically to reflect the current latest versions
 */
export const getLatestChromeVersions = (): string[] => {
  return CHROME_VERSION_CONFIG.latestVersions;
};

/**
 * Parse Chrome version from user agent string
 */
export const parseChromeVersion = (userAgent: string): string | null => {
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  return chromeMatch ? chromeMatch[1] : null;
};

/**
 * Compare version strings (e.g., "131" vs "130")
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareVersions = (v1: string, v2: string): number => {
  const num1 = parseInt(v1, 10);
  const num2 = parseInt(v2, 10);
  
  if (num1 > num2) return 1;
  if (num1 < num2) return -1;
  return 0;
};

/**
 * Check if Chrome version is supported (within latest 3 versions)
 */
export const isChromeVersionSupported = (version: string): boolean => {
  const latestVersions = getLatestChromeVersions();
  const minSupportedVersion = latestVersions[latestVersions.length - 1]; // Last version in array
  
  return compareVersions(version, minSupportedVersion) >= 0;
};

/**
 * Detect browser information and validate Chrome requirements
 */
export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  
  // Check if it's Chrome
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent) && !/OPR/.test(userAgent);
  
  if (!isChrome) {
    return {
      name: 'Unknown',
      version: '0',
      isChrome: false,
      isSupported: false,
      errorMessage: 'This application requires Google Chrome browser. Please use Chrome to access the application.'
    };
  }
  
  // Get Chrome version
  const version = parseChromeVersion(userAgent);
  
  if (!version) {
    return {
      name: 'Chrome',
      version: 'Unknown',
      isChrome: true,
      isSupported: false,
      errorMessage: 'Unable to detect Chrome version. Please update your Chrome browser.'
    };
  }
  
  // Check if version is supported
  const isSupported = isChromeVersionSupported(version);
  
  if (!isSupported) {
    const latestVersions = getLatestChromeVersions();
    return {
      name: 'Chrome',
      version,
      isChrome: true,
      isSupported: false,
      errorMessage: `Your Chrome version (${version}) is not supported. Please update to one of the latest 3 versions: ${latestVersions.join(', ')}.`
    };
  }
  
  return {
    name: 'Chrome',
    version,
    isChrome: true,
    isSupported: true
  };
};

/**
 * Hook to get browser information
 */
export const useBrowserDetection = (): BrowserInfo => {
  return detectBrowser();
};
