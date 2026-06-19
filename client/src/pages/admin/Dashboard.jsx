import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api.js';
import toast from 'react-hot-toast';
import { Users, Store, Star, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load system stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Registered Users',
      value: stats.totalUsers,
      icon: <Users className="w-7 h-7 text-indigo-600" />,
      link: '/admin/users',
      linkLabel: 'Manage Users',
      bgGrad: 'from-indigo-50/70 to-indigo-100/30 border-indigo-100',
      textStyle: 'text-indigo-900',
    },
    {
      title: 'Total Active Stores',
      value: stats.totalStores,
      icon: <Store className="w-7 h-7 text-purple-650" />,
      link: '/admin/stores',
      linkLabel: 'Manage Stores',
      bgGrad: 'from-purple-50/70 to-purple-100/30 border-purple-100',
      textStyle: 'text-purple-900',
    },
    {
      title: 'Total Ratings Submitted',
      value: stats.totalRatings,
      icon: <Star className="w-7 h-7 text-amber-500 fill-amber-500/25" />,
      link: '/admin/stores',
      linkLabel: 'View Average Ratings',
      bgGrad: 'from-amber-50/70 to-amber-100/30 border-amber-100',
      textStyle: 'text-amber-900',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-brand-500" />
            System Administration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Overview of store platform metrics and management controls.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 text-sm shadow-sm">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>System Status: <span className="text-emerald-500 font-bold">Online</span></span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`glass-panel p-6 flex flex-col justify-between h-48 bg-gradient-to-br border ${card.bgGrad} shadow-sm shadow-slate-100`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">{card.title}</p>
                <p className={`text-4xl font-extrabold mt-2 tracking-tight ${card.textStyle}`}>{card.value}</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                {card.icon}
              </div>
            </div>
            <Link
              to={card.link}
              className="flex items-center space-x-2 text-sm font-bold text-brand-500 hover:text-brand-700 transition-colors w-fit group"
            >
              <span>{card.linkLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>

      {/* Admin Actions panel */}
      <div className="glass-panel p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Administrative Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="p-5 bg-slate-50/50 border border-slate-200 hover:border-brand-500/35 hover:bg-white rounded-2xl flex items-start space-x-4 transition-all duration-350 shadow-sm hover:shadow-md group"
          >
            <div className="bg-brand-500/10 p-3 rounded-xl text-brand-500 group-hover:bg-brand-500/20 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 group-hover:text-brand-500 transition-colors">Add & Manage Accounts</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Create System Admins, Normal Users, or Store Owners. Review or filter detailed list.</p>
            </div>
          </Link>

          <Link
            to="/admin/stores"
            className="p-5 bg-slate-50/50 border border-slate-200 hover:border-brand-650/35 hover:bg-white rounded-2xl flex items-start space-x-4 transition-all duration-350 shadow-sm hover:shadow-md group"
          >
            <div className="bg-brand-650/10 p-3 rounded-xl text-brand-650 group-hover:bg-brand-650/20 transition-colors">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 group-hover:text-brand-650 transition-colors">Add & Link Stores</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Create new store locations and assign/link existing Store Owners to them.</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
