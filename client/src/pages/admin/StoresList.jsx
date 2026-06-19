import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import toast from 'react-hot-toast';
import { 
  Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Store, 
  MapPin, Star, RefreshCw 
} from 'lucide-react';

export default function AdminStoresList() {
  // Lists and Pagination
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [limit] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');

  // Modals state
  const [addStoreModalOpen, setAddStoreModalOpen] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Add Store Form State
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingStore, setSubmittingStore] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });

      if (filterName) params.append('name', filterName);
      if (filterEmail) params.append('email', filterEmail);
      if (filterAddress) params.append('address', filterAddress);

      const response = await api.get(`/admin/stores?${params.toString()}`);
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

  const fetchOwners = async () => {
    setLoadingOwners(true);
    try {
      // Fetch users with role STORE_OWNER
      const response = await api.get('/admin/users?role=STORE_OWNER&limit=100');
      if (response.data.success) {
        setStoreOwners(response.data.data.users);
      }
    } catch (error) {
      toast.error('Failed to load store owners list.');
    } finally {
      setLoadingOwners(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, sortBy, order]);

  useEffect(() => {
    if (addStoreModalOpen) {
      fetchOwners();
    }
  }, [addStoreModalOpen]);

  const handleFilterSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterAddress('');
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

  // Add Store Validation & Submit
  const handleAddStoreChange = (e) => {
    setNewStore({ ...newStore, [e.target.name]: e.target.value });
  };

  const validateNewStoreForm = () => {
    const errs = {};
    const { name, email, address } = newStore;

    if (!name.trim()) {
      errs.name = 'Store name is required.';
    } else if (name.trim().length < 20 || name.trim().length > 60) {
      errs.name = 'Store name must be between 20 and 60 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Store email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!address.trim()) {
      errs.address = 'Store address is required.';
    } else if (address.trim().length > 400) {
      errs.address = 'Store address cannot exceed 400 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    if (!validateNewStoreForm()) return;

    setSubmittingStore(true);
    try {
      const payload = {
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        ownerId: newStore.ownerId || null,
      };

      const response = await api.post('/admin/stores', payload);
      if (response.data.success) {
        toast.success(response.data.message);
        setAddStoreModalOpen(false);
        // Reset form
        setNewStore({
          name: '',
          email: '',
          address: '',
          ownerId: '',
        });
        setFormErrors({});
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create store.');
      if (error.response?.data?.errors) {
        const errorMap = {};
        error.response.data.errors.forEach((err) => {
          errorMap[err.field] = err.message;
        });
        setFormErrors(errorMap);
      }
    } finally {
      setSubmittingStore(false);
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy === field) {
      return <span className="ml-1 text-brand-650 text-xs">{order === 'asc' ? '▲' : '▼'}</span>;
    }
    return <ArrowUpDown className="ml-1 w-3.5 h-3.5 opacity-55" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Store className="w-8 h-8 text-brand-500" />
            Registered Stores
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Displaying {totalStores} active stores in the platform database.
          </p>
        </div>
        <button
          onClick={() => setAddStoreModalOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Filters Card */}
      <form onSubmit={handleFilterSearch} className="glass-panel p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Filter Stores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="glass-input text-sm py-2"
          />
          <input
            type="text"
            placeholder="Search by Email"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="glass-input text-sm py-2"
          />
          <input
            type="text"
            placeholder="Search by Address"
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            className="glass-input text-sm py-2"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-secondary py-2 text-sm"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="btn-primary py-2 text-sm flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Stores Table */}
      <div className="glass-panel overflow-hidden border border-slate-100 shadow-sm shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th 
                  onClick={() => toggleSort('name')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Name {renderSortIndicator('name')}
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('email')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Email {renderSortIndicator('email')}
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
                    Average Rating {renderSortIndicator('rating')}
                  </div>
                </th>
                <th className="px-6 py-4">Store Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Loading stores...</span>
                    </div>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No stores found matching the query.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-[200px]">{store.name}</td>
                    <td className="px-6 py-4 text-slate-650 truncate max-w-[200px]">{store.email}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[250px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800">{store.averageRating}</span>
                        <span className="text-xs text-slate-500">({store.totalRatings} ratings)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">
                      {store.owner ? (
                        <div>
                          <div className="font-semibold text-slate-750">{store.owner.name}</div>
                          <div className="text-xs text-slate-500">{store.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Owner Assigned</span>
                      )}
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

      {/* Modal: Add Store */}
      {addStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md glass-panel p-6 relative animate-fade-in">
            <button
              onClick={() => setAddStoreModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-brand-500" />
              Create Store Location
            </h2>

            <form onSubmit={handleAddStoreSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Store Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStore.name}
                  onChange={handleAddStoreChange}
                  placeholder="E.g., Premium Gourmet Supermarket (min 20 chars)"
                  className="glass-input text-sm py-2"
                />
                {formErrors.name && <p className="text-red-500 text-2xs">{formErrors.name}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Store Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStore.email}
                  onChange={handleAddStoreChange}
                  placeholder="store@example.com"
                  className="glass-input text-sm py-2"
                />
                {formErrors.email && <p className="text-red-500 text-2xs">{formErrors.email}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Store Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={newStore.address}
                  onChange={handleAddStoreChange}
                  placeholder="Street Address, City, Country (max 400 chars)"
                  className="glass-input text-sm py-2 resize-none"
                />
                {formErrors.address && <p className="text-red-500 text-2xs">{formErrors.address}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Link Store Owner (Optional)</label>
                <select
                  name="ownerId"
                  value={newStore.ownerId}
                  onChange={handleAddStoreChange}
                  className="glass-input text-sm py-2 appearance-none bg-white px-8"
                  disabled={loadingOwners}
                >
                  <option value="">-- Select Store Owner (No Owner Linked) --</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {loadingOwners && <p className="text-slate-500 text-2xs">Loading owners list...</p>}
              </div>

              <button
                type="submit"
                disabled={submittingStore}
                className="w-full btn-primary py-2.5 mt-4 text-sm cursor-pointer"
              >
                {submittingStore ? 'Creating...' : 'Create Store'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
