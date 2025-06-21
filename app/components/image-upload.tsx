'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const newUrls = [...value, ...uploadedUrls].slice(0, maxFiles);
      onChange(newUrls);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFiles, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - value.length,
    disabled: disabled || uploading || value.length >= maxFiles
  });

  const removeImage = (index: number) => {
    if (disabled) return;
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400'
            }
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-sm text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  {isDragActive ? (
                    <Upload className="h-8 w-8 text-orange-600" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-orange-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop images here' : 'Upload venue images'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop images here, or click to select files
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                  <span>Supports: JPEG, PNG, WebP</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Max {maxFiles} images</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Max 10MB per image</span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 border-orange-200 text-orange-700 hover:bg-orange-50"
                  disabled={disabled}
                >
                  Choose Files
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      {value.length > 0 && (
        <div className="text-sm text-gray-600">
          {value.length} of {maxFiles} images uploaded
        </div>
      )}
    </div>
  );
}