import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DebugAuth() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Auth State:', {
      contextUser: user,
      contextAuthenticated: isAuthenticated,
      localStorageToken: token ? `Present (${token.substring(0, 15)}...)` : 'Missing',
      localStorageUser: storedUser ? JSON.parse(storedUser) : 'Missing'
    });
  }, [user, isAuthenticated]);

  return null;
}