import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DebugAuth from '../../components/DebugAuth';
import Link from 'next/link';
import AdminRoute from '../../components/AdminRoute';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      
      const [ordersResponse, productsResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/products/admin')
      ]);

      const orders = ordersResponse.data;
      const products = productsResponse.data.products;

      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const totalProducts = products.length;
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({ totalOrders, pendingOrders, totalProducts, totalRevenue });
      setRecentOrders(orders.slice(0, 5));
      
      console.log('✅ Dashboard data loaded');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'easypaisa': return 'bg-blue-100 text-blue-800';
      case 'jazzcash': return 'bg-purple-100 text-purple-800';
      case 'cash_on_delivery': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'easypaisa': return 'Easypaisa';
      case 'jazzcash': return 'JazzCash';
      case 'cash_on_delivery': return 'Cash on Delivery';
      default: return method;
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <DebugAuth />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 h-64"></div>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <DebugAuth />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Refresh Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">🏏</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">Rs. {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
                <Link href="/admin/orders" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">Order #{order._id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''} • Rs. {order.totalAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(order.paymentMethod)}`}>
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Customer Information */}
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-800">
                          👤 {order.shippingAddress?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          📞 {order.shippingAddress?.phone}
                        </p>
                      </div>
                      
                      {/* Shipping Address */}
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="truncate">
                          📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.province} - {order.shippingAddress?.postalCode}
                        </p>
                      </div>

                      {/* Order Items Preview */}
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="font-semibold">Items:</p>
                        <div className="mt-1 space-y-1">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name} (x{item.quantity})</span>
                              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-blue-600">+ {order.items.length - 2} more items</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Link href="/admin/products" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">➕</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Manage Products</h3>
                    <p className="text-gray-600 text-sm">Add, edit, or remove products</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/orders" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Manage Orders</h3>
                    <p className="text-gray-600 text-sm">Update order status and track deliveries</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/analytics" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">View Analytics</h3>
                    <p className="text-gray-600 text-sm">Sales reports and performance metrics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}