import { useState, useEffect } from 'react';
import { packageAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, Star } from 'lucide-react';

const PackageSelection = ({ posType, onPackageSelected }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, [posType]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageAPI.getPackages(posType);
      setPackages(response.data.packages);
    } catch (error) {
      setError('ไม่สามารถโหลดข้อมูลแพ็กเกจได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (packageId) => {
    try {
      setSubscribing(packageId);
      setError(null);
      const response = await packageAPI.subscribe(packageId);
      onPackageSelected(response.data.subscription);
    } catch (error) {
      setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครแพ็กเกจ');
    } finally {
      setSubscribing(null);
    }
  };

  const getPackageTypeLabel = (type) => {
    const labels = {
      restaurant: 'ร้านตามสั่ง',
      coffee: 'ร้านกาแฟ',
      grocery: 'ร้านขายของชำ',
    };
    return labels[type] || type;
  };

  const getPopularPackage = () => {
    // Assume the middle-priced package is most popular
    if (packages.length >= 3) {
      const sortedByPrice = [...packages].sort((a, b) => a.price - b.price);
      return sortedByPrice[1]?.id;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">กำลังโหลดแพ็กเกจ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const popularPackageId = getPopularPackage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary">เลือกแพ็กเกจ</h2>
        <p className="text-muted-foreground mt-2">
          เลือกแพ็กเกจที่เหมาะสมสำหรับ{getPackageTypeLabel(posType)}ของคุณ
        </p>
      </div>

      {packages.length === 0 ? (
        <Alert>
          <AlertDescription>
            ยังไม่มีแพ็กเกจสำหรับประเภทร้านนี้ กรุณาติดต่อผู้ดูแลระบบ
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${
                pkg.id === popularPackageId ? 'border-primary shadow-lg' : ''
              }`}
            >
              {pkg.id === popularPackageId && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    แนะนำ
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-primary">
                    ฿{pkg.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    /{pkg.duration === 'monthly' ? 'เดือน' : 'ปี'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">ฟีเจอร์ที่รวมอยู่:</h4>
                  <ul className="space-y-1">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feature) => (
                        <li key={feature.id} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">
                        ฟีเจอร์พื้นฐานทั้งหมด
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(pkg.id)}
                  disabled={subscribing === pkg.id}
                  variant={pkg.id === popularPackageId ? 'default' : 'outline'}
                >
                  {subscribing === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังสมัคร...
                    </>
                  ) : (
                    'เลือกแพ็กเกจนี้'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>สามารถเปลี่ยนแพ็กเกจได้ในภายหลัง</p>
        <p>ทุกแพ็กเกจรวมการสนับสนุนลูกค้าและการอัปเดตระบบ</p>
      </div>
    </div>
  );
};

export default PackageSelection;

