import React, { useState, useEffect } from 'react';
import { Users, Store, Star, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { userAPI, storeAPI, ratingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
    activeUsers: 0,
    recentActivity: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, storesRes, ratingsRes] = await Promise.all([
        userAPI.getAllUsers(),
        storeAPI.getAllStores(),
        ratingAPI.getAllRatings()
      ]);

      const users = usersRes.data.data.users;
      const stores = storesRes.data.data.stores;
      const ratings = ratingsRes.data.data.ratings;

      // Calculate stats
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

      const activeUsers = users.filter(u => u.is_active).length;

      // Recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentRatings = ratings.filter(r => new Date(r.createdAt) > weekAgo);

      setStats({
        totalUsers: users.length,
        totalStores: stores.length,
        totalRatings,
        averageRating: averageRating.toFixed(1),
        activeUsers,
        recentActivity: recentRatings.length
      });

      // Top stores
      setTopStores(stores
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5)
      );

      // Recent activity
      setRecentActivity(ratings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
      );

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600">{stats.activeUsers} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ratings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRatings}</p>
              <p className="text-xs text-gray-500">Avg: {stats.averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              <p className="text-xs text-gray-500">new ratings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Rated Stores */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Rated Stores</h3>
            <p className="text-sm text-gray-500">Best performing stores on the platform</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topStores.map((store, index) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-sm text-gray-500">{store.total_ratings} reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(Math.round(store.average_rating))}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {parseFloat(store.average_rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest ratings and reviews</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((rating) => (
                <div key={rating.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{rating.User?.name}</span> rated{' '}
                      <span className="font-medium">{rating.Store?.name}</span>
                    </p>
                    <div className="flex items-center mt-1">
                      {renderStars(rating.rating)}
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{rating.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">View and manage all users</p>
            </div>
          </button>
          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Store className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Stores</p>
              <p className="text-sm text-gray-500">Oversee all store listings</p>
            </div>
          </button>
          <button className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <Star className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Ratings</p>
              <p className="text-sm text-gray-500">Monitor all ratings and reviews</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;