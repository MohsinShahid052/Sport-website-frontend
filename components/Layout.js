import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  FaShoppingCart, 
  FaHeart, 
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBox,
  FaUsers,
  FaChartBar
} from 'react-icons/fa';

export default function Layout({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  useEffect(() => {
    const updateCartCount = () => {
      const count = getCartItemsCount();
      setCartCount(count);
    };

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateCartCount();
    updateWishlistCount();

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [getCartItemsCount]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/about' },
  ];

  const userMenuItems = user?.role === 'admin' 
    ? [
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: FaTachometerAlt },
        { name: 'Manage Products', href: '/admin/products', icon: FaBox },
        { name: 'Orders', href: '/admin/orders', icon: FaUsers },
        { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
      ]
    : [
        { name: 'My Dashboard', href: '/user/dashboard', icon: FaTachometerAlt },
        { name: 'My Orders', href: '/user/orders', icon: FaBox },
        { name: 'Wishlist', href: '/wishlist', icon: FaHeart },
        { name: 'Settings', href: '/user/settings', icon: FaCog },
      ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-black text-gray-800 hover:text-blue-600 hover:scale-110 transition-all duration-300">
                ELEVATESPORT
              </span>
            </Link>

            {/* Center Navigation */}
            <nav className="flex items-center space-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-lg font-semibold transition-all duration-300 hover:scale-125 ${
                    router.pathname === item.href
                      ? 'text-blue-600 scale-110'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side - Icons and User Menu */}
            <div className="flex items-center space-x-6">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative text-gray-600 hover:text-blue-500 hover:scale-125 transition-all duration-300 p-2">
                <FaHeart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="relative text-gray-600 hover:text-blue-500 hover:scale-125 transition-all duration-300 p-2">
                <FaShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu or Login Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <FaUser className="w-4 h-4" />
                    <span>{user.name?.split(' ')[0]}</span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center mb-6">
                <span className="text-2xl font-black text-gray-800 hover:text-blue-600 hover:scale-105 transition-all duration-300">
                  ELEVATESPORT
                </span>
              </Link>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Your premier destination for professional sports equipment. 
                Elevate your game with gear trusted by champions worldwide.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-200 hover:bg-blue-500 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                {['Home', 'Shop', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link
                      href={`/${link.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:translate-x-2 block"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                {['Contact Us', 'Shipping Info', 'Returns', 'FAQs'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:translate-x-2 block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 ElevateSport. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Privacy Policy', 'Terms of Service'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="text-gray-600 hover:text-blue-500 text-sm transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}