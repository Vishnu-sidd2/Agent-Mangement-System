import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Animation for the login form
    gsap.from('.login-container', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });
    
    gsap.from('.login-title', {
      y: -20,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'back.out'
    });
    
    gsap.from('.form-control', {
      x: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.2,
      delay: 0.5,
      ease: 'power1.out'
    });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="login-container w-full max-w-md rounded-xl bg-gray-800/80 p-8 shadow-xl backdrop-blur-sm">
        <h2 className="login-title mb-8 text-center text-3xl font-bold text-white">Admin Login</h2>
        
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/20 p-3 text-red-300">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>
          
          <div className="form-control mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="form-control w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-center font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-800 disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;