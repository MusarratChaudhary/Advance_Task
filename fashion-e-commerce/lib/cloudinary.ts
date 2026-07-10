// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('❌ Missing Cloudinary environment variables. Please check your .env file.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,                    // Use HTTPS
});

// Helper function to upload single image
export const uploadToCloudinary = async (
  file: File | Buffer,
  folder: string = 'threadly/products'
): Promise<{ url: string; public_id: string }> => {
  try {
    let buffer: Buffer;

    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } else {
      buffer = file;
    }

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${buffer.toString('base64')}`,
      {
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'fill' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        resource_type: 'image',
      }
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper to delete image
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;