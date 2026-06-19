import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import toast from 'react-hot-toast';
import { 
  Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, UserPlus, Info, 
  MapPin, Shield, Star, RefreshCw 
} from 'lucide-react';

export default function AdminUsersList() {
  // Lists and Pagination
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Modals state
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingUser, setSubmittingUser] = useState(false);

  const fetchUsers = async () => {
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
      if (filterRole) params.append('role', filterRole);

      const response = await api.get(`/admin/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, order]);

  const handleFilterSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterAddress('');
    setFilterRole('');
    setPage(1);
    setTimeout(() => fetchUsers(), 0);
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

  // User details fetching
  const handleViewDetail = async (userId) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data.success) {
        setSelectedUserDetail(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load user details.');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Add User Validation & Submit
  const handleAddUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const validateNewUserForm = () => {
    const errs = {};
    const { name, email, password, address } = newUser;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

    if (!name.trim()) {
      errs.name = 'Name is required.';
    } else if (name.trim().length < 20 || name.trim().length > 60) {
      errs.name = 'Name must be between 20 and 60 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!address.trim()) {
      errs.address = 'Address is required.';
    } else if (address.trim().length > 400) {
      errs.address = 'Address cannot exceed 400 characters.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (!passwordRegex.test(password)) {
      errs.password = 'Password must be 8–16 characters, containing 1+ uppercase and 1+ special character.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateNewUserForm()) return;

    setSubmittingUser(true);
    try {
      const response = await api.post('/admin/users', newUser);
      if (response.data.success) {
        toast.success(response.data.message);
        setAddUserModalOpen(false);
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'NORMAL_USER',
        });
        setFormErrors({});
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user.');
      if (error.response?.data?.errors) {
        const errorMap = {};
        error.response.data.errors.forEach((err) => {
          errorMap[err.field] = err.message;
        });
        setFormErrors(errorMap);
      }
    } finally {
      setSubmittingUser(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-brand-500" />
            User Accounts
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Displaying {totalUsers} registered users in the database.
          </p>
        </div>
        <button
          onClick={() => setAddUserModalOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters Card */}
      <form onSubmit={handleFilterSearch} className="glass-panel p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Filter Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="glass-input text-sm py-2 appearance-none bg-white px-8"
          >
            <option value="">All Roles</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
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

      {/* Users Table */}
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
                  onClick={() => toggleSort('role')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center">
                    Role {renderSortIndicator('role')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No users found matching the query.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-[200px]">{user.name}</td>
                    <td className="px-6 py-4 text-slate-650 truncate max-w-[200px]">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[300px]">{user.address}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'SYSTEM_ADMIN' ? 'bg-red-50 text-red-650 border border-red-100' :
                        user.role === 'STORE_OWNER' ? 'bg-indigo-50 text-indigo-650 border border-indigo-100' :
                        'bg-brand-50 text-brand-600 border border-brand-100'
                      }`}>
                        {user.role === 'SYSTEM_ADMIN' ? 'Admin' :
                         user.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetail(user.id)}
                        className="bg-slate-105 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 ml-auto cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Info</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
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

      {/* Modal 1: Add User */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md glass-panel p-6 relative animate-fade-in">
            <button
              onClick={() => setAddUserModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-brand-500" />
              Create Account
            </h2>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Account Role</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleAddUserChange}
                  className="glass-input text-sm py-2 appearance-none bg-white px-8"
                >
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleAddUserChange}
                  placeholder="E.g., Store Owner Number One (min 20 chars)"
                  className="glass-input text-sm py-2"
                />
                {formErrors.name && <p className="text-red-500 text-2xs">{formErrors.name}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleAddUserChange}
                  placeholder="name@example.com"
                  className="glass-input text-sm py-2"
                />
                {formErrors.email && <p className="text-red-500 text-2xs">{formErrors.email}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={newUser.address}
                  onChange={handleAddUserChange}
                  placeholder="Street Address, Town, State (max 400 chars)"
                  className="glass-input text-sm py-2 resize-none"
                />
                {formErrors.address && <p className="text-red-500 text-2xs">{formErrors.address}</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-650">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleAddUserChange}
                  placeholder="••••••••••••"
                  className="glass-input text-sm py-2"
                />
                {formErrors.password && <p className="text-red-500 text-2xs leading-snug">{formErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={submittingUser}
                className="w-full btn-primary py-2.5 mt-4 text-sm cursor-pointer"
              >
                {submittingUser ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: User Detail Info */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 relative animate-fade-in">
            <button
              onClick={() => { setDetailModalOpen(false); setSelectedUserDetail(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-800 mb-6">User Detailed Profile</h2>

            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm mt-3 text-slate-500">Fetching user data...</span>
              </div>
            ) : selectedUserDetail ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="bg-brand-500/10 p-2.5 rounded-xl text-brand-500">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{selectedUserDetail.name}</h3>
                    <p className="text-xs text-brand-650 font-bold uppercase tracking-wider">{selectedUserDetail.role}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-2xs tracking-wider">Email Address</span>
                    <span className="text-slate-700">{selectedUserDetail.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-2xs tracking-wider">Address</span>
                    <span className="text-slate-700 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      {selectedUserDetail.address}
                    </span>
                  </div>
                </div>

                {selectedUserDetail.role === 'STORE_OWNER' && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Linked Store Performance</h4>
                    {selectedUserDetail.stores && selectedUserDetail.stores.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-indigo-950">{selectedUserDetail.stores[0].name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selectedUserDetail.stores[0].address}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-slate-850">
                            {selectedUserDetail.averageRating} / 5
                          </span>
                          <span className="text-xs text-slate-500">
                            ({selectedUserDetail.totalRatings} ratings submitted)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No stores linked to this owner account yet.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">Could not load details.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
