import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Lock, Mail, Store } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      
      // Redirect based on role
      const role = result.user.role;
      if (role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'NORMAL_USER') {
        navigate('/user/stores');
      } else if (role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel p-8 md:p-10 animate-fade-in shadow-lg">
        
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-brand-500 via-brand-650 to-pink-500 p-3 rounded-2xl text-white shadow-md shadow-brand-500/10 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage and rate stores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input !pl-12"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input !pl-12"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex justify-center items-center py-3.5 mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-550">
          New here?{' '}
          <Link to="/signup" className="text-brand-650 hover:text-brand-500 font-semibold transition-colors">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
