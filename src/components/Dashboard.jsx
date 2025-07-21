import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { storeAPI, packageAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Store, 
  Plus, 
  Settings, 
  BarChart3, 
  Package, 
  Power,
  PowerOff,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [storesResponse, subscriptionResponse] = await Promise.all([
        storeAPI.getStores(),
        packageAPI.getCurrentSubscription(),
      ]);
      
      setStores(storesResponse.data.stores);
      setSubscription(subscriptionResponse.data.subscription);
    } catch (error) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreToggle = async (storeId, isOpen) => {
    try {
      if (isOpen) {
        await storeAPI.closeStore(storeId);
      } else {
        await storeAPI.openStore(storeId);
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      setError('ไม่สามารถเปลี่ยนสถานะร้านได้');
    }
  };

  const getStoreTypeLabel = (type) => {
    const labels = {
      restaurant: 'ร้านตามสั่ง',
      coffee: 'ร้านกาแฟ',
      grocery: 'ร้านขายของชำ',
    };
    return labels[type] || type;
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'ไม่มีแพ็กเกจ';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return 'หมดอายุ';
    if (daysLeft <= 7) return `เหลือ ${daysLeft} วัน`;
    return 'ใช้งานได้';
  };

  const getSubscriptionStatusVariant = () => {
    if (!subscription) return 'secondary';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return 'destructive';
    if (daysLeft <= 7) return 'destructive';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">GOOD SALE POS</h1>
              <p className="text-muted-foreground">ยินดีต้อนรับ, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              {subscription && (
                <Badge variant={getSubscriptionStatusVariant()}>
                  <Package className="w-3 h-3 mr-1" />
                  {subscription.package?.name} - {getSubscriptionStatus()}
                </Badge>
              )}
              <Button variant="outline" onClick={logout}>
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Subscription Info */}
        {subscription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                แพ็กเกจปัจจุบัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">แพ็กเกจ</p>
                  <p className="font-semibold">{subscription.package?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันที่หมดอายุ</p>
                  <p className="font-semibold">
                    {new Date(subscription.end_date).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">สถานะ</p>
                  <Badge variant={getSubscriptionStatusVariant()}>
                    {getSubscriptionStatus()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stores Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">ร้านของคุณ</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มร้านใหม่
            </Button>
          </div>

          {stores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีร้าน</h3>
                <p className="text-muted-foreground mb-4">
                  เริ่มต้นโดยการสร้างร้านแรกของคุณ
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างร้านแรก
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <Badge variant={store.is_open ? 'default' : 'secondary'}>
                        {store.is_open ? 'เปิด' : 'ปิด'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {getStoreTypeLabel(store.pos_type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {store.address && (
                        <p className="text-sm text-muted-foreground">
                          📍 {store.address}
                        </p>
                      )}
                      {store.phone_number && (
                        <p className="text-sm text-muted-foreground">
                          📞 {store.phone_number}
                        </p>
                      )}
                      
                      <Separator />
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={store.is_open ? 'destructive' : 'default'}
                          onClick={() => handleStoreToggle(store.id, store.is_open)}
                          className="flex-1"
                        >
                          {store.is_open ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-1" />
                              ปิดร้าน
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-1" />
                              เปิดร้าน
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          รายงาน
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          ขาย
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {stores.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">สถิติรวม</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ร้านทั้งหมด</p>
                      <p className="text-2xl font-bold">{stores.length}</p>
                    </div>
                    <Store className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ร้านที่เปิด</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stores.filter(s => s.is_open).length}
                      </p>
                    </div>
                    <Power className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ร้านที่ปิด</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {stores.filter(s => !s.is_open).length}
                      </p>
                    </div>
                    <PowerOff className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">วันนี้</p>
                      <p className="text-2xl font-bold">
                        {new Date().toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

