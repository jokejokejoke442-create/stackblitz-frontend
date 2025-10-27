'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    password: '',
  });
  const [isMagicLinkLogin, setIsMagicLinkLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Check if this is a magic link login
  useEffect(() => {
    const school = searchParams.get('school');
    if (school) {
      setFormData(prev => ({ ...prev, schoolName: school }));
      setIsMagicLinkLogin(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.schoolName || !formData.email || !formData.password) {
      setError('Please enter school name, email, and password');
      return;
    }

    try {
      await login(formData);
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isMagicLinkLogin ? 'Complete Your Login' : 'Sign in to your account'}
          </h2>
          {!isMagicLinkLogin && (
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link
                href="/auth/register-school"
                className="font-medium text-primary hover:text-primary/80"
              >
                register your school
              </Link>
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              {isMagicLinkLogin 
                ? 'Enter your credentials to access the School Management System' 
                : 'Enter your school name and credentials to access the system'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="schoolName">
                  {isMagicLinkLogin ? 'School' : 'School Name *'}
                </Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  required={!isMagicLinkLogin}
                  disabled={isMagicLinkLogin}
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder={isMagicLinkLogin ? 'Your school' : 'Enter your school name (e.g. "demo")'}
                />
                {isMagicLinkLogin && (
                  <p className="text-sm text-gray-500">
                    This field is pre-filled from your invitation link
                  </p>
                )}
                {!isMagicLinkLogin && (
                  <p className="text-sm text-gray-500">
                    For demo access, use school name: <strong>demo</strong>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email (e.g. admin@demo.educloud.com)"
                />
                <p className="text-sm text-gray-500">
                  Demo accounts: admin@demo.educloud.com, teacher@demo.educloud.com, 
                  parent@demo.educloud.com, student@demo.educloud.com
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password (demo password: demo123)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </Label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
                loadingText="Signing in..."
                disabled={!loading && ((isMagicLinkLogin && !formData.email) || (!isMagicLinkLogin && (!formData.schoolName || !formData.email || !formData.password)))}
              >
                Sign in
              </Button>
                            
              {!isMagicLinkLogin && (
                <div className="text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/register-school" 
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Register your school
                  </Link>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p className="font-bold mb-2">Demo Credentials:</p>
          <p><strong>School Name:</strong> demo</p>
          <p><strong>Admin:</strong> admin@demo.educloud.com / demo123</p>
          <p><strong>Teacher:</strong> teacher@demo.educloud.com / demo123</p>
          <p><strong>Parent:</strong> parent@demo.educloud.com / demo123</p>
          <p><strong>Student:</strong> student@demo.educloud.com / demo123</p>
        </div>
      </div>
    </div>
  );
}