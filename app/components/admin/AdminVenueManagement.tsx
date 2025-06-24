import React from 'react';

export const AdminVenueManagement = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Venue Management</h2>
      <p className="text-gray-600">Venue management functionality will be implemented here.</p>
      <div className="mt-4">
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add Venue
        </button>
      </div>
    </div>
  );
};

export default AdminVenueManagement;