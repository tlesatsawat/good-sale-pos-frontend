import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PackageSelection from './components/PackageSelection';
import Dashboard from './components/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import './App.css';

// Main App Content Component
const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // login, register, packages
  const [registrationData, setRegistrationData] = useState(null);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Authentication flow for non-logged-in users
  const handleRegistrationSuccess = (data) => {
    setRegistrationData(data);
    setCurrentView('packages');
  };

  const handlePackageSelected = (subscription) => {
    // After package selection, user will be redirected to dashboard
    // The useAuth hook will automatically detect the logged-in user
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">GOOD SALE POS</h1>
          <p className="text-gray-600">ระบบขายหน้าร้านครบครัน</p>
          <p className="text-sm text-orange-500 font-medium">Good choice for restaurant</p>
        </div>

        {/* Main Content */}
        {currentView === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )}

        {currentView === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        )}

        {currentView === 'packages' && registrationData && (
          <Card className="w-full good-sale-card">
            <CardContent className="p-6">
              <PackageSelection
                posType={registrationData.pos_type}
                onPackageSelected={handlePackageSelected}
              />
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2025 GOOD SALE POS. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

