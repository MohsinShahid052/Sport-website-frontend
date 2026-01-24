import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const checkAdminAccess = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          console.log('❌ No auth data - redirecting to login');
          router.push('/admin/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        if (userData.role !== 'admin' && !userData.isAdmin) {
          console.log('❌ Not admin - redirecting to login');
          router.push('/admin/login');
          return;
        }

        console.log('✅ Admin access verified');
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Admin route check error:', error);
        router.push('/admin/login');
      }
    };

    checkAdminAccess();
  }, [user, isAuthenticated, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return children;
}