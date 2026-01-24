// pages/product/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const videoRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Get all media with videos first, then images
  const getAllMedia = useCallback(() => {
    if (!product) return [];
    
    const media = [];
    
    // Add videos first
    if (product.videos && product.videos.length > 0) {
      product.videos.forEach(video => {
        media.push({ type: 'video', url: video });
      });
    }
    
    // Add images after videos
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        media.push({ type: 'image', url: image });
      });
    }
    
    return media;
  }, [product]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      checkWishlist();
    }
  }, [id]);

  // Keyboard navigation for media
  useEffect(() => {
    const handleKeyDown = (e) => {
      const allMedia = getAllMedia();
      if (allMedia.length === 0) return;
      
      if (e.key === 'ArrowLeft') {
        handlePreviousMedia();
      } else if (e.key === 'ArrowRight') {
        handleNextMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, getAllMedia]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching product with ID:', id);
      
      const response = await api.get(`/products/${id}`);
      console.log('✅ Product data received:', response.data);
      
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.some(item => item._id === id);
    setIsInWishlist(isInWishlist);
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) return;

    addToCart(product, quantity);
    alert(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) return;

    // Add to cart first
    addToCart(product, quantity);
    
    // Navigate directly to checkout page
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isInWishlist) {
      const updatedWishlist = wishlist.filter(item => item._id !== id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
    } else {
      const productData = {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        brand: product.brand,
        images: product.images,
        videos: product.videos,
        category: product.category,
        description: product.description,
        stock: product.stock,
        features: product.features
      };
      
      const updatedWishlist = [...wishlist, productData];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(true);
    }
    
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getMediaUrl = (media) => {
    if (!media) return '';
    
    if (typeof media === 'string') {
      if (media.includes('.mp4') || media.includes('.mov') || media.includes('.avi')) {
        return `http://localhost:5000/uploads/${media}`;
      }
      if (media.includes('.jpg') || media.includes('.jpeg') || media.includes('.png') || media.includes('.gif')) {
        return `http://localhost:5000/uploads/${media}`;
      }
    }
    return media;
  };

  const isVideo = (media) => {
    if (!media) return false;
    const url = typeof media === 'string' ? media : '';
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('youtube') || url.includes('vimeo');
  };

  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      cricket: '🏏',
      football: '⚽',
      tennis: '🎾',
      fitness: '💪',
      badminton: '🏸',
      other: '🎯'
    };
    return emojiMap[category] || '🎯';
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const getMediaThumbnail = (media) => {
    if (media.type === 'video') {
      if (isYouTubeUrl(media.url)) {
        const videoId = media.url.includes('youtube.com/watch?v=') 
          ? media.url.split('v=')[1].split('&')[0]
          : media.url.split('youtu.be/')[1].split('?')[0];
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return '/video-thumbnail.jpg';
    }
    return getMediaUrl(media.url);
  };

  const handleNextMedia = () => {
    const allMedia = getAllMedia();
    if (allMedia.length > 0) {
      setSelectedMedia((prev) => (prev + 1) % allMedia.length);
      setIsVideoPlaying(false);
    }
  };

  const handlePreviousMedia = () => {
    const allMedia = getAllMedia();
    if (allMedia.length > 0) {
      setSelectedMedia((prev) => (prev - 1 + allMedia.length) % allMedia.length);
      setIsVideoPlaying(false);
    }
  };

  // Handle swipe for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextMedia();
    } else if (isRightSwipe) {
      handlePreviousMedia();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-gray-300 h-96 rounded-2xl"></div>
                <div className="flex space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-300 h-20 rounded-xl flex-1"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-12 bg-gray-300 rounded w-1/4"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-8xl mb-6">😔</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error || 'Product Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The product you are looking for does not exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                ← Go Back
              </button>
              <Link 
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const rating = product.rating || 4.5;
  const reviews = product.reviewCount || 128;

  const allMedia = getAllMedia();
  const currentMedia = allMedia[selectedMedia];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors duration-200">
            Home
          </Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-blue-500 transition-colors duration-200">
            Shop
          </Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Media */}
          <div className="space-y-6">
            {/* Main Media Display */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
              <div 
                className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {currentMedia ? (
                  currentMedia.type === 'video' ? (
                    <div className="w-full h-full relative">
                      {isYouTubeUrl(currentMedia.url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(currentMedia.url)}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Product Video"
                        />
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            src={getMediaUrl(currentMedia.url)}
                            className="w-full h-full object-cover"
                            controls
                            poster="/video-thumbnail.jpg"
                          />
                          <button
                            onClick={handleVideoPlay}
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-300"
                          >
                            <span className="text-white text-6xl">
                              {isVideoPlaying ? '❚❚' : '▶'}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(currentMedia.url)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )
                ) : (
                  <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                    <div className="text-8xl">
                      {getCategoryEmoji(product.category)}
                    </div>
                  </div>
                )}

                {/* Fallback when no media */}
                {!currentMedia && (
                  <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                    <div className="text-8xl">
                      {getCategoryEmoji(product.category)}
                    </div>
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    {discount}% OFF
                  </div>
                )}

                {/* Stock Status */}
                {product.stock === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    Out of Stock
                  </div>
                )}

                {/* Navigation Arrows */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousMedia}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <span className="text-2xl">←</span>
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <span className="text-2xl">→</span>
                    </button>
                  </>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-16 bg-white/90 hover:bg-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <span className={`text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`}>
                    {isInWishlist ? '❤️' : '🤍'}
                  </span>
                </button>

                {/* Media Counter */}
                {allMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedMedia + 1} / {allMedia.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allMedia.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMedia(index);
                      setIsVideoPlaying(false);
                    }}
                    className={`flex-shrink-0 w-20 h-20 bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 relative ${
                      selectedMedia === index 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <>
                        <img
                          src={getMediaThumbnail(media)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <span className="text-white text-lg">▶</span>
                        </div>
                      </>
                    ) : (
                      <img
                        src={getMediaUrl(media.url)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`text-xl ${
                          star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-lg text-gray-600">({reviews} reviews)</span>
                </div>
                <span className="text-lg text-gray-500">•</span>
                <span className="text-lg text-green-600 font-semibold">In Stock: {product.stock}</span>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl font-bold text-blue-500">
                  Rs. {product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      Rs. {product.originalPrice?.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                      Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Brand and Category */}
            <div className="flex items-center space-x-6 text-gray-600">
              <div>
                <span className="font-semibold">Brand:</span>
                <span className="ml-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {product.brand}
                </span>
              </div>
              <div>
                <span className="font-semibold">Category:</span>
                <span className="ml-2 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                  {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                </span>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Features:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-800">Quantity:</span>
                <div className="flex items-center space-x-3 bg-white rounded-xl border border-gray-200 p-2">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-gray-600">-</span>
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800 text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-gray-600">+</span>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} available
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed text-gray-500'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  🛒 Add to Cart - Rs. {(product.price * quantity).toLocaleString()}
                </button>

                <button 
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed text-gray-500'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  ⚡ Buy Now
                </button>
              </div>
            </div>

            {/* Product Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm">On orders over Rs. 2000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-semibold">2-Year Warranty</p>
                  <p className="text-sm">Quality guaranteed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-2xl">↩️</span>
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'features', label: 'Features' },
                { id: 'media', label: 'Media Gallery' },
                { id: 'reviews', label: 'Reviews' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features && product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allMedia.map((media, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      {media.type === 'video' ? (
                        <div className="aspect-video relative">
                          {isYouTubeUrl(media.url) ? (
                            <iframe
                              src={getYouTubeEmbedUrl(media.url)}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`Product Video ${index + 1}`}
                            />
                          ) : (
                            <video
                              src={getMediaUrl(media.url)}
                              className="w-full h-full object-cover"
                              controls
                              poster="/video-thumbnail.jpg"
                            />
                          )}
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(media.url)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {allMedia.length === 0 && (
                  <div className="text-center py-12 bg-gray-100 rounded-2xl">
                    <div className="text-6xl mb-4">📷</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Media Available</h3>
                    <p className="text-gray-600">This product doesn't have any images or videos yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Customer Reviews</h3>
                  <p className="text-gray-600">
                    This product has an average rating of {rating} out of 5 stars
                  </p>
                </div>
                {/* You can add actual reviews here later */}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">You Might Also Like</h2>
            <Link 
              href="/shop"
              className="text-blue-500 hover:text-blue-600 font-semibold flex items-center space-x-2"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
          <div className="text-center py-12 bg-gray-100 rounded-2xl">
            <p className="text-gray-600">Related products will be shown here</p>
          </div>
        </div>
      </div>
    </div>
  );
}