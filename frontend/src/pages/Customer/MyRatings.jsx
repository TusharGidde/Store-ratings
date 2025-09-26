import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit, MapPin, Calendar } from 'lucide-react';
import { ratingAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0
  });

  useEffect(() => {
    fetchMyRatings();
  }, [pagination.currentPage]);

  const fetchMyRatings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10
      };
      
      const response = await ratingAPI.getMyRatings(params);
      setRatings(response.data.data.ratings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch your ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId, storeName) => {
    if (!window.confirm(`Are you sure you want to delete your rating for ${storeName}?`)) return;

    try {
      await ratingAPI.deleteRating(ratingId);
      toast.success('Rating deleted successfully');
      fetchMyRatings();
    } catch (error) {
      toast.error('Failed to delete rating');
    }
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

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Ratings & Reviews</h1>
        <p className="text-gray-600 mt-2">Manage all your store ratings and reviews</p>
      </div>

      {/* Stats */}
      {!loading && ratings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pagination.totalRatings}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{getAverageRating()}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {ratings.filter(r => r.comment).length}
              </div>
              <div className="text-sm text-gray-600">With Comments</div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading your ratings..." />
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start rating stores to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Store Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {rating.store?.name || 'Unknown Store'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {rating.store?.address || 'No address available'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Rated on {new Date(rating.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteRating(rating.id, rating.store?.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete rating"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        {renderStars(rating.rating)}
                      </div>
                      <span className={`text-lg font-semibold ${getRatingColor(rating.rating)}`}>
                        {rating.rating}/5
                      </span>
                    </div>

                    {/* Comment */}
                    {rating.comment && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{rating.comment}</p>
                      </div>
                    )}

                    {/* Store Stats */}
                    {rating.store && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            Store Average: {rating.store.average_rating ? parseFloat(rating.store.average_rating).toFixed(1) : 'N/A'}/5
                          </div>
                          <div>
                            {rating.store.total_ratings || 0} total reviews
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
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
    </div>
  );
};

export default MyRatings;