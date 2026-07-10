import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUserId } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Please login to checkout' },
        { status: 401 }
      );
    }

    const { items, shippingAddress, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in cart' },
        { status: 400 }
      );
    }

    const orderAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // 1. COD / Mock Direct Payment Method (Instant confirmation for testing/delivery tracking)
    if (paymentMethod === 'cod' || paymentMethod === 'mock') {
      const order = await Order.create({
        user: userId,
        items: items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          priceAtPurchase: item.price,
        })),
        totalAmount: orderAmount,
        shippingAddress,
        status: 'paid', // Mark as paid/confirmed instantly
      });

      // Reduce product stock immediately
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      return NextResponse.json({
        success: true,
        sessionId: null,
        orderId: order._id,
      });
    }

    // 2. Stripe Card Payment Method
    // First, save a pending order in the database
    const order = await Order.create({
      user: userId,
      items: items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        priceAtPurchase: item.price,
      })),
      totalAmount: orderAmount,
      shippingAddress,
      status: 'pending',
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name || 'Fashion Product',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to paisa
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId: userId,
        orderId: order._id.toString(),
      },
    });

    // Update order with the Stripe Session ID to find it in webhook
    order.paymentIntentId = session.id;
    await order.save();

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      orderId: order._id,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Checkout failed',
    }, { status: 500 });
  }
}