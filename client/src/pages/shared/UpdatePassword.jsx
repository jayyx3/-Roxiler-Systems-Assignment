import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Lock, Check, Key } from 'lucide-react';

export default function UpdatePassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

    if (!oldPassword) {
      newErrors.oldPassword = 'Current password is required.';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = 'Password must be 8-16 characters, and contain at least one uppercase letter and one special character.';
    }

    if (newPassword === oldPassword) {
      newErrors.newPassword = 'New password cannot be the same as current password.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await updatePassword(oldPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      // Redirect home, auth handles checking destination
      navigate('/');
    } else {
      toast.error(result.message);
      if (result.errors) {
        const errorMap = {};
        result.errors.forEach((err) => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-panel p-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-xl shadow-brand-500/20 mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Change Password</h2>
          <p className="text-sm text-slate-400 mt-1">Keep your account secure by updating your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current password"
                className="w-full glass-input py-2.5 text-sm !pl-11"
              />
            </div>
            {errors.oldPassword && <p className="text-red-400 text-xs mt-1">{errors.oldPassword}</p>}
          </div>

          {/* New Password */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (8-16 chars, 1 uppercase, 1 special)"
                className="w-full glass-input py-2.5 text-sm !pl-11"
              />
            </div>
            {errors.newPassword && <p className="text-red-400 text-xs mt-1 leading-relaxed">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full glass-input py-2.5 text-sm !pl-11"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Password requirements list */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password Requirements:</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center space-x-2 text-xs text-slate-400">
                <Check className="w-3.5 h-3.5 text-brand-400" />
                <span>Must be between 8 and 16 characters</span>
              </li>
              <li className="flex items-center space-x-2 text-xs text-slate-400">
                <Check className="w-3.5 h-3.5 text-brand-400" />
                <span>Must include at least one uppercase letter (A-Z)</span>
              </li>
              <li className="flex items-center space-x-2 text-xs text-slate-400">
                <Check className="w-3.5 h-3.5 text-brand-400" />
                <span>Must include at least one special character (!@#$%...)</span>
              </li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex justify-center items-center py-3 text-sm mt-3"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
