// src/components/EmailVerification.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { verifyEmail } from "@/api/authApi";
import { useToast } from '@/components/ui/use-toast';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid-token';

export function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isResending] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        // Extract token from URL hash parameter
        const token = searchParams.get('hash');

        if (!token) {
          setVerificationState('invalid-token');
          setVerificationMessage('No verification token found in the URL. Please check your email and click the verification link again.');
          return;
        }

        // Call the verification API
        const response = await verifyEmail(token);

        if (response.success) {
          setVerificationState('success');
          setVerificationMessage(response.message || 'Your email has been successfully verified!');

          // Check if password reset is required
          if (response.data?.requiresPasswordReset) {
            setVerificationMessage(
              response.message + ' You may need to set up a new password when you log in.'
            );
          }

          // Show success toast
          toast({
            title: 'Email Verified!',
            description: 'Your email address has been successfully verified. You can now log in to your account.',
            duration: 5000,
          });
        } else {
          setVerificationState('error');
          setVerificationMessage(response.message || 'Email verification failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);

        setVerificationState('error');

        // Handle specific error cases
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setVerificationMessage('This verification link has expired or is invalid. Please request a new verification email.');
        } else if (error.message.includes('404')) {
          setVerificationMessage('Verification link not found. Please check your email and try again.');
        } else if (error.message.includes('400')) {
          setVerificationMessage('Invalid verification token. Please check your email and try again.');
        } else if (error.message.includes('CORS') || error.message.includes('Network')) {
          setVerificationMessage('Network error. Please check your internet connection and try again.');
        } else {
          setVerificationMessage(`An error occurred during email verification: ${error.message}. Please try again or contact support.`);
        }
      }
    };

    verifyEmailToken();
  }, [searchParams, toast]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = async () => {
    toast({
      title: 'Email Required',
      description: 'Please sign up again to receive a new verification email.',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className='w-full flex justify-center items-center mb-4'>
            <img src="/logo.png" className='items-center' alt="Logo" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationState === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            </div>
          )}

          {verificationState === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-gray-600 mb-2">
                  {verificationMessage}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleGoToLogin}
                  className="w-full"
                >
                  Continue to Login
                </Button>
                <Link
                  to="/"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {verificationState === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-4">
                  {verificationMessage}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sign Up Again
                    </>
                  )}
                </Button>
                <Link
                  to="/login"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {verificationState === 'invalid-token' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Invalid Verification Link
                </h2>
                <p className="text-gray-600 mb-4">
                  {verificationMessage}
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="block w-full"
                >
                  <Button className="w-full">
                    Sign Up Again
                  </Button>
                </Link>
                <Link
                  to="/login"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
