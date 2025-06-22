
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Code, Copy, Eye, Settings, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from "../../../hooks/use-toast";
import { motion } from 'framer-motion';

interface Widget {
  id: string;
  name: string;
  isActive: boolean;
  embedCode: string;
  theme: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  allowGuestBooking: boolean;
  requirePhone: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  customCss?: string;
  createdAt: string;
}

interface Venue {
  id: string;
  name: string;
}

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [newWidget, setNewWidget] = useState({
    name: '',
    venueId: '',
    theme: 'light',
    primaryColor: '#3b82f6',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    allowGuestBooking: true,
    requirePhone: false,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWidgets();
    fetchVenues();
  }, []);

  const fetchWidgets = async () => {
    try {
      const response = await fetch('/api/widgets');
      if (response.ok) {
        const data = await response.json();
        setWidgets(data.widgets);
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWidget),
      });

      if (response.ok) {
        const data = await response.json();
        setWidgets(prev => [...prev, data.widget]);
        setNewWidget({
          name: '',
          venueId: '',
          theme: 'light',
          primaryColor: '#3b82f6',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          allowGuestBooking: true,
          requirePhone: false,
          maxAdvanceBooking: 30,
          minAdvanceBooking: 1,
        });
        toast({
          title: 'Widget created',
          description: 'Your booking widget has been created successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create widget');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateWidget = async (widgetId: string, updates: any) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setWidgets(prev => 
          prev.map(widget => 
            widget.id === widgetId ? data.widget : widget
          )
        );
        toast({
          title: 'Widget updated',
          description: 'Your widget settings have been saved.',
        });
      } else {
        throw new Error('Failed to update widget');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;

    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
        toast({
          title: 'Widget deleted',
          description: 'The widget has been deleted successfully.',
        });
      } else {
        throw new Error('Failed to delete widget');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard.',
    });
  };

  const getEmbedCode = (widgetId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<iframe 
  src="${baseUrl}/api/widgets/${widgetId}/embed" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); min-height: 600px; max-width: 100%;"
  title="Booking Widget">
</iframe>`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Widgets</h1>
          <p className="text-gray-600">Create embeddable booking forms for your website</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Widget</DialogTitle>
              <DialogDescription>
                Create a customizable booking widget that you can embed on your website
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWidget} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widgetName">Widget Name</Label>
                  <Input
                    id="widgetName"
                    placeholder="Main Website Widget"
                    value={newWidget.name}
                    onChange={(e) => setNewWidget(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venueSelect">Venue</Label>
                  <Select 
                    value={newWidget.venueId} 
                    onValueChange={(value) => setNewWidget(prev => ({ ...prev, venueId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map(venue => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={newWidget.theme} 
                      onValueChange={(value) => setNewWidget(prev => ({ 
                        ...prev, 
                        theme: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      type="color"
                      value={newWidget.primaryColor}
                      onChange={(e) => setNewWidget(prev => ({ 
                        ...prev, 
                        primaryColor: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newWidget.allowGuestBooking}
                    onCheckedChange={(checked) => setNewWidget(prev => ({ 
                      ...prev, 
                      allowGuestBooking: checked
                    }))}
                  />
                  <Label>Allow Guest Booking</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Widget'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {widgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Code className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
            <p className="text-gray-500 text-center mb-6">
              Create your first booking widget to start accepting reservations on your website.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Widget
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{widget.name}</CardTitle>
                    <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                      {widget.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {new Date(widget.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: widget.primaryColor }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {widget.theme === 'dark' ? 'Dark' : 'Light'} theme
                    </span>
                  </div>
                  
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="embed">Embed Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="space-y-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`/api/widgets/${widget.id}/embed`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWidget(widget)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteWidget(widget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="embed" className="space-y-2">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <code className="text-xs text-gray-700 break-all">
                          {getEmbedCode(widget.id).substring(0, 100)}...
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => copyToClipboard(getEmbedCode(widget.id))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Embed Code
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Widget Settings Dialog */}
      {selectedWidget && (
        <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Widget: {selectedWidget.name}</DialogTitle>
              <DialogDescription>
                Customize your booking widget settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Widget Name</Label>
                  <Input
                    value={selectedWidget.name}
                    onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={selectedWidget.theme}
                    onValueChange={(value) => setSelectedWidget(prev => prev ? { ...prev, theme: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={selectedWidget.primaryColor}
                    onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, primaryColor: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={selectedWidget.backgroundColor}
                    onChange={(e) => setSelectedWidget(prev => prev ? { ...prev, backgroundColor: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedWidget.allowGuestBooking}
                    onCheckedChange={(checked) => setSelectedWidget(prev => prev ? { ...prev, allowGuestBooking: checked } : null)}
                  />
                  <Label>Allow Guest Booking</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedWidget.requirePhone}
                    onCheckedChange={(checked) => setSelectedWidget(prev => prev ? { ...prev, requirePhone: checked } : null)}
                  />
                  <Label>Require Phone Number</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedWidget(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (selectedWidget) {
                    handleUpdateWidget(selectedWidget.id, {
                      name: selectedWidget.name,
                      theme: selectedWidget.theme,
                      primaryColor: selectedWidget.primaryColor,
                      backgroundColor: selectedWidget.backgroundColor,
                      allowGuestBooking: selectedWidget.allowGuestBooking,
                      requirePhone: selectedWidget.requirePhone,
                    });
                    setSelectedWidget(null);
                  }
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
