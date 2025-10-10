// src/ProtectedRoute.tsx
import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { detectBrowser } from '../lib/browserDetection';
import { redirectToLoginIfUnauthenticated } from "../lib/apiClient";
import { logout } from "../redux/Slice";
import { BrowserRestriction } from '../components/BrowserRestriction';
import { RootState } from '../redux/rootReducer';
import { logger } from '../lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use RootState to access the state properly
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const hasToken = useMemo(() => {
    try {
      return Boolean(localStorage.getItem("auth_token"));
    } catch (error) {
      logger.warn('Failed to check token in localStorage', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasToken) {
      try {
        dispatch(logout());
      } catch (error) {
        logger.warn('Failed to dispatch logout', error);
      }
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
