import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminRoute from '../../components/AdminRoute';
import api from '../../utils/api';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    revenueData: [],
    categoryData: [],
    orderTrends: [],
    topProducts: [],
    customerStats: {}
  });
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/users')
      ]);

      const orders = ordersResponse.data;
      const products = productsResponse.data.products || productsResponse.data;
      const users = usersResponse.data;

      // Process analytics data
      const processedData = processAnalyticsData(orders, products, users, timeRange);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (orders, products, users, range) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Filter orders by time range
    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    // Revenue by day
    const revenueByDay = {};
    filteredOrders.forEach(order => {
      if (order.status === 'delivered') {
        const date = new Date(order.createdAt).toLocaleDateString();
        revenueByDay[date] = (revenueByDay[date] || 0) + order.totalAmount;
      }
    });

    const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sales by category
    const categorySales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'other';
        categorySales[category] = (categorySales[category] || 0) + item.quantity;
      });
    });

    const categoryData = Object.entries(categorySales).map(([category, sales]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      sales,
      revenue: filteredOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => {
          const categoryItems = order.items.filter(item => 
            (item.category || 'other') === category
          );
          return sum + categoryItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0)
    }));

    // Order trends
    const orderTrends = [
      { status: 'Pending', count: filteredOrders.filter(o => o.status === 'pending').length },
      { status: 'Confirmed', count: filteredOrders.filter(o => o.status === 'confirmed').length },
      { status: 'Shipped', count: filteredOrders.filter(o => o.status === 'shipped').length },
      { status: 'Delivered', count: filteredOrders.filter(o => o.status === 'delivered').length },
      { status: 'Cancelled', count: filteredOrders.filter(o => o.status === 'cancelled').length }
    ];

    // Top products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product || item.name;
        productSales[productId] = {
          name: item.name,
          sales: (productSales[productId]?.sales || 0) + item.quantity,
          revenue: (productSales[productId]?.revenue || 0) + (item.price * item.quantity)
        };
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Customer stats
    const customerStats = {
      totalCustomers: users.filter(u => u.role === 'user').length,
      newCustomers: users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= startDate && u.role === 'user';
      }).length,
      returningCustomers: filteredOrders.reduce((acc, order) => {
        acc.add(order.user);
        return acc;
      }, new Set()).size
    };

    return {
      revenueData,
      categoryData,
      orderTrends,
      topProducts,
      customerStats
    };
  };

  const getTotalRevenue = () => {
    return analytics.revenueData.reduce((sum, day) => sum + day.revenue, 0);
  };

  const getTotalOrders = () => {
    return analytics.orderTrends.reduce((sum, trend) => sum + trend.count, 0);
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 h-96"></div>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Real-time insights and performance metrics</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">Rs. {getTotalRevenue().toLocaleString()}</p>
                  <p className="text-green-600 text-sm mt-1">+12% from previous period</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{getTotalOrders()}</p>
                  <p className="text-green-600 text-sm mt-1">+8% from previous period</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.customerStats.totalCustomers}</p>
                  <p className="text-green-600 text-sm mt-1">+{analytics.customerStats.newCustomers} new</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg. Order Value</p>
                  <p className="text-3xl font-bold text-gray-800">
                    Rs. {getTotalOrders() > 0 ? Math.round(getTotalRevenue() / getTotalOrders()).toLocaleString() : 0}
                  </p>
                  <p className="text-green-600 text-sm mt-1">+5% from previous period</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Trend</h2>
              <div className="space-y-4">
                {analytics.revenueData.length > 0 ? (
                  analytics.revenueData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-20">{day.date}</span>
                      <div className="flex-1 mx-4">
                        <div 
                          className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(day.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 80}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                        Rs. {day.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600">No revenue data for selected period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Status</h2>
              <div className="space-y-4">
                {analytics.orderTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{trend.status}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            trend.status === 'Delivered' ? 'bg-green-500' :
                            trend.status === 'Pending' ? 'bg-yellow-500' :
                            trend.status === 'Shipped' ? 'bg-purple-500' :
                            trend.status === 'Confirmed' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${(trend.count / getTotalOrders()) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-8">
                        {trend.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Selling Products</h2>
              <div className="space-y-4">
                {analytics.topProducts.length > 0 ? (
                  analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sales} units sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">
                        Rs. {product.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="text-gray-600">No product sales data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Performance</h2>
              <div className="space-y-4">
                {analytics.categoryData.length > 0 ? (
                  analytics.categoryData.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          category.category === 'Cricket' ? 'bg-red-500' :
                          category.category === 'Football' ? 'bg-blue-500' :
                          category.category === 'Tennis' ? 'bg-green-500' :
                          category.category === 'Fitness' ? 'bg-purple-500' :
                          category.category === 'Badminton' ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                          <span className="text-white text-lg">
                            {category.category === 'Cricket' && '🏏'}
                            {category.category === 'Football' && '⚽'}
                            {category.category === 'Tennis' && '🎾'}
                            {category.category === 'Fitness' && '💪'}
                            {category.category === 'Badminton' && '🏸'}
                            {!['Cricket', 'Football', 'Tennis', 'Fitness', 'Badminton'].includes(category.category) && '🎯'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{category.category}</p>
                          <p className="text-sm text-gray-600">{category.sales} units sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-blue-600">
                        Rs. {category.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-600">No category data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}