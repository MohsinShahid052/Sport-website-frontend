import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaStar } from 'react-icons/fa';

export default function Shop() {
  const router = useRouter();
  const { category, search } = router.query;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: category || 'all',
    minPrice: '',
    maxPrice: '',
    brand: '',
    search: search || '',
    page: 1,
    sort: 'featured' // Added sort to filters
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🏠' },
    { value: 'cricket', label: 'Cricket', icon: '🏏' },
    { value: 'football', label: 'Football', icon: '⚽' },
    // { value: 'fitness', label: 'Fitness', icon: '💪' },
    // { value: 'tennis', label: 'Tennis', icon: '🎾' },
    // { value: 'badminton', label: 'Badminton', icon: '🏸' },
    { value: 'other', label: 'Other', icon: '🎯' }
  ];

  const brands = [
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'Wilson', 'Yonex', 'Slazenger'
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating: Highest' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const response = await api.get(`/products?${params}`);
      let productsData = response.data.products;

      // Apply client-side sorting if needed
      productsData = sortProducts(productsData, filters.sort);

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortType) => {
    const sortedProducts = [...products];
    
    switch (sortType) {
      case 'price-low':
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-high':
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      case 'rating':
        return sortedProducts.sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
      
      case 'newest':
        return sortedProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      
      case 'name':
        return sortedProducts.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
      
      case 'featured':
      default:
        // Featured can be based on some criteria like featured flag, rating, or just keep original order
        return sortedProducts.sort((a, b) => {
          // If products have a featured flag, sort by that first
          if (a.featured !== b.featured) {
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          }
          // Then by rating
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSortChange = (sortValue) => {
    handleFilterChange('sort', sortValue);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      brand: '',
      search: '',
      page: 1,
      sort: 'featured'
    });
  };

  const generateRating = () => (Math.random() * 1.5 + 3.5).toFixed(1);
  const generateReviews = () => Math.floor(Math.random() * 200) + 10;

  // Function to get product rating (you might want to replace this with actual rating from your API)
  const getProductRating = (product) => {
    return product.rating || generateRating();
  };

  const getProductReviews = (product) => {
    return product.reviewCount || generateReviews();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <FaFilter className="text-blue-500" />
              <span className="font-semibold text-gray-700">Filters & Search</span>
            </div>
            <FaChevronDown className="text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Modern Design */}
          <div className={`lg:w-80 transition-all duration-300 ${
            isFilterOpen 
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' 
              : 'hidden lg:block'
          }`}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Category */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                        filters.category === cat.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={fetchProducts}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop Products</h1>
                <p className="text-gray-600">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <select 
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      Sort by: {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse">
                    <div className="bg-gray-300 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 rounded w-2/3 mb-4"></div>
                    <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-8xl mb-6">😔</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const rating = getProductRating(product);
                  const reviews = getProductReviews(product);
                  const discount = product.originalPrice ? 
                    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                  
                  return (
                    <Link 
                      key={product._id}
                      href={`/product/${product._id}`}
                      className="group bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={`http://localhost:5000/uploads/${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                            <div className="text-4xl">🏏</div>
                          </div>
                        )}
                        
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {discount}% OFF
                          </div>
                        )}
                        
                        {/* Stock Status */}
                        {product.stock === 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow space-y-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{product.brand}</p>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-800">
                              Rs. {product.price?.toLocaleString()}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                Rs. {product.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        ></div>
      )}
    </div>
  );
}