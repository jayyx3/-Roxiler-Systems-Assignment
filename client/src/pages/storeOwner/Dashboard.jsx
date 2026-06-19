import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import toast from 'react-hot-toast';
import { Store, Star, Users, MapPin, Calendar, RefreshCw } from 'lucide-react';

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/store-owner/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Store not found for owner
          setDashboardData({ storeName: null });
        } else {
          toast.error('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  // Edge case: No store linked to owner account
  if (!dashboardData || !dashboardData.storeName) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="w-full max-w-md glass-panel p-8 md:p-10 animate-fade-in flex flex-col items-center">
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-400 mb-6">
            <Store className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">No Linked Store Found</h1>
          <p className="text-sm text-slate-550 max-w-sm">
            There is currently no store associated with your owner account. Please contact a system administrator to link a store to your profile.
          </p>
        </div>
      </div>
    );
  }

  const { storeName, storeEmail, storeAddress, averageRating, totalRatings, raters } = dashboardData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Store Header Info */}
      <div className="glass-panel p-6 md:p-8 bg-gradient-to-r from-brand-50/40 via-slate-50/60 to-slate-50 border border-slate-250 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-600">
            <Store className="w-3.5 h-3.5" />
            <span>Store Owner Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{storeName}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 text-sm text-slate-550 mt-1">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4 text-slate-450" />
              {storeAddress}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="truncate">{storeEmail}</span>
          </div>
        </div>

        {/* Big Rating Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center space-x-6 min-w-[240px] md:self-stretch justify-center shadow-sm">
          <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
            <Star className="w-10 h-10 fill-amber-500/20" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
              <span>{averageRating}</span>
              <span className="text-sm text-slate-400 font-bold">/ 5</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Average Rating</p>
            <p className="text-2xs text-slate-400 mt-0.5">({totalRatings} ratings total)</p>
          </div>
        </div>
      </div>

      {/* Raters Table Panel */}
      <div className="glass-panel p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-slate-450" />
          <h2 className="text-xl font-bold text-slate-800">Customer Reviews & Ratings</h2>
        </div>

        {raters.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-500 text-sm">No Ratings Yet</h3>
            <p className="text-xs text-slate-400 mt-1">When users rate your store, their reviews will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Submitted Rating</th>
                    <th className="px-6 py-4">Date Rated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {raters.map((rater, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-[200px]">{rater.userName}</td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{rater.userEmail}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < rater.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                              }`} 
                            />
                          ))}
                          <span className="ml-1.5 font-bold text-slate-800 text-xs">{rater.rating}★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 truncate">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(rater.ratedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
