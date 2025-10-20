// src/components/SignupForm.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { User, Lock, Mail, Phone, UserPlus, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { signupRequest, signupSuccess, signupFailure, clearError } from '../redux/Slice';
import { signupWithEmail, SignupRequest, resendConfirmationEmail } from "@/api/authApi";
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ui/use-toast';
import { RootState } from '../redux/rootReducer';

export function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '' as string | undefined
  });
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Show toast notification when there's a signup error
  useEffect(() => {
    if (error && errorType) {
      let toastTitle = 'Signup Failed';
      let toastDescription = error;
      const toastVariant: 'default' | 'destructive' = 'destructive';

      switch (errorType) {
        case 'email_exists':
          toastTitle = 'Email Already Exists';
          toastDescription = 'An account with this email address already exists. Please try logging in instead.';
          break;
        case 'validation_error':
          toastTitle = 'Validation Error';
          toastDescription = 'Please check your input and try again.';
          break;
        case 'general':
        default:
          toastTitle = 'Signup Failed';
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
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const validatePhoneNumber = (phone: string | undefined) => {
    if (!phone || !phone.trim()) return true; // Phone is optional
    // PhoneInput component already validates international format
    return true;
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      dispatch(signupFailure({ message: 'First name is required', type: 'validation_error' }));
      return false;
    }
    if (!formData.lastName.trim()) {
      dispatch(signupFailure({ message: 'Last name is required', type: 'validation_error' }));
      return false;
    }
    if (!formData.email.trim()) {
      dispatch(signupFailure({ message: 'Email is required', type: 'validation_error' }));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      dispatch(signupFailure({ message: 'Please enter a valid email address', type: 'validation_error' }));
      return false;
    }
    if (!validatePhoneNumber(formData.phone)) {
      dispatch(signupFailure({ message: 'Please enter a valid phone number', type: 'validation_error' }));
      return false;
    }
    if (!formData.password) {
      dispatch(signupFailure({ message: 'Password is required', type: 'validation_error' }));
      return false;
    }
    if (formData.password.length < 6) {
      dispatch(signupFailure({ message: 'Password must be at least 6 characters long', type: 'validation_error' }));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      dispatch(signupFailure({ message: 'Passwords do not match', type: 'validation_error' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    dispatch(clearError());
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Start loading
    dispatch(signupRequest());
    
    try {
      const signupData: SignupRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.phone && formData.phone.trim() && { phone: formData.phone.trim() })
      };

      const res: any = await signupWithEmail(signupData);
      console.log("Signup response:", res);
      
      // Signup successful - redirect to login page
      dispatch(signupSuccess({ 
        name: `${res.data.firstName} ${res.data.lastName}`, 
        email: res.data.email 
      }));
      
      toast({ 
        title: 'Signup Successful!', 
        description: `Welcome, ${res.data.firstName}! Please check your email to verify your account before logging in.`,
        duration: 8000 // Longer duration for important message
      });
      
      // Navigate to login page
      navigate("/login");
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Failed to create account. Please try again.';
      let errorType = 'general';
      
      if (err.message.includes('409') || err.message.includes('email')) {
        errorMessage = 'An account with this email already exists.';
        errorType = 'email_exists';
      } else if (err.message.includes('400')) {
        errorMessage = 'Please check your input and try again.';
        errorType = 'validation_error';
      }
      
      dispatch(signupFailure({ message: errorMessage, type: errorType }));
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address first.',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await resendConfirmationEmail(formData.email.trim());
      
      if (response.success) {
        toast({
          title: 'Verification Email Sent',
          description: response.message || 'A new verification email has been sent to your email address.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Failed to Resend',
          description: response.message || 'Failed to resend verification email. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className='w-full flex justify-center items-center mb-4'>
            <img src="/logo.png" className='items-center' alt="Logo" />
          </div>
        
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number (Optional)
              </Label>
              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                defaultCountry="PK"
                international
                countryCallingCodeEditable={false}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Select your country and enter your phone number
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full transition-all duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
            <div className="text-center text-sm text-gray-600 space-y-2">
              <div>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </div>
              <div>
                Didn't receive verification email?{' '}
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || !formData.email.trim()}
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
