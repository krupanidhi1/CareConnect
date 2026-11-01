import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi, tokenStore, isApiConfigured } from '@/api/careconnect';

/**
 * CareConnect authentication.
 *
 * The Express + MongoDB backend is the single source of truth for users, roles
 * and sessions. The access token is stored in localStorage and sent as a
 * Bearer header; the refresh token lives in an httpOnly cookie set by the
 * backend and is sent automatically because the API client uses
 * `withCredentials: true`.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    if (!isApiConfigured()) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    try {
      // Access tokens remain in memory. On a fresh page load, the HTTP-only
      // refresh cookie is used to obtain a new short-lived access token.
      if (!tokenStore.get()) {
        const refreshed = await authApi.refresh();
        const token = refreshed?.accessToken || refreshed?.token;
        if (!token) throw new Error("Your session has expired. Please log in again.");
        tokenStore.set(token);
      }
      const currentUser = await authApi.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      tokenStore.clear();
      setUser(null);
      setIsAuthenticated(false);
      if (error?.code === "BACKEND_NOT_CONNECTED") setAuthError(error.message);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  // The API client dispatches this when a silent refresh-token attempt fails.
  useEffect(() => {
    const handleExpired = () => {
      tokenStore.clear();
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    };
    window.addEventListener('careconnect:session-expired', handleExpired);
    return () => window.removeEventListener('careconnect:session-expired', handleExpired);
  }, []);

  const logout = useCallback(async (shouldRedirect = true) => {
    try {
      if (isApiConfigured()) await authApi.logout();
    } catch {
      /* best-effort: clear locally regardless of the server response */
    }
    tokenStore.clear();
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    if (shouldRedirect) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnTo=${returnTo}`;
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?returnTo=${returnTo}`;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};