// utils/auth.js

// Token Management
export const setToken = (token, isAdmin = false) => {
  if (typeof window !== 'undefined') {
    if (isAdmin) {
      localStorage.setItem('admin-token', token);
      // Also set regular token for API compatibility
      localStorage.setItem('token', token);
    } else {
      localStorage.setItem('token', token);
      // Remove admin token if switching to regular user
      localStorage.removeItem('admin-token');
    }
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    // Check for admin token first, then regular token
    return localStorage.getItem('admin-token') || localStorage.getItem('token');
  }
  return null;
};

export const getTokenType = () => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('admin-token')) return 'admin';
    if (localStorage.getItem('token')) return 'user';
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('admin-token');
  }
};

// User Management
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also store user role separately for quick access
    if (user.role) {
      localStorage.setItem('user-role', user.role);
    }
    
    // Store user permissions if available
    if (user.permissions) {
      localStorage.setItem('user-permissions', JSON.stringify(user.permissions));
    }
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-permissions');
    localStorage.removeItem('admin-session');
  }
};

// Admin Specific Functions
export const setAdminSession = (adminData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin-session', JSON.stringify({
      ...adminData,
      loginTime: new Date().toISOString(),
      isAdmin: true
    }));
  }
};

export const getAdminSession = () => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('admin-session');
    return session ? JSON.parse(session) : null;
  }
  return null;
};

export const isAdmin = () => {
  if (typeof window !== 'undefined') {
    // Check multiple sources for admin status
    const adminSession = getAdminSession();
    const user = getUser();
    const userRole = localStorage.getItem('user-role');
    
    return !!(adminSession || (user && user.role === 'admin') || userRole === 'admin');
  }
  return false;
};

// Role and Permission Management
export const getUserRole = () => {
  if (typeof window !== 'undefined') {
    const user = getUser();
    const userRole = localStorage.getItem('user-role');
    return user?.role || userRole || 'user';
  }
  return 'user';
};

export const hasRole = (role) => {
  return getUserRole() === role;
};

export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

export const getPermissions = () => {
  if (typeof window !== 'undefined') {
    const permissions = localStorage.getItem('user-permissions');
    return permissions ? JSON.parse(permissions) : [];
  }
  return [];
};

export const hasPermission = (permission) => {
  const permissions = getPermissions();
  return permissions.includes(permission);
};

// Session Management
export const getSessionInfo = () => {
  if (typeof window !== 'undefined') {
    const user = getUser();
    const token = getToken();
    const tokenType = getTokenType();
    const isAdminUser = isAdmin();
    
    return {
      isAuthenticated: !!token && !!user,
      user,
      token,
      tokenType,
      isAdmin: isAdminUser,
      role: getUserRole(),
      permissions: getPermissions()
    };
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    tokenType: null,
    isAdmin: false,
    role: 'user',
    permissions: []
  };
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    removeToken();
    removeUser();
    
    // Clear all auth-related items
    const authKeys = [
      'token', 'admin-token', 'user', 'user-role', 
      'user-permissions', 'admin-session', 'auth-timeout'
    ];
    
    authKeys.forEach(key => localStorage.removeItem(key));
  }
};

// Session Timeout Management
export const setAuthTimeout = (timeoutMinutes = 60) => {
  if (typeof window !== 'undefined') {
    const timeout = Date.now() + (timeoutMinutes * 60 * 1000);
    localStorage.setItem('auth-timeout', timeout.toString());
  }
};

export const checkAuthTimeout = () => {
  if (typeof window !== 'undefined') {
    const timeout = localStorage.getItem('auth-timeout');
    if (timeout && Date.now() > parseInt(timeout)) {
      clearAuth();
      return false;
    }
    return true;
  }
  return true;
};

// Validation Functions
export const isValidSession = () => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user) return false;
    
    // Check if session has timed out
    if (!checkAuthTimeout()) return false;
    
    return true;
  }
  return false;
};

export const validateAdminAccess = () => {
  if (typeof window !== 'undefined') {
    if (!isValidSession()) return false;
    return isAdmin();
  }
  return false;
};

// Quick Access Helpers
export const getCurrentUser = () => {
  return getUser();
};

export const getCurrentUserId = () => {
  const user = getUser();
  return user?._id || user?.id;
};

export const getCurrentUserEmail = () => {
  const user = getUser();
  return user?.email;
};

export const getCurrentUserName = () => {
  const user = getUser();
  return user?.name || user?.username;
};

// Debug and Development Helpers
export const debugAuth = () => {
  if (typeof window !== 'undefined') {
    const sessionInfo = getSessionInfo();
    console.log('🔐 Auth Debug Info:', sessionInfo);
    return sessionInfo;
  }
  return null;
};

// Export everything
export default {
  // Token Management
  setToken,
  getToken,
  getTokenType,
  removeToken,
  
  // User Management
  setUser,
  getUser,
  removeUser,
  
  // Admin Functions
  setAdminSession,
  getAdminSession,
  isAdmin,
  
  // Role & Permissions
  getUserRole,
  hasRole,
  hasAnyRole,
  getPermissions,
  hasPermission,
  
  // Session Management
  getSessionInfo,
  clearAuth,
  setAuthTimeout,
  checkAuthTimeout,
  
  // Validation
  isValidSession,
  validateAdminAccess,
  
  // Quick Access
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserEmail,
  getCurrentUserName,
  
  // Debug
  debugAuth
};