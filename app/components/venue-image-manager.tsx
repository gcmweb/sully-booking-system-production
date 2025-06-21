
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Image as ImageIcon, Crown } from 'lucide-react';
import { useToast } from "../hooks/use-toast";
import ImageUpload from './image-upload';
import VenueImageGallery from './venue-image-gallery';

interface VenueImageManagerProps {
  venueId: string;
  currentLogo?: string;
  currentHeaderImage?: string;
  disabled?: boolean;
}

interface ImagePermissions {
  canUploadLogo: boolean;
  canUploadHeader: boolean;
  canUploadGallery: boolean;
  maxGalleryImages: number;
  plan: string;
}

export default function VenueImageManager({
  venueId,
  currentLogo,
  currentHeaderImage,
  disabled = false,
}: VenueImageManagerProps) {
  const [permissions, setPermissions] = useState<ImagePermissions | null>(null);
  const [logo, setLogo] = useState(currentLogo);
  const [headerImage, setHeaderImage] = useState(currentHeaderImage);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPermissions();
  }, [venueId]);

  const fetchPermissions = async () => {
    try {
      // We'll get permissions from the subscription check
      const response = await fetch(`/api/venues/${venueId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const plan = data.venue?.subscription?.plan || 'FREE';
        
        setPermissions({
          canUploadLogo: true,
          canUploadHeader: true,
          canUploadGallery: plan === 'PREMIUM' || plan === 'PAID',
          maxGalleryImages: plan === 'PREMIUM' || plan === 'PAID' ? 20 : 0,
          plan,
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/logo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ logoUrl: url }),
      });

      if (response.ok) {
        setLogo(url);
        toast({
          title: 'Logo updated',
          description: 'Your venue logo has been updated successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update logo');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to update logo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogoRemove = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}/logo`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setLogo(undefined);
        toast({
          title: 'Logo removed',
          description: 'Your venue logo has been removed.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove logo');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to remove logo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleHeaderImageUpload = async (url: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/header-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ headerImageUrl: url }),
      });

      if (response.ok) {
        setHeaderImage(url);
        toast({
          title: 'Header image updated',
          description: 'Your venue header image has been updated successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update header image');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to update header image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleHeaderImageRemove = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}/header-image`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHeaderImage(undefined);
        toast({
          title: 'Header image removed',
          description: 'Your venue header image has been removed.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove header image');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to remove header image',
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
            <span>Venue Images</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!permissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Venue Images</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load image permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Venue Images</span>
          <Badge variant="outline" className="flex items-center space-x-1">
            {permissions.plan === 'PREMIUM' || permissions.plan === 'PAID' ? (
              <>
                <Crown className="h-3 w-3" />
                <span>{permissions.plan}</span>
              </>
            ) : (
              <span>FREE</span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Logo & Header</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                onUpload={handleLogoUpload}
                currentImage={logo}
                onRemove={handleLogoRemove}
                disabled={disabled || !permissions.canUploadLogo}
                label="Venue Logo"
                description="Upload your venue logo (recommended: square format)"
                aspectRatio="aspect-square"
              />

              <ImageUpload
                onUpload={handleHeaderImageUpload}
                currentImage={headerImage}
                onRemove={handleHeaderImageRemove}
                disabled={disabled || !permissions.canUploadHeader}
                label="Header Image"
                description="Upload a header image for your venue profile"
                aspectRatio="aspect-video"
              />
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <VenueImageGallery
              venueId={venueId}
              canUpload={permissions.canUploadGallery}
              maxImages={permissions.maxGalleryImages}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
