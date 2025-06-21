
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import { ArrowLeft, Settings, Database, Mail, Shield, Globe, Server } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  maxVenuesPerUser: number;
  defaultSubscriptionPlan: string;
  systemNotifications: boolean;
}

export default function AdminSystemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Sully Booking System',
    siteDescription: 'Professional venue booking and management platform',
    supportEmail: 'support@sully.com',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxVenuesPerUser: 5,
    defaultSubscriptionPlan: 'FREE',
    systemNotifications: true,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchSystemSettings();
    }
  }, [user]);

  const fetchSystemSettings = async () => {
    try {
      setLoadingData(true);
      const response = await fetch('/api/admin/system/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        toast.success('System settings saved successfully');
      } else {
        toast.error('Failed to save system settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/admin/system/cache', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('System cache cleared successfully');
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const runDatabaseMaintenance = async () => {
    try {
      const response = await fetch('/api/admin/system/maintenance', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Database maintenance completed successfully');
      } else {
        toast.error('Failed to run database maintenance');
      }
    } catch (error) {
      console.error('Failed to run maintenance:', error);
      toast.error('Failed to run database maintenance');
    }
  };

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>Configure basic system information and branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security & Access Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security & Access</span>
                  </CardTitle>
                  <CardDescription>Configure user registration and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable the platform for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow New Registrations</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register for accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowRegistrations}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistrations: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to verify their email before accessing the platform
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system notifications to administrators
                      </p>
                    </div>
                    <Switch
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, systemNotifications: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Platform Limits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Platform Limits</span>
                  </CardTitle>
                  <CardDescription>Configure platform usage limits and defaults</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxVenues">Max Venues Per User</Label>
                      <Input
                        id="maxVenues"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxVenuesPerUser}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxVenuesPerUser: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultPlan">Default Subscription Plan</Label>
                      <select
                        id="defaultPlan"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={settings.defaultSubscriptionPlan}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultSubscriptionPlan: e.target.value }))}
                      >
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Maintenance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>System Maintenance</span>
                  </CardTitle>
                  <CardDescription>Perform system maintenance tasks and optimizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={clearCache}
                      className="flex items-center space-x-2"
                    >
                      <Database className="h-4 w-4" />
                      <span>Clear System Cache</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={runDatabaseMaintenance}
                      className="flex items-center space-x-2"
                    >
                      <Database className="h-4 w-4" />
                      <span>Run Database Maintenance</span>
                    </Button>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Maintenance operations may temporarily affect system performance. 
                      It's recommended to run these during low-traffic periods.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-end"
            >
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="px-8"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
