import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md glass-panel p-8 md:p-10 animate-fade-in flex flex-col items-center">
        <div className="bg-red-950/40 p-4 rounded-2xl border border-red-950 text-red-400 mb-6 shadow-lg shadow-red-500/5">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-slate-400 mb-8 max-w-sm">
          You do not have the required permissions to view this page. If you believe this is an error, please check your account role.
        </p>
        <Link to="/" className="btn-primary w-full flex items-center justify-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
