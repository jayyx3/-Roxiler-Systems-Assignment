import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import toast from 'react-hot-toast';
import RatingStars from '../../components/RatingStars.jsx';
import { 
  Search, ArrowUpDown, ChevronLeft, ChevronRight, Store, 
  MapPin, Star, RefreshCw 
} from 'lucide-react';

export default function UserStoresList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('both'); // name | address | both
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [totalStores, setTotalStores] = useState(0);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });

      if (search.trim()) {
        params.append('search', search.trim());
        params.append('searchBy', searchBy);
      }

      const response = await api.get(`/stores?${params.toString()}`);
      if (response.data.success) {
        setStores(response.data.data.stores);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalStores(response.data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to load stores list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchBy('both');
    setPage(1);
    setTimeout(() => fetchStores(), 0);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
    setPage(1);
  };

  const handleRateStore = async (storeId, newRating) => {
    try {
      const response = await api.post(`/stores/${storeId}/ratings`, { rating: newRating });
      if (response.data.success) {
        toast.success(response.data.message);
        
        // Update store in frontend state immediately
        const { overallRating, totalRatings, rating } = response.data.data;
        setStores(prevStores => 
          prevStores.map(store => {
            if (store.id === storeId) {
              return {
                ...store,
                overallRating,
                totalRatings,
                userSubmittedRating: rating,
              };
            }
            return store;
          })
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating.');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy === field) {
      return <span className="ml-1 text-brand-600 text-xs">{order === 'asc' ? '▲' : '▼'}</span>;
    }
    return <ArrowUpDown className="ml-1 w-3.5 h-3.5 opacity-55" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Store className="w-8 h-8 text-brand-500" />
          Browse & Rate Stores
        </h1>
        <p className="text-slate-550 text-sm mt-1">
          Explore stores, read ratings, and share your feedback inline.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-6">
        <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-4">Search & Filter</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 glass-input py-2 text-sm"
            />
          </div>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="glass-input text-sm py-2 appearance-none bg-white px-8"
          >
            <option value="both">Search in Name & Address</option>
            <option value="name">Search in Name Only</option>
            <option value="address">Search in Address Only</option>
          </select>
          <div className="flex space-x-3 md:self-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-secondary py-2 text-sm"
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn-primary py-2 text-sm flex items-center space-x-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Stores List */}
      <div className="glass-panel overflow-hidden border border-slate-100 shadow-sm shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 text-xs font-bold uppercase tracking-wider">
                <th 
                  onClick={() => toggleSort('name')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Store Name {renderSortIndicator('name')}
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('address')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Address {renderSortIndicator('address')}
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('rating')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Overall Rating {renderSortIndicator('rating')}
                  </div>
                </th>
                <th className="px-6 py-4">Your Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Loading stores...</span>
                    </div>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No stores found matching your search.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-850 truncate max-w-[200px]">{store.name}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[300px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800">{store.overallRating}</span>
                        <span className="text-xs text-slate-500">({store.totalRatings} ratings)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <RatingStars 
                          rating={store.userSubmittedRating || 0} 
                          onRatingChange={(newRating) => handleRateStore(store.id, newRating)}
                        />
                        <span className="text-2xs text-slate-500">
                          {store.userSubmittedRating 
                            ? `You rated: ${store.userSubmittedRating}★` 
                            : 'Not rated yet'
                          }
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-150 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 p-1.5 rounded-lg text-slate-500 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 p-1.5 rounded-lg text-slate-500 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
