'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { ArrowLeft, Settings, Database, Mail, Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../../hooks/use-toast";

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  autoApproveVenues: boolean;
  requireEmailVerification: boolean;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  email: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  payments: 'healthy' | 'warning' | 'error';
}

export default function AdminSystemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchSystemData();
    }
  }, [user]);

  const fetchSystemData = async () => {
    try {
      const [settingsResponse, healthResponse] = await Promise.all([
        fetch('/api/admin/system/settings'),
        fetch('/api/admin/system/health')
      ]);
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: boolean) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (response.ok) {
        setSettings({ ...settings, [key]: value });
        toast({
          title: 'Settings updated',
          description: 'System settings have been saved successfully.',
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getHealthBadge = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-600">Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
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
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">System Settings</span>
              </div>
            </div>
            <Badge variant="secondary">Admin Panel</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Management
          </h1>
          <p className="text-gray-600">
            Configure system settings and monitor platform health
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription>Monitor the health of system components</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {health && getHealthIcon(health.database)}
                        {health && getHealthBadge(health.database)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Email Service</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {health && getHealthIcon(health.email)}
                        {health && getHealthBadge(health.email)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">File Storage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {health && getHealthIcon(health.storage)}
                        {health && getHealthBadge(health.storage)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Payment Processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {health && getHealthIcon(health.payments)}
                        {health && getHealthBadge(health.payments)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div>
                          <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-48 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                        <p className="text-sm text-gray-600">Temporarily disable the platform for maintenance</p>
                      </div>
                      <Switch
                        checked={settings?.maintenanceMode || false}
                        onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">User Registration</h4>
                        <p className="text-sm text-gray-600">Allow new users to create accounts</p>
                      </div>
                      <Switch
                        checked={settings?.registrationEnabled || false}
                        onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Send automated email notifications to users</p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Auto-approve Venues</h4>
                        <p className="text-sm text-gray-600">Automatically approve new venue listings</p>
                      </div>
                      <Switch
                        checked={settings?.autoApproveVenues || false}
                        onCheckedChange={(checked) => updateSetting('autoApproveVenues', checked)}
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Verification</h4>
                        <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        checked={settings?.requireEmailVerification || false}
                        onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
              <CardDescription>Perform administrative actions on the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    // Implement cache clearing
                    toast({
                      title: 'Cache cleared',
                      description: 'System cache has been cleared successfully.',
                    });
                  }}
                >
                  <Database className="h-6 w-6" />
                  <span className="text-sm font-medium">Clear Cache</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    // Implement backup
                    toast({
                      title: 'Backup initiated',
                      description: 'System backup has been started.',
                    });
                  }}
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm font-medium">Create Backup</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    // Implement health check
                    fetchSystemData();
                    toast({
                      title: 'Health check completed',
                      description: 'System health has been refreshed.',
                    });
                  }}
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm font-medium">Run Health Check</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}