import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const handleError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.response.status === 403) {
        errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงระบบนี้';
      } else if (error.response.status === 404) {
        errorMessage = 'ไม่พบข้อมูลที่ต้องการ';
      } else if (error.response.status === 422) {
        errorMessage = error.response.data?.error || 'ข้อมูลที่กรอกไม่ถูกต้อง';
      } else if (error.response.status >= 500) {
        errorMessage = 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
      } else {
        errorMessage = error.response.data?.error || defaultMessage;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    } else {
      // Other error
      errorMessage = error.message || defaultMessage;
    }
    
    setError(errorMessage);
    return errorMessage;
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      // Don't show error for initial auth check
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      clearError();
      setLoading(true);
      
      // Basic validation
      if (!credentials.username || !credentials.password) {
        throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      }
      
      const response = await authAPI.login(credentials);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleError(error, 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      clearError();
      setLoading(true);
      
      // Basic validation
      if (!userData.email || !userData.password || !userData.business_name) {
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
      }
      
      if (userData.password !== userData.confirmPassword) {
        throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      }
      
      const response = await authAPI.register(userData);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleError(error, 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Don't show error for logout
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      clearError();
      setLoading(true);
      
      if (!email) {
        throw new Error('กรุณากรอกอีเมล');
      }
      
      const response = await authAPI.forgotPassword(email);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleError(error, 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data) => {
    try {
      clearError();
      setLoading(true);
      
      if (!data.password || !data.confirmPassword) {
        throw new Error('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
      }
      
      if (data.password !== data.confirmPassword) {
        throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      }
      
      const response = await authAPI.resetPassword(data);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleError(error, 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      clearError();
      setLoading(true);
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleError(error, 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isInitialized,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

