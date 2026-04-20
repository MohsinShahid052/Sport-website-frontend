import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getUploadUrl } from '../utils/api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    console.log('Loaded wishlist:', savedWishlist); // Debug log
    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item._id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    // Dispatch event to update navbar counter
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const moveToCart = (product) => {
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
        brand: product.brand || '',
        category: product.category || ''
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    removeFromWishlist(product._id);
    // Dispatch events to update both counters
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated'));
    
    // Show success message
    alert('Product moved to cart!');
  };

  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlist([]);
      localStorage.setItem('wishlist', '[]');
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffdf6] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-[#1c1c1c] mb-4 font-poppins">Please Login</h1>
          <p className="text-gray-600 mb-8 font-inter">You need to be logged in to view your wishlist.</p>
          <Link href="/login" className="bg-[#009a44] text-white px-6 py-3 rounded-lg font-semibold font-poppins hover:bg-[#ff6b35] transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1c1c1c] font-poppins">My Wishlist</h1>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-inter"
            >
              Clear All
            </button>
          )}
        </div>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-[#1c1c1c] mb-4 font-poppins">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 font-inter max-w-md mx-auto">
              Save your favorite products here to easily find them later. Click the heart icon on any product to add it to your wishlist.
            </p>
            <Link 
              href="/shop" 
              className="bg-[#009a44] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#ff6b35] transition-all duration-300 transform hover:scale-105 font-poppins inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                {/* Product Image with Link */}
                <Link href={`/product/${product._id}`} className="relative aspect-square bg-gray-100 overflow-hidden block">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={getUploadUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon */}
                  <div 
                    className={`w-full h-full flex items-center justify-center ${
                      product.images && product.images.length > 0 ? 'hidden' : 'flex'
                    }`}
                  >
                    <div className="text-4xl">
                      {product.category === 'cricket' && '🏏'}
                      {product.category === 'football' && '⚽'}
                      {product.category === 'tennis' && '🎾'}
                      {product.category === 'fitness' && '💪'}
                      {product.category === 'badminton' && '🏸'}
                      {!['cricket', 'football', 'tennis', 'fitness', 'badminton'].includes(product.category) && '🎯'}
                    </div>
                  </div>

                  {/* Remove Button - Top Right */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Link>
                
                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Product Details with Link */}
                  <Link href={`/product/${product._id}`} className="flex-grow mb-3 block">
                    <div>
                      <h3 className="font-semibold text-[#1c1c1c] line-clamp-2 mb-1 font-inter leading-tight hover:text-blue-600 transition-colors duration-200">
                        {product.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1 font-inter">{product.brand || ''}</p>
                      {product.category && (
                        <span className="inline-block bg-[#009a44]/10 text-[#009a44] text-xs px-2 py-1 rounded-full font-medium capitalize">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xl font-bold text-[#009a44] font-poppins">
                        Rs. {(product.price || 0).toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through font-inter">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Add to Cart and Remove Buttons - Always Visible and Same Line */}
                  <div className="flex space-x-2 mt-auto">
                    <button
                      onClick={() => moveToCart(product)}
                      className="flex-1 bg-[#009a44] text-white py-2 rounded-lg font-medium hover:bg-[#ff6b35] transition-all duration-300 transform hover:scale-105 font-inter text-sm flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-inter text-sm flex items-center justify-center"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Summary */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-[#1c1c1c] font-poppins">
                  Wishlist Summary
                </h3>
                <p className="text-gray-600 font-inter">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                </p>
              </div>
              <div className="flex space-x-4">
                <Link 
                  href="/shop"
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors font-inter"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={clearWishlist}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors font-inter"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}