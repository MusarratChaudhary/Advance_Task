// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getCurrentUserId, isAdmin } from '@/lib/auth';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET Single Product — supports both slug and MongoDB ObjectId
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();
    const { id } = await params;

    // If the param looks like a 24-char hex ObjectId, search by _id; otherwise search by slug
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const product = isObjectId
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product',
    }, { status: 500 });
  }
}

// PATCH - Update Product (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!(await isAdmin())) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 403 });
    }

    const body = await request.json();
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update product',
    }, { status: 500 });
  }
}

// DELETE - Delete Product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!(await isAdmin())) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 403 });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete product',
    }, { status: 500 });
  }
}