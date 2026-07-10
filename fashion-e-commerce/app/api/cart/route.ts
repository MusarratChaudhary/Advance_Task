// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// GET Cart (for logged in user)
export async function GET() {
  try {
    await connectDB();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart is managed client-side with persistence",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cart',
    }, { status: 500 });
  }
}

// POST - Add to Cart (optional server side sync)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = await getCurrentUserId();
    const { productId, quantity = 1, selectedSize, selectedColor } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: 'Insufficient stock' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: {
        product,
        quantity,
        selectedSize,
        selectedColor,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to add to cart',
    }, { status: 500 });
  }
}