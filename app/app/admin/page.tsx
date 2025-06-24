import { Suspense } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminVenueManagement } from '@/components/admin/AdminVenueManagement';
import { AdminSystemSettings } from '@/components/admin/AdminSystemSettings';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading stats...</div>}>
          <AdminStats />
        </Suspense>
        
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <AdminDashboard />
        </Suspense>
      </div>
      
      <div className="mt-8 space-y-8">
        <Suspense fallback={<div>Loading user management...</div>}>
          <AdminUserManagement />
        </Suspense>
        
        <Suspense fallback={<div>Loading venue management...</div>}>
          <AdminVenueManagement />
        </Suspense>
        
        <Suspense fallback={<div>Loading system settings...</div>}>
          <AdminSystemSettings />
        </Suspense>
      </div>
    </div>
  );
}