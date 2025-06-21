'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Users, Search, Filter, MoreHorizontal, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../../hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  subscriptionStatus?: string;
  _count: {
    venues: number;
    bookings: number;
  };
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [user, currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        ));
        toast({
          title: 'User updated',
          description: `User has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
        });
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-red-600">Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-orange-600">Admin</Badge>;
      case 'VENUE_OWNER':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Venue Owner</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getSubscriptionBadge = (status?: string) => {
    if (!status || status === 'inactive') {
      return <Badge variant="outline">Free</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'trialing':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <Users className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">User Management</span>
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
            User Management
          </h1>
          <p className="text-gray-600">
            Manage all users, their roles, and account status
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="USER">Users</option>
              <option value="VENUE_OWNER">Venue Owners</option>
              <option value="ADMIN">Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Email Unverified</option>
            </select>
            
            <Button 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {loadingData ? 'Loading users...' : `${users.length} users found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                          <span className="text-orange-600 font-medium">
                            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {userData.firstName} {userData.lastName}
                            </h3>
                            {!userData.emailVerified && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                Unverified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Joined {formatDate(userData.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {userData._count.venues} venues • {userData._count.bookings} bookings
                            </span>
                            {userData.lastLoginAt && (
                              <span className="text-xs text-gray-500">
                                Last login: {formatDate(userData.lastLoginAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getRoleBadge(userData.role)}
                        {getSubscriptionBadge(userData.subscriptionStatus)}
                        
                        <Button
                          size="sm"
                          variant={userData.isActive ? "destructive" : "default"}
                          onClick={() => toggleUserStatus(userData.id, userData.isActive)}
                          disabled={updatingUser === userData.id || userData.id === user.id}
                          className={userData.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {updatingUser === userData.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : userData.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}