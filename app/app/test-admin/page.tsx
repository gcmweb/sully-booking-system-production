
'use client';

import { useState, useEffect } from 'react';

export default function TestAdminPage() {
  const [status, setStatus] = useState<string[]>([]);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  useEffect(() => {
    testAdminAccess();
  }, []);

  const testAdminAccess = async () => {
    try {
      // First, login
      addStatus('Logging in...');
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'joncalvert2018@outlook.com',
          password: 'password123'
        })
      });

      if (loginResponse.ok) {
        addStatus('✅ Login successful');

        // Test admin stats API
        const statsResponse = await fetch('/api/admin/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          addStatus('✅ Admin stats API working');
          addStatus(`Stats: ${stats.stats.totalUsers} users, ${stats.stats.totalVenues} venues`);
        } else {
          addStatus(`❌ Admin stats API failed: ${statsResponse.status}`);
        }

        // Test admin users API
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          addStatus('✅ Admin users API working');
        } else {
          addStatus(`❌ Admin users API failed: ${usersResponse.status}`);
        }

        // Test admin venues API
        const venuesResponse = await fetch('/api/admin/venues');
        if (venuesResponse.ok) {
          addStatus('✅ Admin venues API working');
        } else {
          addStatus(`❌ Admin venues API failed: ${venuesResponse.status}`);
        }

        // Test admin analytics API
        const analyticsResponse = await fetch('/api/admin/analytics');
        if (analyticsResponse.ok) {
          addStatus('✅ Admin analytics API working');
        } else {
          addStatus(`❌ Admin analytics API failed: ${analyticsResponse.status}`);
        }

      } else {
        addStatus(`❌ Login failed: ${loginResponse.status}`);
      }

    } catch (error: any) {
      addStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Test Results</h2>
          <div className="space-y-2">
            {status.map((message, index) => (
              <div key={index} className="text-sm font-mono">
                {message}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Panel Links</h2>
          <div className="space-y-2">
            <div>
              <a 
                href="/admin" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open Admin Dashboard
              </a>
            </div>
            <div>
              <a 
                href="/admin/users" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open Admin Users
              </a>
            </div>
            <div>
              <a 
                href="/admin/venues" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open Admin Venues
              </a>
            </div>
            <div>
              <a 
                href="/admin/analytics" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open Admin Analytics
              </a>
            </div>
            <div>
              <a 
                href="/admin/system" 
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open Admin System Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
