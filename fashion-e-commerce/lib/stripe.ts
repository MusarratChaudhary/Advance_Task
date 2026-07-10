// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY is not defined in environment variables');
}

// Latest version ke hisaab se
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',     // Updated to latest
  typescript: true,
});

// Helper function
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  metadata,
}: {
  lineItems: any[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      shipping_address_collection: {
        allowed_countries: ['PK', 'US', 'GB', 'CA', 'AU'],
      },
      billing_address_collection: 'required',
    });

    return session;
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}

export default stripe;