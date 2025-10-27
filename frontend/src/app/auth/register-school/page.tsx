'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SchoolRegistrationPage() {
  const router = useRouter();
  const { registerSchool } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    schoolLogo: '',
    officialPhone: '',
    whatsappNumber: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.schoolName || !formData.subdomain || !formData.adminEmail || 
        !formData.adminPassword || !formData.adminFirstName || !formData.adminLastName) {
      setError('All required fields must be filled');
      return false;
    }

    if (formData.adminPassword.length < 6) {
      setError('Admin password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail)) {
      setError('Please enter a valid admin email address');
      return false;
    }

    const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(formData.subdomain)) {
      setError('Subdomain must contain only lowercase letters, numbers, and hyphens');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await registerSchool({
        schoolName: formData.schoolName,
        schoolLogo: formData.schoolLogo || undefined,
        officialPhone: formData.officialPhone || undefined,
        whatsappNumber: formData.whatsappNumber || undefined,
        subdomain: formData.subdomain,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
      });
      
      setSuccess(true);
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push(`/auth/login?school=${formData.subdomain}`);
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register Your School
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your school account to get started with the School Management System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>
              Provide your school details. Note that the school name will be used for user login to identify your institution.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    School registered successfully! Redirecting to login page...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="Enter your school name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">School Subdomain *</Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      name="subdomain"
                      required
                      value={formData.subdomain}
                      onChange={handleChange}
                      placeholder="your-school-name"
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-4 flex items-center text-gray-500">
                      .educloud.com
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    This will be your school's unique URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolLogo">School Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="schoolLogo"
                      name="schoolLogo"
                      value={formData.schoolLogo}
                      onChange={handleChange}
                      placeholder="URL to your school logo"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officialPhone">Official Phone Number</Label>
                  <Input
                    id="officialPhone"
                    name="officialPhone"
                    value={formData.officialPhone}
                    onChange={handleChange}
                    placeholder="Enter official phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="Enter WhatsApp number"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name *</Label>
                    <Input
                      id="adminFirstName"
                      name="adminFirstName"
                      required
                      value={formData.adminFirstName}
                      onChange={handleChange}
                      placeholder="Admin first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name *</Label>
                    <Input
                      id="adminLastName"
                      name="adminLastName"
                      required
                      value={formData.adminLastName}
                      onChange={handleChange}
                      placeholder="Admin last name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="Admin email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password *</Label>
                    <Input
                      id="adminPassword"
                      name="adminPassword"
                      type="password"
                      required
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
                loadingText="Registering..."
                disabled={success}
              >
                Register School
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}