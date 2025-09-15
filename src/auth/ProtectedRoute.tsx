// src/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { detectBrowser } from '../lib/browserDetection';
import { redirectToLoginIfUnauthenticated } from "../lib/apiClient";
import { BrowserRestriction } from '../components/BrowserRestriction';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use RootState to access the state properly
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) redirectToLoginIfUnauthenticated();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Additional browser check for authenticated users
  // This provides an extra layer of security for exam sessions
  const browserInfo = detectBrowser();
  if (!browserInfo.isSupported) {
    return <BrowserRestriction browserInfo={browserInfo} />;
  }

  return <>{children}</>;
};
