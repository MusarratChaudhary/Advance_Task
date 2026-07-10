import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import Order from '@/models/Order';
import Product from '@/models/Product'; // Ensure Product model is registered in Mongoose

export async function GET() {
  try {
    await connectDB();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Fetch orders, populate product details in items
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'items.product',
        model: Product
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
