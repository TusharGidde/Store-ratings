import React, { useState, useEffect } from 'react';
import { Star, Store, Users, MessageSquare, Plus, Edit, LogOut } from 'lucide-react';
import { storeAPI, ratingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '' });
  const [submittingStore, setSubmittingStore] = useState(false);

  useEffect(() => {
    fetchMyStore();
  }, []);

  const fetchMyStore = async () => {
    try {
      const response = await storeAPI.getMyStore();
      if (response.data.data.store) {
        setStore(response.data.data.store);
        fetchStoreRatings(response.data.data.store.id);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch store data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      const response = await ratingAPI.getStoreRatings(storeId);
      setRatings(response.data.data.ratings);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const handleCreateStore = () => {
    setStoreForm({ name: '', email: '', address: '' });
    setShowStoreModal(true);
  };

  const handleEditStore = () => {
    setStoreForm({
      name: store.name,
      email: store.email,
      address: store.address
    });
    setShowStoreModal(true);
  };

  const submitStore = async () => {
    if (!storeForm.name || !storeForm.email || !storeForm.address) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingStore(true);
    try {
      if (store) {
        await storeAPI.updateStore(store.id, storeForm);
        toast.success('Store updated successfully!');
      } else {
        await storeAPI.createStore(storeForm);
        toast.success('Store created successfully!');
      }
      
      setShowStoreModal(false);
      fetchMyStore();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save store';
      toast.error(message);
    } finally {
      setSubmittingStore(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your store..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!store ? (
          // No Store Created Yet
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No store created</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first store.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateStore}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Store
              </button>
            </div>
          </div>
        ) : (
          // Store Exists
          <div className="space-y-6">
            {/* Store Info Card */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {store.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{store.email}</p>
                    <p className="mt-1 text-sm text-gray-500">{store.address}</p>
                  </div>
                  <button
                    onClick={handleEditStore}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Rating
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {parseFloat(store.average_rating).toFixed(1)} / 5.0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Reviews
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {store.total_ratings}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Reviews with Comments
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {ratings.filter(r => r.comment).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Reviews
                </h3>
                
                {ratings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {renderStars(rating.rating)}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                by {rating.User?.name || 'Anonymous'}
                              </span>
                              <span className="ml-2 text-sm text-gray-400">
                                {new Date(rating.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 text-sm">{rating.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {store ? 'Edit Store' : 'Create Store'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter store name (5-60 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter store email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete store address"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowStoreModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitStore}
                disabled={submittingStore}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingStore ? <LoadingSpinner size="sm" text="" /> : (store ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;