import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Store, Users, LogOut, Key, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Determine paths and links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: <Store className="w-5 h-5" /> },
          { name: 'Users List', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
          { name: 'Stores List', path: '/admin/stores', icon: <Store className="w-5 h-5" /> },
        ];
      case 'NORMAL_USER':
        return [
          { name: 'Stores', path: '/user/stores', icon: <Store className="w-5 h-5" /> },
        ];
      case 'STORE_OWNER':
        return [
          { name: 'My Store', path: '/owner/dashboard', icon: <Store className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  const getRoleLabel = () => {
    switch (user.role) {
      case 'SYSTEM_ADMIN': return 'Admin';
      case 'NORMAL_USER': return 'User';
      case 'STORE_OWNER': return 'Owner';
      default: return '';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3.5 shadow-sm shadow-slate-100/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 text-slate-800">
          <div className="bg-gradient-to-r from-brand-500 via-brand-650 to-pink-500 p-2.5 rounded-xl text-white shadow-md shadow-brand-500/10">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-650 to-brand-500 bg-clip-text text-transparent">
            StoreRating
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-brand-500/10 text-brand-600 border border-brand-500/10 font-semibold'
                  : 'text-slate-650 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* User Dropdown */}
        <div className="hidden md:flex items-center space-x-4 relative">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{user.name}</div>
            <div className="text-xs text-brand-600 font-bold uppercase tracking-wider">{getRoleLabel()}</div>
          </div>
          
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 top-14 w-52 glass-panel p-2 z-20 animate-fade-in">
                <Link
                  to="/update-password"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Key className="w-4 h-4 text-slate-400" />
                  <span>Update Password</span>
                </Link>
                <hr className="border-slate-100 my-1" />
                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-slate-55 border border-slate-200 p-2 rounded-xl text-slate-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100 animate-fade-in">
          <div className="flex flex-col space-y-1.5">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-500/10 text-brand-600 font-semibold'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            <hr className="border-slate-100 my-2" />

            <div className="px-4 py-1.5">
              <div className="text-sm font-bold text-slate-800">{user.name}</div>
              <div className="text-xs text-brand-600 font-bold uppercase tracking-wider">{getRoleLabel()}</div>
            </div>

            <Link
              to="/update-password"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-50"
            >
              <Key className="w-5 h-5 text-slate-400" />
              <span>Update Password</span>
            </Link>

            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:text-red-650 hover:bg-red-50 text-left w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
