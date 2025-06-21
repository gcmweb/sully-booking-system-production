
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
  settings: {
    theme?: string;
    primaryColor?: string;
    showLogo?: boolean;
    allowedServices?: string[];
  };
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
    settings: {
      theme: 'light',
      primaryColor: '#3b82f6',
      showLogo: true,
      allowedServices: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
    },
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
          settings: {
            theme: 'light',
            primaryColor: '#3b82f6',
            showLogo: true,
            allowedServices: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
          },
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
                      value={newWidget.settings.theme} 
                      onValueChange={(value) => setNewWidget(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings, theme: value }
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
                      value={newWidget.settings.primaryColor}
                      onChange={(e) => setNewWidget(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings, primaryColor: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newWidget.settings.showLogo}
                    onCheckedChange={(checked) => setNewWidget(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, showLogo: checked }
                    }))}
                  />
                  <Label>Show Sully branding</Label>
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
        <Card className="text-center py-12">
          <CardContent>
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No widgets created yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first booking widget to embed on your website
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First Widget</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{widget.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(widget.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={widget.isActive ? "default" : "secondary"}>
                      {widget.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                        window.open(`${baseUrl}/api/widgets/${widget.id}/embed`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Code className="h-4 w-4 mr-1" />
                          Embed
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Embed Code</DialogTitle>
                          <DialogDescription>
                            Copy this code and paste it into your website where you want the booking form to appear
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="iframe" className="space-y-4">
                          <TabsList>
                            <TabsTrigger value="iframe">iFrame</TabsTrigger>
                            <TabsTrigger value="responsive">Responsive</TabsTrigger>
                          </TabsList>
                          <TabsContent value="iframe" className="space-y-4">
                            <div className="relative">
                              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-48 overflow-auto">
                                <pre className="text-sm whitespace-pre-wrap break-all font-mono">
                                  <code>{getEmbedCode(widget.id)}</code>
                                </pre>
                              </div>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(getEmbedCode(widget.id))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="responsive" className="space-y-4">
                            <div className="relative">
                              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-48 overflow-auto">
                                <pre className="text-sm whitespace-pre-wrap break-all font-mono">
                                  <code>{`<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
  <iframe 
    src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/widgets/${widget.id}/embed" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
    title="Booking Widget">
  </iframe>
</div>`}</code>
                                </pre>
                              </div>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(`<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;"><iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/widgets/${widget.id}/embed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" title="Booking Widget"></iframe></div>`)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Widget Settings</DialogTitle>
                          <DialogDescription>
                            Customize the appearance and behavior of your widget
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Widget Name</Label>
                            <Input
                              value={widget.name}
                              onChange={(e) => {
                                const updatedWidget = { ...widget, name: e.target.value };
                                setWidgets(prev => 
                                  prev.map(w => w.id === widget.id ? updatedWidget : w)
                                );
                              }}
                              onBlur={() => handleUpdateWidget(widget.id, { name: widget.name })}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={widget.isActive}
                              onCheckedChange={(checked) => {
                                const updatedWidget = { ...widget, isActive: checked };
                                setWidgets(prev => 
                                  prev.map(w => w.id === widget.id ? updatedWidget : w)
                                );
                                handleUpdateWidget(widget.id, { isActive: checked });
                              }}
                            />
                            <Label>Active</Label>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWidget(widget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
