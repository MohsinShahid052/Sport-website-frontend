import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminLogin(formData.email, formData.password);
      
      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Demo credentials auto-fill for testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@elevatesport.com',
      password: 'admin123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-black text-gray-800 hover:text-blue-600 transition-colors duration-300">
              ELEVATESPORT
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure administrator access
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200"
                placeholder="admin@elevatesport.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200"
                placeholder="Enter admin password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Fill Demo Credentials
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </div>

          {/* Admin Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Admin Access:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Primary Admin:</strong> admin@elevatesport.com / admin123</p>
              <p><strong>Secondary Admin:</strong> admin@example.com / admin456</p>
              <p className="mt-2 text-blue-600">Use the "Fill Demo Credentials" button for quick access.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-center space-y-2">
            <Link 
              href="/login" 
              className="block text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            >
              ← Back to User Login
            </Link>
            <Link 
              href="/" 
              className="block text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
            >
              ← Back to Homepage
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}