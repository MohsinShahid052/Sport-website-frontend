import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import api from '../../utils/api';

export default function OrderSuccess() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchOrder();
    }
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="h-12 bg-gray-300 rounded mb-6"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200 text-center mb-8">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          {order && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Order ID: <span className="text-green-600">{order._id.slice(-8).toUpperCase()}</span>
              </p>
              <p className="text-gray-600">
                We've sent a confirmation to your email
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-800">Order Processing</h3>
              <p className="text-sm text-gray-600">We're preparing your order</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">🚚</div>
              <h3 className="font-semibold text-gray-800">Shipping</h3>
              <p className="text-sm text-gray-600">Expected delivery: 3-5 days</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="font-semibold text-gray-800">Delivery</h3>
              <p className="text-sm text-gray-600">Right to your doorstep</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/user/orders"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View My Orders
            </Link>
            <Link 
              href="/shop"
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {order.shippingAddress?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h3>
                <div className="space-y-2">
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                  <p>{order.shippingAddress?.postalCode}</p>
                  <p>Pakistan</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          {item.category === 'cricket' && '🏏'}
                          {item.category === 'football' && '⚽'}
                          {item.category === 'tennis' && '🎾'}
                          {!['cricket', 'football', 'tennis'].includes(item.category) && '🎯'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">Price: Rs. {item.price?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    Rs. {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">
                    {order.totalAmount > 2000 ? 'FREE' : 'Rs. 200'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%):</span>
                  <span className="font-semibold">
                    Rs. {(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>Rs. {order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">Payment Method</h4>
              <p className="text-gray-600">
                {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 
                 order.paymentMethod === 'easypaisa' ? 'Easypaisa' :
                 order.paymentMethod === 'jazzcash' ? 'JazzCash' :
                 order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                 order.paymentMethod}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}