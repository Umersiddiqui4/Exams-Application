// src/ProtectedRoute.tsx
import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { detectBrowser } from '../lib/browserDetection';
import { redirectToLoginIfUnauthenticated } from "../lib/apiClient";
import { logout } from "../redux/Slice";
import { BrowserRestriction } from '../components/BrowserRestriction';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use RootState to access the state properly
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const hasToken = useMemo(() => {
    try {
      return Boolean(localStorage.getItem("auth_token"));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasToken) {
      try { dispatch(logout()); } catch {}
      redirectToLoginIfUnauthenticated();
    }
  }, [isAuthenticated, hasToken, dispatch]);

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Additional browser check for authenticated users
  // This provides an extra layer of security for exam sessions
  const browserInfo = detectBrowser();
  if (!browserInfo.isSupported) {
    return <BrowserRestriction browserInfo={browserInfo} />;
  }

  return <>{children}</>;
};
