import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set the auth token for all axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token validity
          const res = await axios.get('/api/auth/verify');
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || 'An error occurred');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};