import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import api, { getUploadUrl } from '../../utils/api';
import Link from 'next/link';

export default function UserOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserOrders();
  }, [user, router]);

  const fetchUserOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending': return 'Your order is being processed';
      case 'confirmed': return 'Order confirmed and preparing for shipment';
      case 'shipped': return 'Your order is on the way';
      case 'delivered': return 'Order delivered successfully';
      case 'cancelled': return 'Order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and delivery status</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/shop" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          {item.image ? (
                            <img
                              src={getUploadUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
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
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-blue-500 font-semibold">Rs. {item.price?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        Rs. {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">
                        {order.totalAmount > 2000 ? 'FREE' : 'Rs. 200'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span className="text-blue-500">Rs. {order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.name}<br/>
                      {order.shippingAddress?.street}<br/>
                      {order.shippingAddress?.city}, {order.shippingAddress?.province}<br/>
                      {order.shippingAddress?.postalCode}<br/>
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>

                  {/* Status Description */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Status:</span> {getStatusDescription(order.status)}
                    </p>
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 text-center">
                    <Link 
                      href={`/order-success/${order._id}`}
                      className="text-blue-500 hover:text-blue-600 font-semibold inline-flex items-center space-x-2"
                    >
                      <span>View Order Details</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}