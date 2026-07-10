// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Admin only for upload (security)
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          folder: 'threadly/products',
          transformation: [
            { width: 800, height: 800, crop: 'fill' },
            { quality: 'auto' }
          ],
        }
      );

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      images: uploadedImages,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to upload images',
    }, { status: 500 });
  }
}