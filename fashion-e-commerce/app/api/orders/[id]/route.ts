// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import Order from '@/models/Order';
import Product from '@/models/Product';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const order = await Order.findOne({ _id: id, user: userId })
      .populate({ path: 'items.product', model: Product })
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Fetch single order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}
