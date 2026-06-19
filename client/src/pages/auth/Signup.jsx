import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { User, Lock, Mail, MapPin, Store, Check } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [validationHints, setValidationHints] = useState({
    nameMin: false,
    nameMax: false,
    emailValid: false,
    addressMax: false,
    passLength: false,
    passUpper: false,
    passSpecial: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Compute live validation rules
  useEffect(() => {
    const { name, email, address, password } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const upperCaseRegex = /[A-Z]/;

    setValidationHints({
      nameMin: name.trim().length >= 20,
      nameMax: name.trim().length <= 60 && name.trim().length > 0,
      emailValid: emailRegex.test(email),
      addressMax: address.trim().length > 0 && address.trim().length <= 400,
      passLength: password.length >= 8 && password.length <= 16,
      passUpper: upperCaseRegex.test(password),
      passSpecial: specialCharRegex.test(password),
    });
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};
    const { name, email, address, password } = formData;

    if (!name.trim()) {
      errors.name = 'Name is required.';
    } else if (name.trim().length < 20 || name.trim().length > 60) {
      errors.name = 'Name must be between 20 and 60 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!address.trim()) {
      errors.address = 'Address is required.';
    } else if (address.trim().length > 400) {
      errors.address = 'Address cannot exceed 400 characters.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else {
      if (password.length < 8 || password.length > 16) {
        errors.password = 'Password must be between 8 and 16 characters.';
      }
      if (!/[A-Z]/.test(password)) {
        errors.password = (errors.password || '') + ' Must contain at least one uppercase letter.';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.password = (errors.password || '') + ' Must contain at least one special character.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the validation errors first.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.address
    );
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      navigate('/login');
    } else {
      toast.error(result.message);
      // Map API array validation errors if returned
      if (result.errors) {
        const errorsMap = {};
        result.errors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFormErrors(errorsMap);
      }
    }
  };

  const renderHint = (isValid, text) => (
    <div className="flex items-center space-x-2 text-xs">
      {isValid ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
      )}
      <span className={isValid ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>{text}</span>
    </div>
  );

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg glass-panel p-8 md:p-10 animate-fade-in shadow-lg">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-brand-500 via-brand-650 to-pink-500 p-3 rounded-2xl text-white shadow-md shadow-brand-500/10 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Register as a Normal User</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Alexander Hamilton Junior (min 20 chars)"
                className="w-full glass-input !pl-12"
              />
            </div>
            {/* Live Hints */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {renderHint(validationHints.nameMin, 'At least 20 characters')}
              {renderHint(validationHints.nameMax, 'Maximum 60 characters')}
            </div>
            {formErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full glass-input !pl-12"
              />
            </div>
            <div className="mt-1">
              {renderHint(validationHints.emailValid, 'Valid email format')}
            </div>
            {formErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.email}</p>}
          </div>

          {/* Address */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address (max 400 chars)"
                className="w-full py-3 glass-input resize-none !pl-12"
              />
            </div>
            <div className="mt-1">
              {renderHint(validationHints.addressMax, 'Within 400 characters')}
            </div>
            {formErrors.address && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.address}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-650">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full glass-input !pl-12"
              />
            </div>
            {/* Live Hints */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {renderHint(validationHints.passLength, '8–16 characters')}
              {renderHint(validationHints.passUpper, '1+ uppercase letter')}
              {renderHint(validationHints.passSpecial, '1+ special character')}
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex justify-center items-center py-3.5 mt-4 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-550">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-650 hover:text-brand-500 font-semibold transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
