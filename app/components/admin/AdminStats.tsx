import React from 'react';

export const AdminStats = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-500">Total Bookings</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;