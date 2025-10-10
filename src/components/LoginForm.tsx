// src/components/LoginForm.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, Lock } from 'lucide-react';
import { loginRequest, loginSuccess, loginFailure, clearError } from '../redux/Slice';
import { loginWithEmailPassword } from "@/api/authApi";
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/use-toast';
import { RootState } from '../redux/rootReducer';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      let toastVariant: 'default' | 'destructive' = 'destructive';

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
      dispatch(loginFailure({ message:'Invalid email or password', type: 'general' }));
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
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
      </Card>
    </div>
  );
}
