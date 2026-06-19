import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in local storage on load
    const token = localStorage.getItem('store_token');
    const savedUser = localStorage.getItem('store_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('store_token', token);
      localStorage.setItem('store_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const signup = async (name, email, password, address) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, address });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('store_token');
      localStorage.removeItem('store_user');
      setUser(null);
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/update-password', { oldPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password.';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updatePassword,
    isAuthenticated: !!user,
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
