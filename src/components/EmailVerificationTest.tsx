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
      
      toast({
        title: 'API Call Successful',
        description: 'Check the result below and browser console for details.',
        duration: 5000,
      });
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
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
