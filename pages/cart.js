import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // ADD THIS IMPORT
import Link from 'next/link';
import { FaShoppingBag, FaPlus, FaMinus, FaTrash, FaArrowRight, FaTruck, FaReceipt } from 'react-icons/fa';

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart,
    getCartItemsCount 
  } = useCart(); // USE CART CONTEXT

  // Remove the local cart state since we're using CartContext
  // const [cart, setCart] = useState([]);

  // Fix product data structure to ensure consistency
  const fixCartItemData = (item) => {
    return {
      _id: item._id || item.product || '', // Handle both _id and product
      name: item.name || 'Unknown Product',
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || item.images?.[0] || '', // Handle both image and images array
      brand: item.brand || '',
      category: item.category || '',
      stock: item.stock || 10
    };
  };

  const validatedCartItems = cartItems.map(fixCartItemData);

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const getTotalPrice = () => {
    return getCartTotal(); // Use from context
  };

  const getShippingCost = () => {
    return getTotalPrice() > 2000 ? 0 : 200;
  };

  const getTaxAmount = () => {
    return getTotalPrice() * 0.05;
  };

  const getGrandTotal = () => {
    return getTotalPrice() + getShippingCost() + getTaxAmount();
  };

  const proceedToCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (validatedCartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  const getProductImage = (item) => {
    // If image is a string and contains file extension, it's a file path
    if (item.image && typeof item.image === 'string' && 
        (item.image.includes('.jpg') || item.image.includes('.jpeg') || 
         item.image.includes('.png') || item.image.includes('.gif'))) {
      return `http://localhost:5000/uploads/${item.image}`;
    }
    
    // Fallback to emoji based on category
    const emojiMap = {
      cricket: '🏏',
      football: '⚽',
      tennis: '🎾',
      fitness: '💪',
      badminton: '🏸',
      other: '🎯'
    };
    return emojiMap[item.category] || '🎯';
  };

  const isImageUrl = (image) => {
    return image && typeof image === 'string' && 
           (image.includes('.jpg') || image.includes('.jpeg') || 
            image.includes('.png') || image.includes('.gif'));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">Please Login</h1>
            <p className="text-gray-600 mb-8 font-inter">You need to be logged in to view your cart.</p>
            <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2">
              <span>Login to Continue</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (validatedCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="text-blue-500 text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 text-lg font-inter max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to find amazing sports gear!
            </p>
            <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 text-lg">
              <span>Start Shopping</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-poppins">Shopping Cart</h1>
            <p className="text-gray-600 font-inter">
              {validatedCartItems.length} {validatedCartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <FaTrash className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 font-poppins">Cart Items</h2>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {validatedCartItems.length} items
                </span>
              </div>

              <div className="space-y-4">
                {validatedCartItems.map((item) => {
                  const productImage = getProductImage(item);
                  const imageIsUrl = isImageUrl(productImage);
                  
                  return (
                  <div key={item._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      {/* Product Image with Link */}
                      <Link href={`/product/${item._id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          {imageIsUrl ? (
                            <img
                              src={productImage}
                              alt={item.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // If image fails to load, show emoji fallback
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          
                          {/* Show emoji if no image or image failed to load */}
                          {(!imageIsUrl || !productImage) && (
                            <div className="text-3xl">
                              {productImage}
                            </div>
                          )}
                          
                          {/* Hidden fallback for when image fails */}
                          {imageIsUrl && (
                            <div className="hidden text-3xl">
                              {getProductImage({...item, image: null})}
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item._id}`}>
                          <h3 className="font-bold text-gray-800 text-lg hover:text-blue-600 transition-colors duration-200 font-inter leading-tight mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-2 font-inter">{item.brand}</p>
                        <p className="text-blue-500 font-bold text-xl font-poppins">
                          Rs. {item.price.toLocaleString()}
                        </p>
                      </div>
                      
                      {/* Quantity Controls and Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-1">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <FaPlus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Item Total and Remove */}
                        <div className="text-right">
                          <p className="font-bold text-gray-800 text-lg">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium mt-1 transition-colors flex items-center space-x-1"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FaReceipt className="text-white text-lg" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 font-poppins">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-inter">Subtotal</span>
                  <span className="font-bold text-gray-800">Rs. {getTotalPrice().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-inter flex items-center space-x-2">
                    <FaTruck className="w-4 h-4" />
                    <span>Shipping</span>
                  </span>
                  <span className="font-bold text-gray-800">
                    {getShippingCost() === 0 ? (
                      <span className="text-green-500">FREE</span>
                    ) : (
                      `Rs. ${getShippingCost().toLocaleString()}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-inter">Tax (5%)</span>
                  <span className="font-bold text-gray-800">Rs. {getTaxAmount().toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-500 font-poppins">
                      Rs. {getGrandTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {getTotalPrice() < 2000 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Add Rs. {(2000 - getTotalPrice()).toLocaleString()} for free shipping!</span>
                    <span>{Math.round((getTotalPrice() / 2000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((getTotalPrice() / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={proceedToCheckout}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mb-4"
              >
                <FaShoppingBag className="w-5 h-5" />
                <span>Proceed to Checkout</span>
                <FaArrowRight className="w-4 h-4" />
              </button>

              <Link 
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}