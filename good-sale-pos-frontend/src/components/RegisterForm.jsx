import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const RegisterForm = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    pos_type: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: '',
      });
    }
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      pos_type: value,
    });
    if (validationErrors.pos_type) {
      setValidationErrors({
        ...validationErrors,
        pos_type: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'กรุณากรอกชื่อผู้ใช้';
    }

    if (!formData.email.trim()) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'กรุณากรอกเบอร์โทรศัพท์';
    }

    if (!formData.pos_type) {
      errors.pos_type = 'กรุณาเลือกประเภทร้าน';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    
    if (result.success) {
      onRegistrationSuccess(result.data);
    }
  };

  const posTypeOptions = [
    { value: 'restaurant', label: 'ร้านตามสั่ง' },
    { value: 'coffee', label: 'ร้านกาแฟ' },
    { value: 'grocery', label: 'ร้านขายของชำ' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">สมัครสมาชิก</CardTitle>
        <CardDescription>
          สร้างบัญชีใหม่เพื่อเริ่มใช้งาน GOOD SALE POS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="กรอกชื่อผู้ใช้"
              className={validationErrors.username ? 'border-destructive' : ''}
            />
            {validationErrors.username && (
              <p className="text-sm text-destructive">{validationErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="กรอกอีเมล"
              className={validationErrors.email ? 'border-destructive' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">เบอร์โทรศัพท์</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="กรอกเบอร์โทรศัพท์"
              className={validationErrors.phone_number ? 'border-destructive' : ''}
            />
            {validationErrors.phone_number && (
              <p className="text-sm text-destructive">{validationErrors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pos_type">ประเภทร้าน</Label>
            <Select onValueChange={handleSelectChange} value={formData.pos_type}>
              <SelectTrigger className={validationErrors.pos_type ? 'border-destructive' : ''}>
                <SelectValue placeholder="เลือกประเภทร้าน" />
              </SelectTrigger>
              <SelectContent>
                {posTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.pos_type && (
              <p className="text-sm text-destructive">{validationErrors.pos_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่าน"
                className={validationErrors.password ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-destructive">{validationErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="ยืนยันรหัสผ่าน"
                className={validationErrors.confirmPassword ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              'สมัครสมาชิก'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <div className="text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{' '}
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="p-0 h-auto font-normal"
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;

