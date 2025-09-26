import React, { useState, useEffect } from 'react';
import { Store, Edit, Save, X, MapPin, Mail, Calendar, Star, Users } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyStore = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchMyStore();
  }, []);

  const fetchMyStore = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getMyStore();
      const storeData = response.data.data.store;
      setStore(storeData);
      setStoreForm({
        name: storeData.name,
        email: storeData.email,
        address: storeData.address
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch store data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!storeForm.name || !storeForm.email || !storeForm.address) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await storeAPI.createStore({
        ...storeForm,
        owner_id: user.id
      });
      toast.success('Store created successfully!');
      fetchMyStore();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create store';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!storeForm.name || !storeForm.email || !storeForm.address) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await storeAPI.updateStore(store.id, storeForm);
      toast.success('Store updated successfully!');
      setEditing(false);
      fetchMyStore();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update store';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setStoreForm({
      name: store.name,
      email: store.email,
      address: store.address
    });
    setEditing(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your store..." />
      </div>
    );
  }

  // No store exists - show create form
  if (!store) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Store className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Store</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Set up your store profile to start receiving customers and reviews. 
            This information will be visible to all users browsing stores.
          </p>

          <div className="bg-white rounded-lg shadow max-w-md mx-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your store name (5-60 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Store contact email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Complete store address with city and postal code"
                />
              </div>
            </div>

            <button
              onClick={handleCreateStore}
              disabled={submitting}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitting ? <LoadingSpinner size="sm" text="" /> : 'Create Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Store exists - show store details
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
        <p className="text-gray-600 mt-2">Manage your store information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Store Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Store Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateStore}
                    disabled={submitting}
                    className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{store.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{store.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {editing ? (
                    <textarea
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <p className="text-gray-900">{store.address}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Created</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{new Date(store.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Stats */}
        <div className="space-y-6">
          {/* Rating Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Overview</h3>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {parseFloat(store.average_rating).toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.round(store.average_rating))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {store.total_ratings} reviews
              </p>
            </div>

            {store.rating_distribution && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = store.rating_distribution[stars] || 0;
                  const percentage = store.total_ratings > 0 ? (count / store.total_ratings) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center text-sm">
                      <span className="w-8 text-gray-600">{stars}★</span>
                      <div className="flex-1 mx-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Reviews</span>
                </div>
                <span className="font-semibold text-gray-900">{store.total_ratings}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Average Rating</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {parseFloat(store.average_rating).toFixed(1)}/5.0
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Store Status</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  store.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStore;