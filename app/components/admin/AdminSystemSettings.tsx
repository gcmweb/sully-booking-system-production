import React from 'react';

export const AdminSystemSettings = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
      <p className="text-gray-600">System settings will be implemented here.</p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center">
          <input type="checkbox" id="maintenance" className="mr-2" />
          <label htmlFor="maintenance" className="text-sm">Maintenance Mode</label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="notifications" className="mr-2" />
          <label htmlFor="notifications" className="text-sm">Email Notifications</label>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;