import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import Link from 'next/link';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check both regular cart and tempCart
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
    
    let checkoutItems = [];
    
    if (tempCart.length > 0) {
      // Use tempCart for quick checkout
      checkoutItems = tempCart;
      // Clear tempCart after loading
      localStorage.removeItem('tempCart');
    } else if (savedCart.length > 0) {
      // Use regular cart
      checkoutItems = savedCart;
    } else {
      router.push('/cart');
      return;
    }

    // Pre-fill form with user data
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || ''
    }));
  }, [user, router]);

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    return getSubtotal() > 2000 ? 0 : 200;
  };

  const getTaxAmount = () => {
    return getSubtotal() * 0.05;
  };

  const getGrandTotal = () => {
    return getSubtotal() + getShippingCost() + getTaxAmount();
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.province.trim()) errors.province = 'Province is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';

    // Phone validation for Pakistan
    const phoneRegex = /^03[0-9]{2}-?[0-9]{7}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      errors.phone = 'Please enter a valid Pakistan phone number (03XX-XXXXXXX)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For ALL payment methods (including easypaisa and jazzcash), we treat them like cash on delivery
      // But we still save the actual payment method for admin to see
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || '',
          category: item.category
        })),
        shippingAddress: formData,
        paymentMethod: paymentMethod, // Save the actual selected method
        totalAmount: getGrandTotal(),
        status: 'pending'
      };

      console.log('Placing order with payment method:', paymentMethod);

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        // Clear cart after successful order
        clearCart();
        localStorage.removeItem('tempCart');
        
        // Redirect to success page
        router.push(`/order-success/${response.data.order._id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // Show error message in the UI instead of alert
      setFormErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Failed to place order. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = () => {
    const orderDetails = `Order Details:
💰 Amount: Rs. ${getGrandTotal().toLocaleString()}
📦 Items: ${cartItems.map(item => `${item.name} (x${item.quantity})`).join(', ')}
📱 Payment Method: ${paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}

Please find the payment screenshot attached.`;

    const whatsappUrl = `https://wa.me/923123456789?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-8">Please login to proceed with checkout.</p>
            <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-block">
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart before checkout.</p>
            <Link href="/shop" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Secure Checkout</h1>
          <p className="text-sm sm:text-base text-gray-600">Complete your purchase with confidence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="space-y-4 md:space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm md:text-lg">🚚</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Shipping Information</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="03XX-XXXXXXX"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.street ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="House #, Street, Area"
                    />
                    {formErrors.street && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.street}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                        }`}
                        placeholder="Enter city"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none ${
                          formErrors.province ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                        }`}
                      >
                        <option value="">Select Province</option>
                        <option value="punjab">Punjab</option>
                        <option value="sindh">Sindh</option>
                        <option value="kpk">Khyber Pakhtunkhwa</option>
                        <option value="balochistan">Balochistan</option>
                        <option value="islamabad">Islamabad</option>
                        <option value="gilgit">Gilgit-Baltistan</option>
                      </select>
                      {formErrors.province && (
                        <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.province}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="XXXXX"
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Submit Error */}
                {formErrors.submit && (
                  <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl">
                    <p className="text-red-700 text-xs md:text-sm">{formErrors.submit}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm md:text-lg">💳</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Payment Method</h2>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {/* Cash on Delivery */}
                <label className={`flex items-center space-x-3 p-3 md:p-4 border-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'cash_on_delivery' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">💰</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">Cash on Delivery</p>
                        <p className="text-xs text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Easypaisa */}
                <label className={`flex items-center space-x-3 p-3 md:p-4 border-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'easypaisa' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="easypaisa"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">📱</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">Easypaisa</p>
                        <p className="text-xs text-gray-600">Pay via Easypaisa (Cash on Delivery)</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                {/* JazzCash */}
                <label className={`flex items-center space-x-3 p-3 md:p-4 border-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'jazzcash' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">📞</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">JazzCash</p>
                        <p className="text-xs text-gray-600">Pay via JazzCash (Cash on Delivery)</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Instructions - Only show for mobile payments */}
              {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                <div className={`mt-3 md:mt-4 p-3 md:p-4 border rounded-lg md:rounded-xl ${
                  paymentMethod === 'easypaisa' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
                }`}>
                  <h4 className={`font-semibold text-sm md:text-base mb-2 ${
                    paymentMethod === 'easypaisa' ? 'text-blue-800' : 'text-purple-800'
                  }`}>
                    {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Payment Instructions
                  </h4>
                  <p className={`text-xs md:text-sm mb-3 ${
                    paymentMethod === 'easypaisa' ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    Please send payment to {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} number: <strong>
                      {paymentMethod === 'easypaisa' ? '0312-3456789' : '0300-1234567'}
                    </strong><br/>
                    Amount: <strong>Rs. {getGrandTotal().toLocaleString()}</strong><br/>
                    Use your name as reference.
                  </p>
                  <p className={`text-xs md:text-sm mb-3 ${
                    paymentMethod === 'easypaisa' ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    📸 <strong>Take a screenshot</strong> of your payment confirmation and send it to us on WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={sendWhatsAppMessage}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span className="text-lg md:text-xl">📱</span>
                    <span className="text-sm md:text-base">Send Screenshot on WhatsApp</span>
                  </button>
                </div>
              )}

              {/* Cash on Delivery Instructions */}
              {paymentMethod === 'cash_on_delivery' && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg md:rounded-xl">
                  <h4 className="font-semibold text-green-800 text-sm md:text-base mb-2">Cash on Delivery</h4>
                  <p className="text-green-700 text-xs md:text-sm">
                    Pay <strong>Rs. {getGrandTotal().toLocaleString()}</strong> when you receive your order.<br/>
                    Our delivery agent will collect the payment at your doorstep.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm sticky top-4">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm md:text-lg">📦</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              {/* Order Items */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-60 md:max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg md:rounded-xl">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                        {item.images?.[0] ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.images[0]}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg md:text-2xl">
                            {item.category === 'cricket' && '🏏'}
                            {item.category === 'football' && '⚽'}
                            {item.category === 'tennis' && '🎾'}
                            {!['cricket', 'football', 'tennis'].includes(item.category) && '🎯'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs md:text-sm leading-tight truncate">{item.name}</p>
                        <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                        <p className="text-blue-500 font-bold text-xs md:text-sm">Rs. {item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800 text-sm md:text-base">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-3 md:pt-4 space-y-2 md:space-y-3">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {getShippingCost() === 0 ? (
                      <span className="text-green-500">FREE</span>
                    ) : (
                      `Rs. ${getShippingCost().toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">Rs. {getTaxAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-bold border-t border-gray-200 pt-2 md:pt-3">
                  <span>Total Amount</span>
                  <span className="text-blue-500 text-xl md:text-2xl">Rs. {getGrandTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {getSubtotal() < 2000 && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg md:rounded-xl">
                  <div className="flex justify-between text-xs md:text-sm text-yellow-800 mb-2">
                    <span>Add Rs. {(2000 - getSubtotal()).toLocaleString()} for free shipping!</span>
                    <span>{Math.round((getSubtotal() / 2000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((getSubtotal() / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-4 md:mt-6 py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 md:space-x-3 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="text-lg md:text-xl">{loading ? '⏳' : '✅'}</span>
                <span className="text-sm md:text-base">
                  {loading ? 'Placing Order...' : `Place Order - Rs. ${getGrandTotal().toLocaleString()}`}
                </span>
              </button>

              <Link 
                href="/cart"
                className="w-full mt-2 md:mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1 md:space-x-2"
              >
                <span className="text-sm md:text-base">← Back to Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}