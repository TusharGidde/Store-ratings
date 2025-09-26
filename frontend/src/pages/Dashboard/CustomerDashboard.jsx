import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, MapPin, Clock } from 'lucide-react';
import { storeAPI, ratingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStores: 0,
    myRatings: 0,
    averageRating: 0
  });
  const [recentStores, setRecentStores] = useState([]);
  const [myRecentRatings, setMyRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [storesRes, ratingsRes] = await Promise.all([
        storeAPI.getAllStores(),
        ratingAPI.getMyRatings()
      ]);

      const stores = storesRes.data.data.stores;
      const ratings = ratingsRes.data.data.ratings;

      setStats({
        totalStores: stores.length,
        myRatings: ratings.length,
        averageRating: ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
          : 0
      });

      // Get top rated stores
      setRecentStores(stores
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 6)
      );

      // Get recent ratings
      setMyRecentRatings(ratings.slice(0, 5));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Stores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Ratings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myRatings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Rated Stores */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Rated Stores</h3>
            <p className="text-sm text-gray-500">Discover the best stores in your area</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{store.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{store.address}</p>
                    <div className="flex items-center mt-1">
                      {renderStars(Math.round(store.average_rating))}
                      <span className="ml-2 text-sm text-gray-600">
                        {parseFloat(store.average_rating).toFixed(1)} ({store.total_ratings} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Recent Ratings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Recent Ratings</h3>
            <p className="text-sm text-gray-500">Your latest store reviews</p>
          </div>
          <div className="p-6">
            {myRecentRatings.length === 0 ? (
              <div className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start rating stores to see them here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRecentRatings.map((rating) => (
                  <div key={rating.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{rating.Store?.name}</h4>
                        <div className="flex items-center">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-gray-600 mt-1">{rating.comment}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <MapPin className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Browse All Stores</p>
              <p className="text-sm text-gray-500">Discover new places to visit</p>
            </div>
          </button>
          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Star className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View My Ratings</p>
              <p className="text-sm text-gray-500">See all your reviews</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;