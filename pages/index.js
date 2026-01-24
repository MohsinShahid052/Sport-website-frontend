import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../utils/api';
import { 
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaTimes,
  FaRocket,
  FaGift,
  FaArrowRight,
  FaEnvelope
} from 'react-icons/fa';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [email, setEmail] = useState('');
  const popupRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    
    const timer = setTimeout(() => {
      setShowWelcomePopup(true);
    }, 1000);

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowWelcomePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=8');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products from API:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        product: product._id,
        quantity: 1,
        price: product.price || 0,
        name: product.name || 'Unknown Product',
        image: product.images?.[0] || '',
        brand: product.brand || ''
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    const button = document.getElementById(`add-to-cart-${product._id}`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Added to Cart!';
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
      }, 2000);
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const toggleWishlist = (product) => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const existingItem = savedWishlist.find(item => item._id === product._id);

    let updatedWishlist;
    
    if (existingItem) {
      updatedWishlist = savedWishlist.filter(item => item._id !== product._id);
    } else {
      updatedWishlist = [...savedWishlist, {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        brand: product.brand,
        images: product.images,
        category: product.category,
        description: product.description,
        stock: product.stock,
        features: product.features
      }];
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    const newWishlist = new Set(wishlist);
    if (existingItem) {
      newWishlist.delete(product._id);
    } else {
      newWishlist.add(product._id);
    }
    setWishlist(newWishlist);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const generateRating = () => (Math.random() * 1.5 + 3.5).toFixed(1);
  const generateReviews = () => Math.floor(Math.random() * 200) + 10;

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
    alert('Thank you for subscribing to the Champions Club!');
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Welcome Popup Modal */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            ref={popupRef}
            className="relative bg-white border border-gray-200 rounded-2xl max-w-2xl w-full animate-scale-in overflow-hidden"
          >
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">WELCOME TO ELEVATESPORT</h2>
                  <p className="text-gray-600">Your ultimate sports equipment destination</p>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <FaTimes className="text-gray-600 text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Sale Banner */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-center mb-8 text-white">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <FaGift className="text-xl" />
                  <span className="text-2xl font-bold">AUGUST SALE</span>
                  <FaGift className="text-xl" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  30% OFF
                </div>
                <p className="text-blue-100 text-lg">On All Professional Sports Gear</p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/shop?sale=august"
                  onClick={() => setShowWelcomePopup(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105"
                >
                  🛍️ SHOP AUGUST SALE
                </Link>
                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 text-center"
                >
                  CONTINUE BROWSING
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Hero Section - Modern Design */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-green-400">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Sports Elements */}
          <div className="absolute top-20 left-20 animate-float">
            <div className="text-4xl">⚽</div>
          </div>
          <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '1s' }}>
            <div className="text-4xl">🏏</div>
          </div>
          <div className="absolute bottom-32 left-32 animate-float" style={{ animationDelay: '2s' }}>
            <div className="text-4xl">🎾</div>
          </div>
          <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="text-4xl">🏀</div>
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
          <div className="space-y-8 animate-fade-in">
            {/* Sale Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping mr-2"></span>
              <span className="font-semibold text-sm uppercase tracking-wider">
                🎉 August Sale - Up to 30% Off Professional Gear
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="text-white drop-shadow-2xl">
                ELEVATE
              </span>
              <span className="block text-white mt-2 drop-shadow-2xl">YOUR GAME</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Professional Sports Equipment for Champions
              <span className="block text-yellow-300 font-semibold mt-3">Train Like a Pro, Perform Like a Champion</span>
            </p>

            {/* CTA Buttons - Improved Design */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link href="/shop" className="group bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3">
                <span>SHOP PERFORMANCE</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link href="/categories" className="group bg-transparent border-2 border-white text-white hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3">
                <span>BROWSE COLLECTIONS</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-12 pt-12">
              {[
                { number: '500+', label: 'Products' },
                { number: '10K+', label: 'Customers' },
                { number: '50+', label: 'Brands' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 2. Featured Products Section - Fixed Cards with Consistent Button Height */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Featured Products</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Premium gear trusted by professional athletes and champions
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-80 rounded-2xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-300 h-4 rounded"></div>
                    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => {
                const rating = generateRating();
                const reviews = generateReviews();
                const discount = product.originalPrice ? 
                  Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                
                return (
                  <div key={product._id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col">
                    {/* Product Image Container - Fixed Size with Link */}
                    <Link href={`/product/${product._id}`} className="relative h-64 bg-gray-100 overflow-hidden block">
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
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <FaHeart className={`w-5 h-5 ${
                          wishlist.has(product._id) ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      </button>
                    </Link>

                    {/* Product Info - Fixed Layout with Consistent Height */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Product Details with Link */}
                      <Link href={`/product/${product._id}`} className="flex-grow space-y-3 mb-4 block">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight min-h-[3.5rem] hover:text-blue-600 transition-colors duration-200">{product.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{product.brand}</p>
                        </div>
                        
                        {/* Rating - Fixed Layout */}
                        <div className="flex items-center justify-between">
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
                        </div>

                        {/* Price - Fixed Layout */}
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
                      </Link>

                      {/* Add to Cart Button - Fixed at Bottom with Consistent Height */}
                      <button
                        id={`add-to-cart-${product._id}`}
                        onClick={() => addToCart(product)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mt-auto"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-16">
            <Link href="/shop" className="group bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3">
              <span>VIEW ALL PRODUCTS</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Newsletter Section - Updated Design */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Champions Club</span>
              </h2>
              <p className="text-gray-600 text-xl leading-relaxed">
                Get exclusive access to pro tips, new arrivals, and members-only deals. Be the first to know about sales and special offers.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Exclusive Deals</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Pro Tips</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Early Access</span>
                </span>
              </div>
            </div>

            {/* Modern Subscription Form */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEnvelope className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Stay Updated</h3>
                  <p className="text-gray-600 mt-2">Get the latest updates delivered to your inbox</p>
                </div>
                
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white focus:shadow-lg"
                      required
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>JOIN THE CLUB</span>
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </form>
                
                <p className="text-gray-500 text-xs text-center mt-4">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </div>
              
              {/* Background Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-200 rounded-full opacity-50 blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}