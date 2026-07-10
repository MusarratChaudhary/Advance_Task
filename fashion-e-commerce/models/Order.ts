// models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';
import { CartItem } from '@/types';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    priceAtPurchase: number;     // Important for price history
  }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId?: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedSize: String,
        selectedColor: String,
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,                    // Allows null values
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'Pakistan' },
      phone: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
// Note: paymentIntentId index already created by unique:true + sparse in the field definition
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// Virtual for populating product details
OrderSchema.virtual('itemsWithProduct').get(function () {
  return this.items;
});

// Pre-save middleware — validate total amount
// Mongoose v7+ async middleware: do NOT use next() — just throw or return
OrderSchema.pre('save', function () {
  if (this.isNew && this.totalAmount <= 0) {
    throw new Error('Order total amount must be greater than zero');
  }
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;