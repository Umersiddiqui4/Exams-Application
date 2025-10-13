// src/components/EmailVerificationTest.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { verifyEmail } from "@/api/authApi";
import { useToast } from './ui/use-toast';

export function EmailVerificationTest() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testVerification = async () => {
    if (!token.trim()) {
      toast({
        title: 'Token Required',
        description: 'Please enter a verification token.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('Testing verification with token:', token);
      const response = await verifyEmail(token.trim());
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Email Verification Successful!',
          description: response.message,
          duration: 5000,
        });
        
        // Check if password reset is required
        if (response.data?.requiresPasswordReset) {
          toast({
            title: 'Password Reset Required',
            description: 'You may need to set up a new password.',
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Verification Failed',
          description: response.message || 'Email verification was not successful.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Test verification error:', error);
      setResult({ error: error.message, stack: error.stack });
      
      toast({
        title: 'API Call Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Email Verification API Test</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Verification Token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification token from email link"
              className="font-mono text-sm"
            />
          </div>
          
          <Button 
            onClick={testVerification}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Verification API'}
          </Button>

          {result && (
            <div className="space-y-2">
              <Label>Result:</Label>
              {result.error ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                  <p className="text-red-700 text-sm">{result.error}</p>
                  {result.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-red-600 mt-1 overflow-auto">{result.stack}</pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Verification Successful' : 'Verification Failed'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Message:</strong> <span className={result.success ? 'text-green-700' : 'text-red-700'}>{result.message}</span>
                    </div>
                    <div>
                      <strong>Status Code:</strong> <span className="font-mono">{result.statusCode}</span>
                    </div>
                    
                    {result.data && (
                      <div>
                        <strong>Data:</strong>
                        <div className="ml-4 mt-1">
                          <div>Success: <span className={result.data.success ? 'text-green-600' : 'text-red-600'}>{result.data.success.toString()}</span></div>
                          {result.data.requiresPasswordReset !== undefined && (
                            <div>Requires Password Reset: <span className={result.data.requiresPasswordReset ? 'text-orange-600' : 'text-gray-600'}>{result.data.requiresPasswordReset.toString()}</span></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <details className="mt-3">
                    <summary className="text-xs text-gray-600 cursor-pointer">Full Response JSON</summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-48 bg-white p-2 rounded border">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
