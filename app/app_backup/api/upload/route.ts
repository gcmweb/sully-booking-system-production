
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Validate minimum file size (prevent 1x1 pixel placeholders)
    const minSize = 1024; // 1KB minimum
    if (file.size < minSize) {
      return NextResponse.json(
        { error: 'File too small. Please upload a proper image file.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFilename = `${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic image validation - check if it's a valid image by trying to read dimensions
    try {
      // For a more robust solution, you could use a library like 'sharp' or 'image-size'
      // For now, we'll rely on file size and type validation
      if (buffer.length < minSize) {
        return NextResponse.json(
          { error: 'Invalid image file. Please upload a proper image.' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image file format.' },
        { status: 400 }
      );
    }

    // Define upload path
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'venues');
    const filePath = join(uploadDir, uniqueFilename);

    // Save file to filesystem
    await writeFile(filePath, buffer);

    // Return the URL path (relative to public directory)
    const fileUrl = `/uploads/venues/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      savedAs: uniqueFilename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
