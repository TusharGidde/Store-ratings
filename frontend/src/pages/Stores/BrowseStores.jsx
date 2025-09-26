import React, { useState, useEffect } from 'react';
import { Star, Search, MapPin, Filter } from 'lucide-react';
import { storeAPI, ratingAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const BrowseStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating, name, reviews

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getAllStores();
      setStores(response.data.data.stores);
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setShowRatingModal(true);
    setRating(0);
    setComment('');
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      await ratingAPI.submitRating({
        store_id: selectedStore.id,
        rating,
        comment: comment.trim() || null
      });
      
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      fetchStores(); // Refresh to get updated ratings
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      toast.error(message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredAndSortedStores = stores
    .filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.total_ratings - a.total_ratings;
        default:
          return 0;
      }
    });

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading stores..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Stores</h1>
        <p className="text-gray-600 mt-2">Discover and rate amazing stores in your area</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAndSortedStores.length} of {stores.length} stores
        </p>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedStores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h3>
              
              <div className="flex items-start mb-3">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{store.address}</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {renderStars(Math.round(store.average_rating))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {parseFloat(store.average_rating).toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {store.total_ratings} reviews
                </span>
              </div>

              <button
                onClick={() => handleRateStore(store)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
              >
                Rate This Store
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedStores.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Rate {selectedStore?.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(rating, true, setRating)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Click on stars to rate</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this store..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={submittingRating || rating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submittingRating ? <LoadingSpinner size="sm" text="" /> : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseStores;