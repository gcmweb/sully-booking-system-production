'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarDays, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuth } from '../../../components/auth-provider';
import { useToast } from '../../../hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'VENUE_OWNER',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to Sully. You can now start managing your venues.',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please check your information and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <CalendarDays className="h-10 w-10 text-orange-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Sully
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            Join thousands of venue owners and event organizers
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold text-center">
                Get started with Sully
              </CardTitle>
              <CardDescription className="text-center">
                Create your account to start managing venues and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'USER' })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.role === 'USER'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="h-5 w-5 mx-auto mb-1" />
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'VENUE_OWNER' })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.role === 'VENUE_OWNER'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building className="h-5 w-5 mx-auto mb-1" />
                      Venue Owner
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      Sign in to existing account
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-600">
            Need help? {' '}
            <Link href="/contact" className="text-orange-600 hover:text-orange-500">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}