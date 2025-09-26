import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Star, Users, Calendar, MessageSquare } from 'lucide-react';
import { storeAPI, ratingAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratingTrend: 0,
    recentRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    monthlyStats: [],
    topReviews: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch store data
      const storeResponse = await storeAPI.getMyStore();
      const storeData = storeResponse.data.data.store;
      setStore(storeData);

      // Fetch all ratings for this store
      const ratingsResponse = await ratingAPI.getStoreRatings(storeData.id, { limit: 100 });
      const ratingsData = ratingsResponse.data.data.ratings;
      setRatings(ratingsData);

      // Calculate analytics
      calculateAnalytics(storeData, ratingsData);
      
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (storeData, ratingsData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent ratings (last 7 days)
    const recentRatings = ratingsData.filter(r => new Date(r.created_at) > sevenDaysAgo);
    
    // Previous period ratings (7-14 days ago)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousPeriodRatings = ratingsData.filter(r => {
      const date = new Date(r.created_at);
      return date > fourteenDaysAgo && date <= sevenDaysAgo;
    });

    // Calculate trend
    const ratingTrend = recentRatings.length - previousPeriodRatings.length;

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingsData.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthRatings = ratingsData.filter(r => {
        const date = new Date(r.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      const avgRating = monthRatings.length > 0 
        ? monthRatings.reduce((sum, r) => sum + r.rating, 0) / monthRatings.length 
        : 0;

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthRatings.length,
        averageRating: avgRating
      });
    }

    // Top reviews (highest rated with comments)
    const topReviews = ratingsData
      .filter(r => r.comment && r.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    setAnalytics({
      totalRatings: ratingsData.length,
      averageRating: storeData.average_rating,
      ratingTrend,
      recentRatings: recentRatings.length,
      ratingDistribution,
      monthlyStats,
      topReviews
    });
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
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No store found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to create a store first to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Analytics</h1>
        <p className="text-gray-600 mt-2">Insights and performance metrics for {store.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRatings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(analytics.averageRating).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 mr-2">{analytics.recentRatings}</p>
                {analytics.ratingTrend !== 0 && (
                  <div className={`flex items-center ${analytics.ratingTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.ratingTrend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm ml-1">{Math.abs(analytics.ratingTrend)}</span>
                  </div>
                )}
              </div>
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
                {ratings.filter(r => r.comment).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = analytics.ratingDistribution[stars];
              const percentage = analytics.totalRatings > 0 ? (count / analytics.totalRatings) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm text-gray-600 mr-2">{stars}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-4">
            {analytics.monthlyStats.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{month.month}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center mr-4">
                      {renderStars(Math.round(month.averageRating))}
                      <span className="ml-1 text-sm text-gray-600">
                        {month.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{month.count} reviews</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Reviews</h3>
          <p className="text-sm text-gray-500">Your highest-rated reviews with comments</p>
        </div>
        <div className="p-6">
          {analytics.topReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews with comments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Encourage customers to leave detailed reviews to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {analytics.topReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;