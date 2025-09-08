import React, { useEffect, useState } from 'react';
import { BrowserInfo, detectBrowser } from '../lib/browserDetection';
import { BrowserRestriction } from './BrowserRestriction';

interface BrowserCompatibilityWrapperProps {
  children: React.ReactNode;
}

export const BrowserCompatibilityWrapper: React.FC<BrowserCompatibilityWrapperProps> = ({ children }) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Perform browser detection
    const detectedBrowser = detectBrowser();
    setBrowserInfo(detectedBrowser);
    setIsChecking(false);

    // Optional: Log browser info for debugging
    console.log('Browser Detection Result:', detectedBrowser);
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking browser compatibility...</p>
        </div>
      </div>
    );
  }

  // If browser is not supported, show restriction screen
  if (browserInfo && !browserInfo.isSupported) {
    return <BrowserRestriction browserInfo={browserInfo} />;
  }

  // If browser is supported, render the children
  return <>{children}</>;
};
