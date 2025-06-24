import React from 'react';

export const AdminUserManagement = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <p className="text-gray-600">User management functionality will be implemented here.</p>
      <div className="mt-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add User
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagement;