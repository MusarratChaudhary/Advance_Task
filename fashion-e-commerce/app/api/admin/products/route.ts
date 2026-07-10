// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { isAdmin, getCurrentUserId } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const stock = parseInt(formData.get('stock') as string);
    const featured = formData.get('featured') === 'true';
    const sizes = JSON.parse(formData.get('sizes') as string || '[]');
    const colors = JSON.parse(formData.get('colors') as string || '[]');

    const imageFiles = formData.getAll('images') as File[];

    if (!name || !description || !price || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          folder: 'threadly/products',
          transformation: [{ width: 800, height: 800, crop: 'fill' }],
        }
      );

      imageUrls.push(result.secure_url);
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      featured,
      sizes,
      colors,
      images: imageUrls,
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });

  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create product',
    }, { status: 500 });
  }
}

// GET all products (for admin)
export async function GET() {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}