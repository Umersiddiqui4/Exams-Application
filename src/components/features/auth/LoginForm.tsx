// src/components/LoginForm.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { loginRequest, loginSuccess, loginFailure, clearError } from '@/redux/Slice';
import { loginWithEmailPassword, forgotPassword } from "@/api/authApi";
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { RootState } from '@/redux/rootReducer';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Access the authentication state
  const { isAuthenticated, error, loading, errorType } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect if already authenticated
    }
  }, [isAuthenticated, navigate]);

  // Show toast notification when there's an authentication error
  useEffect(() => {
    if (error && errorType) {
      let toastTitle = 'Login Failed';
      let toastDescription = error;
      const toastVariant: 'default' | 'destructive' = 'destructive';

      switch (errorType) {
        case 'invalid_username':
          toastTitle = 'Invalid Username';
          toastDescription = 'The username you entered is incorrect. Please check and try again.';
          break;
        case 'invalid_password':
          toastTitle = 'Invalid Password';
          toastDescription = 'The password you entered is incorrect. Please check and try again.';
          break;
        case 'general':
        default:
          toastTitle = 'Login Failed';
          toastDescription = error;
          break;
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant,
      });

      // Clear the error after showing the toast
      dispatch(clearError());
    }
  }, [error, errorType, toast, dispatch]);

  if (isAuthenticated) {
    return null; // Ab yahan return null karoge render ke level par
  }
  // If the user is already authenticated, redirect them

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    dispatch(clearError());

    // Start loading
    dispatch(loginRequest());
    try {
      const res = await loginWithEmailPassword(email, password);
      const accessToken = res.data.tokens.access.token;
      const refreshToken = res.data.tokens.refresh.token;
      localStorage.setItem("auth_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      dispatch(loginSuccess({ name: `${res.data.user.firstName} ${res.data.user.lastName}`, email: res.data.user.email }));
      toast({ title: 'Login Successful', description: `Welcome back, ${res.data.user.firstName}!` });
      navigate("/");
    } catch (err: any) {
      dispatch(loginFailure({ message: 'Invalid email or password', type: 'general' }));
    }
  };

  const handleForgotPasswordClick = () => {
    // Pre-fill with the email from the login form if available
    if (email) {
      setForgotPasswordEmail(email);
    }
    setShowForgotPasswordDialog(true);
  };

  const handleSendResetEmail = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingResetEmail(true);
    try {
      await forgotPassword(forgotPasswordEmail);
      toast({
        title: 'Success',
        description: 'Password reset link has been sent to your email',
      });
      setShowForgotPasswordDialog(false);
      setForgotPasswordEmail('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>

          <div className='w-full flex justify-center items-center'>
            <img src="/logo.png" className='items-center' alt="error" />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full transition-all duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="text-center text-sm text-gray-600 mb-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            Sign up here
          </Link>
        </div>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForgotPasswordDialog(false)}
              disabled={isSendingResetEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendResetEmail}
              disabled={isSendingResetEmail}
              className="transition-all duration-200 hover:bg-blue-600"
            >
              {isSendingResetEmail ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
