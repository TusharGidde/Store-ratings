import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Filter, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { storeAPI, ratingAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0
  });

  useEffect(() => {
    fetchStoreAndReviews();
  }, [pagination.currentPage, ratingFilter, sortBy, sortOrder]);

  const fetchStoreAndReviews = async () => {
    try {
      setLoading(true);
      
      // First get store info
      const storeResponse = await storeAPI.getMyStore();
      const storeData = storeResponse.data.data.store;
      setStore(storeData);

      // Then get reviews for this store
      const params = {
        page: pagination.currentPage,
        limit: 10,
        sortBy,
        sortOrder,
        ...(ratingFilter && { rating_filter: ratingFilter })
      };
      
      const reviewsResponse = await ratingAPI.getStoreRatings(storeData.id, params);
      setReviews(reviewsResponse.data.data.ratings);
      setPagination(reviewsResponse.data.data.pagination);
      
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch reviews');
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

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadgeColor = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getReviewSentiment = (rating) => {
    if (rating >= 4) return { icon: ThumbsUp, color: 'text-green-500', label: 'Positive' };
    if (rating >= 3) return { icon: MessageSquare, color: 'text-yellow-500', label: 'Neutral' };
    return { icon: ThumbsDown, color: 'text-red-500', label: 'Negative' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reviews..." />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No store found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to create a store first to view reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-gray-600 mt-2">
          All reviews and ratings for {store.name}
        </p>
      </div>

      {/* Store Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {parseFloat(store.average_rating).toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(Math.round(store.average_rating))}
            </div>
            <p className="text-sm text-gray-600">Overall Rating</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{store.total_ratings}</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {reviews.filter(r => r.rating >= 4).length}
            </div>
            <p className="text-sm text-gray-600">Positive Reviews</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {reviews.filter(r => r.comment).length}
            </div>
            <p className="text-sm text-gray-600">With Comments</p>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
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
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="rating-DESC">Highest Rating</option>
              <option value="rating-ASC">Lowest Rating</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 ml-auto">
            Showing {reviews.length} of {pagination.totalRatings} reviews
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-500">
            {ratingFilter 
              ? 'Try adjusting your filter settings to see more reviews.'
              : 'Your store hasn\'t received any reviews yet. Encourage customers to leave feedback!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const sentiment = getReviewSentiment(review.rating);
            const SentimentIcon = sentiment.icon;
            
            return (
              <div key={review.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {review.user?.name || 'Anonymous Customer'}
                        </h4>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SentimentIcon className={`h-5 w-5 ${sentiment.color}`} />
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingBadgeColor(review.rating)}`}>
                        {review.rating} Star{review.rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Rating Display */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {renderStars(review.rating)}
                    </div>
                    <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Review Comment */}
                  {review.comment ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 italic text-sm">
                        This customer left a rating without a written review.
                      </p>
                    </div>
                  )}

                  {/* Review Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Review ID: #{review.id}</span>
                        <span>Customer: {review.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${sentiment.color.replace('text-', 'bg-').replace('-500', '-100')} ${sentiment.color}`}>
                          {sentiment.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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

export default Reviews;