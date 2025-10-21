import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw, Chrome } from 'lucide-react';
import { BrowserInfo, getLatestChromeVersions } from '@/lib/browserDetection';

interface BrowserRestrictionProps {
  browserInfo: BrowserInfo;
}

export const BrowserRestriction: React.FC<BrowserRestrictionProps> = ({ browserInfo }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDownloadChrome = () => {
    window.open('https://www.google.com/chrome/', '_blank');
  };

  const latestVersions = getLatestChromeVersions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Chrome className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Browser Compatibility Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            This exam application requires specific browser requirements for optimal performance and security.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Current Browser:</strong> {browserInfo.name} {browserInfo.version}
              <br />
              <strong>Issue:</strong> {browserInfo.errorMessage}
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Requirements:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Must use Google Chrome browser</li>
              <li>• Must use one of the latest 3 Chrome versions</li>
              <li>• Currently supported versions: {latestVersions.join(', ')}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">What you can do:</h3>

            {!browserInfo.isChrome ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  You're currently using {browserInfo.name}. Please download and install Google Chrome.
                </p>
                <Button
                  onClick={handleDownloadChrome}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Google Chrome
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  Your Chrome version ({browserInfo.version}) is outdated. Please update to the latest version.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadChrome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Update Chrome
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-1">Why these restrictions?</h4>
            <p className="text-yellow-700 text-sm">
              These browser requirements ensure the exam runs smoothly with proper security features,
              preventing cheating attempts and providing a consistent experience for all candidates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
