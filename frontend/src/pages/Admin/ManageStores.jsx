import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit, Trash2, Search, Star, Users } from 'lucide-react';
import { storeAPI, userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [searchTerm]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { name: searchTerm })
      };
      
      const response = await storeAPI.getAllStores(params);
      setStores(response.data.data.stores);
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await userAPI.getAllUsers({ role: 'store_owner', limit: 100 });
      setStoreOwners(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch store owners');
    }
  };

  const handleCreateStore = async () => {
    if (!storeForm.name || !storeForm.email || !storeForm.address || !storeForm.owner_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await storeAPI.createStore(storeForm);
      toast.success('Store created successfully!');
      setShowCreateModal(false);
      setStoreForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create store';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStore = async () => {
    setSubmitting(true);
    try {
      await storeAPI.updateStore(selectedStore.id, {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address
      });
      toast.success('Store updated successfully!');
      setShowEditModal(false);
      setSelectedStore(null);
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update store';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${storeName}?`)) return;

    try {
      await storeAPI.deleteStore(storeId);
      toast.success('Store deactivated successfully');
      fetchStores();
    } catch (error) {
      toast.error('Failed to deactivate store');
    }
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setStoreForm({
      name: store.name,
      email: store.email,
      address: store.address
    });
    setShowEditModal(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Stores</h1>
        <p className="text-gray-600 mt-2">Create, edit, and manage store listings</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stores by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Store
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading stores..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(store)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store.id, store.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{store.address}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {renderStars(Math.round(store.average_rating))}
                    <span className="ml-2 text-sm text-gray-600">
                      {parseFloat(store.average_rating).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {store.total_ratings} reviews
                  </div>
                </div>

                {store.owner && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="text-sm font-medium text-gray-900">{store.owner.name}</p>
                    <p className="text-xs text-gray-600">{store.owner.email}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {stores.length === 0 && !loading && (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new store.'}
          </p>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Store</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Store name (5-60 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Store email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Complete store address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner</label>
                <select
                  value={storeForm.owner_id}
                  onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStore}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? <LoadingSpinner size="sm" text="" /> : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Store</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStore}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? <LoadingSpinner size="sm" text="" /> : 'Update Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStores;