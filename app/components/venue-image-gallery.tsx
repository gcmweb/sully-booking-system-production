
'use client';

import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useToast } from "../hooks/use-toast";
import Image from 'next/image';
import { ImageUpload } from "./image-upload";

interface VenueImage {
  id: string;
  url: string;
  alt: string | null;
  type: string;
  displayOrder: number;
  isActive: boolean;
}

interface VenueImageGalleryProps {
  venueId: string;
  canUpload: boolean;
  maxImages: number;
  disabled?: boolean;
}

const imageTypes = [
  { value: 'MENU', label: 'Menu' },
  { value: 'FOOD', label: 'Food' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'EVENT', label: 'Event' },
  { value: 'OTHER', label: 'Other' },
];

export default function VenueImageGallery({
  venueId,
  canUpload,
  maxImages,
  disabled = false,
}: VenueImageGalleryProps) {
  const [images, setImages] = useState<VenueImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<VenueImage | null>(null);
  const [newImageData, setNewImageData] = useState({
    url: '',
    alt: '',
    type: 'FOOD',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [venueId]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}/images`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        console.error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    setNewImageData(prev => ({ ...prev, url }));
  };

  const handleAddImage = async () => {
    if (!newImageData.url || !newImageData.type) {
      toast({
        title: 'Missing information',
        description: 'Please upload an image and select a type.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(`/api/venues/${venueId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url: newImageData.url,
          alt: newImageData.alt,
          type: newImageData.type,
          displayOrder: images.length,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImages(prev => [...prev, data.image]);
        setNewImageData({ url: '', alt: '', type: 'FOOD' });
        setShowAddDialog(false);
        
        toast({
          title: 'Image added',
          description: 'Your image has been added to the gallery.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add image');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to add image',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        toast({
          title: 'Image deleted',
          description: 'The image has been removed from your gallery.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to delete image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    try {
      const response = await fetch(`/api/venues/${venueId}/images/${editingImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          alt: editingImage.alt,
          type: editingImage.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImages(prev => prev.map(img => 
          img.id === editingImage.id ? data.image : img
        ));
        setEditingImage(null);
        
        toast({
          title: 'Image updated',
          description: 'Your image details have been updated.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update image');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to update image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Image Gallery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canUpload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Image Gallery</span>
            <Badge variant="outline">Premium Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-gray-600 mb-4">
              Upload gallery images to showcase your venue, menu, and atmosphere with a Premium subscription.
            </p>
            <Button>Upgrade Now</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Image Gallery</span>
              <Badge variant="secondary">{images.length}/{maxImages}</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Showcase your venue with beautiful images
            </p>
          </div>
          {images.length < maxImages && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button disabled={disabled}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <ImageUpload
                    onUpload={handleImageUpload}
                    currentImage={newImageData.url}
                    onRemove={() => setNewImageData(prev => ({ ...prev, url: '' }))}
                    disabled={uploading}
                    aspectRatio="aspect-video"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageType">Image Type</Label>
                      <Select
                        value={newImageData.type}
                        onValueChange={(value) => setNewImageData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select image type" />
                        </SelectTrigger>
                        <SelectContent>
                          {imageTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imageAlt">Description (Optional)</Label>
                      <Input
                        id="imageAlt"
                        placeholder="Describe the image..."
                        value={newImageData.alt}
                        onChange={(e) => setNewImageData(prev => ({ ...prev, alt: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddImage}
                      disabled={uploading || !newImageData.url}
                    >
                      {uploading ? 'Adding...' : 'Add Image'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No images yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your gallery by adding your first image
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt || 'Venue image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {imageTypes.find(t => t.value === image.type)?.label || image.type}
                  </Badge>
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingImage(image)}
                      disabled={disabled}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src={editingImage.url}
                  alt={editingImage.alt || 'Venue image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editImageType">Image Type</Label>
                  <Select
                    value={editingImage.type}
                    onValueChange={(value) => setEditingImage(prev => prev ? { ...prev, type: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editImageAlt">Description</Label>
                  <Input
                    id="editImageAlt"
                    placeholder="Describe the image..."
                    value={editingImage.alt || ''}
                    onChange={(e) => setEditingImage(prev => prev ? { ...prev, alt: e.target.value } : null)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateImage}>
                  Update Image
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
