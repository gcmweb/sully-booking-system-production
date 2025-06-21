
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/alert-dialog";
import { Building, Search, Filter, Eye, Edit, Trash2, ArrowLeft, ChevronLeft, ChevronRight, MapPin, Users, Calendar, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  venueType: string;
  capacity: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    bookings: number;
    tables: number;
    events: number;
  };
  subscription?: {
    plan: string;
    status: string;
  };
}

interface VenuesPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminVenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [pagination, setPagination] = useState<VenuesPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchVenues();
    }
  }, [user, pagination.page, typeFilter, statusFilter]);

  const fetchVenues = async () => {
    try {
      setLoadingData(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/venues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to fetch venues');
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      toast.error('Failed to fetch venues');
    } finally {
      setLoadingData(false);
    }
  };

  const toggleVenueStatus = async (venueId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Venue ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchVenues();
      } else {
        toast.error('Failed to update venue status');
      }
    } catch (error) {
      console.error('Failed to toggle venue status:', error);
      toast.error('Failed to update venue status');
    }
  };

  const toggleFeaturedStatus = async (venueId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch('/api/admin/venues/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          venueId, 
          featured: !currentFeatured 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchVenues();
      } else {
        toast.error(data.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const deleteVenue = async (venueId: string) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Venue deleted successfully');
        fetchVenues();
        setShowDeleteDialog(false);
        setVenueToDelete(null);
      } else {
        toast.error('Failed to delete venue');
      }
    } catch (error) {
      console.error('Failed to delete venue:', error);
      toast.error('Failed to delete venue');
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.owner.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVenueTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'RESTAURANT':
        return 'bg-blue-100 text-blue-800';
      case 'CAFE':
        return 'bg-green-100 text-green-800';
      case 'BAR':
        return 'bg-purple-100 text-purple-800';
      case 'PUB':
        return 'bg-orange-100 text-orange-800';
      case 'FINE_DINING':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-xl font-semibold text-gray-900">Venue Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search venues by name, city, or owner..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                      <SelectItem value="CAFE">Cafe</SelectItem>
                      <SelectItem value="BAR">Bar</SelectItem>
                      <SelectItem value="PUB">Pub</SelectItem>
                      <SelectItem value="FINE_DINING">Fine Dining</SelectItem>
                      <SelectItem value="FAST_CASUAL">Fast Casual</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Venues Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Venues ({pagination.total})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Bookings</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVenues.map((venue) => (
                          <TableRow key={venue.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{venue.name}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {venue.city}, {venue.postcode}
                                </div>
                                <div className="text-sm text-gray-500">{venue.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {venue.owner.firstName} {venue.owner.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{venue.owner.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getVenueTypeBadgeColor(venue.venueType)}>
                                {venue.venueType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={venue.isActive ? 'default' : 'destructive'}>
                                {venue.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={venue.featured ? 'default' : 'outline'}
                                  className={venue.featured ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                                >
                                  <Star className={`h-3 w-3 mr-1 ${venue.featured ? 'fill-current' : ''}`} />
                                  {venue.featured ? 'Featured' : 'Not Featured'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-gray-400" />
                                {venue.capacity}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {venue._count.bookings}
                              </div>
                            </TableCell>
                            <TableCell>
                              {venue.subscription ? (
                                <Badge variant={venue.subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {venue.subscription.plan}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Free</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVenue(venue);
                                    setShowVenueDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={venue.featured ? 'outline' : 'default'}
                                  size="sm"
                                  onClick={() => toggleFeaturedStatus(venue.id, venue.featured)}
                                  className={venue.featured ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' : ''}
                                >
                                  <Star className={`h-4 w-4 ${venue.featured ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  variant={venue.isActive ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={() => toggleVenueStatus(venue.id, venue.isActive)}
                                >
                                  {venue.isActive ? 'Disable' : 'Enable'}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setVenueToDelete(venue);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} venues
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={pagination.page === pagination.pages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Venue Details Dialog */}
      <Dialog open={showVenueDialog} onOpenChange={setShowVenueDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Venue Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected venue
            </DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm">{selectedVenue.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Slug</label>
                  <p className="text-sm">{selectedVenue.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge className={getVenueTypeBadgeColor(selectedVenue.venueType)}>
                    {selectedVenue.venueType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={selectedVenue.isActive ? 'default' : 'destructive'}>
                    {selectedVenue.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Featured</label>
                  <Badge 
                    variant={selectedVenue.featured ? 'default' : 'outline'}
                    className={selectedVenue.featured ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                  >
                    <Star className={`h-3 w-3 mr-1 ${selectedVenue.featured ? 'fill-current' : ''}`} />
                    {selectedVenue.featured ? 'Featured' : 'Not Featured'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacity</label>
                  <p className="text-sm">{selectedVenue.capacity} people</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{selectedVenue.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{selectedVenue.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{new Date(selectedVenue.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm">{selectedVenue.address}, {selectedVenue.city}, {selectedVenue.postcode}</p>
              </div>
              
              {selectedVenue.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm">{selectedVenue.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Bookings</label>
                  <p className="text-2xl font-bold">{selectedVenue._count.bookings}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tables</label>
                  <p className="text-2xl font-bold">{selectedVenue._count.tables}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Events</label>
                  <p className="text-2xl font-bold">{selectedVenue._count.events}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Owner</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{selectedVenue.owner.firstName} {selectedVenue.owner.lastName}</p>
                  <p className="text-sm text-gray-600">{selectedVenue.owner.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVenueDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{venueToDelete?.name}"? 
              This action cannot be undone and will also delete all associated bookings, tables, and events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVenueToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => venueToDelete && deleteVenue(venueToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
