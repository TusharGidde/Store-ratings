import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, MessageSquare, Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storeAPI, ratingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    recentRatings: 0,
    ratingTrend: 0
  });
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const storeRes = await storeAPI.getMyStore();
      if (storeRes.data.data.store) {
        const storeData = storeRes.data.data.store;
        setStore(storeData);

        // Fetch ratings for this store
        const ratingsRes = await ratingAPI.getStoreRatings(storeData.id);
        const ratings = ratingsRes.data.data.ratings;
        setRecentRatings(ratings.slice(0, 5));

        // Calculate recent ratings (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentCount = ratings.filter(r => new Date(r.createdAt) > weekAgo).length;

        setStats({
          averageRating: storeData.average_rating,
          totalRatings: storeData.total_ratings,
          recentRatings: recentCount,
          ratingTrend: recentCount > 0 ? '+' + recentCount : 0
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch store data');
      }
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Create Your Store</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your store profile to start receiving ratings and reviews.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/my-store')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Store Info Card */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
              <p className="text-gray-600">{store.email}</p>
              <p className="text-gray-500 mt-1">{store.address}</p>
            </div>
            <button
              onClick={() => navigate('/my-store')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Store
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRatings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentRatings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Comments</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentRatings.filter(r => r.comment).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
            <p className="text-sm text-gray-500">Latest customer feedback</p>
          </div>
          <div className="p-6">
            {recentRatings.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">Reviews will appear here once customers rate your store</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRatings.map((rating) => (
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

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Rating Distribution</h3>
            <p className="text-sm text-gray-500">How customers rate your store</p>
          </div>
          <div className="p-6">
            {recentRatings.length === 0 ? (
              <div className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
                <p className="mt-1 text-sm text-gray-500">Rating distribution will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = recentRatings.filter(r => r.rating === stars).length;
                  const percentage = recentRatings.length > 0 ? (count / recentRatings.length) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center">
                      <div className="flex items-center w-20">
                        <span className="text-sm text-gray-600 mr-2">{stars}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;