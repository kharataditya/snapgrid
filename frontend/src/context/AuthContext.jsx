import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        // Backend might return user object directly or nested in user/data
        const currentUser = data?.user || data?.data || data;
        if (isMounted) {
          if (currentUser && (currentUser.id || currentUser._id || currentUser.user_id || currentUser.username)) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const loggedInUser = data?.user || data?.data || data;
    if (data?.token) {
      sessionStorage.setItem('snapgrid_token', data.token);
      localStorage.setItem('snapgrid_token', data.token);
      sessionStorage.setItem('snapgrid_user', JSON.stringify(loggedInUser));
    }
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const newUser = data?.user || data?.data || data;
    if (data?.token) {
      sessionStorage.setItem('snapgrid_token', data.token);
      localStorage.setItem('snapgrid_token', data.token);
      sessionStorage.setItem('snapgrid_user', JSON.stringify(newUser));
    }
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem('snapgrid_token');
      sessionStorage.removeItem('snapgrid_user');
      localStorage.removeItem('snapgrid_token');
      setUser(null);
    }
  };

  const switchUser = async (email, password = 'password123') => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const loggedInUser = data?.user || data?.data || data;
      if (data?.token) {
        sessionStorage.setItem('snapgrid_token', data.token);
        localStorage.setItem('snapgrid_token', data.token);
        sessionStorage.setItem('snapgrid_user', JSON.stringify(loggedInUser));
      }
      setUser(loggedInUser);
      // Dispatch an event so any page (e.g. Feed, Profile) immediately refetches
      window.dispatchEvent(new CustomEvent('snapgrid:user_switched', { detail: loggedInUser }));
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    switchUser,
    updateUser,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
