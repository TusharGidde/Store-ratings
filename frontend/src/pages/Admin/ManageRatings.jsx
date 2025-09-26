import React, { useState, useEffect } from 'react';
import { Star, Trash2, Search, Filter, MessageSquare, User, Store } from 'lucide-react';
import { ratingAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0
  });

  useEffect(() => {
    fetchRatings();
  }, [pagination.currentPage, ratingFilter]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...(ratingFilter && { rating_filter: ratingFilter })
      };
      
      const response = await ratingAPI.getAllRatings(params);
      setRatings(response.data.data.ratings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId, userName, storeName) => {
    if (!window.confirm(`Are you sure you want to delete the rating by ${userName} for ${storeName}?`)) return;

    try {
      await ratingAPI.deleteRating(ratingId);
      toast.success('Rating deleted successfully');
      fetchRatings();
    } catch (error) {
      toast.error('Failed to delete rating');
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

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Ratings</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all store ratings and reviews</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Total Ratings: {pagination.totalRatings}
          </div>
        </div>
      </div>

      {/* Ratings List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading ratings..." />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Rating Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {renderStars(rating.rating)}
                          <span className={`ml-2 font-semibold ${getRatingColor(rating.rating)}`}>
                            {rating.rating}/5
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRating(
                          rating.id, 
                          rating.user?.name || 'Unknown User',
                          rating.store?.name || 'Unknown Store'
                        )}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* User and Store Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rating.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rating.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Store className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rating.store?.name || 'Unknown Store'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg: {rating.store?.average_rating ? parseFloat(rating.store.average_rating).toFixed(1) : 'N/A'} 
                            ({rating.store?.total_ratings || 0} reviews)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {rating.comment && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{rating.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {ratings.length === 0 && !loading && (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {ratingFilter ? 'Try adjusting your filter settings.' : 'No ratings have been submitted yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageRatings;