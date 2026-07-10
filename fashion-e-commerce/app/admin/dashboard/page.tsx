// app/admin/dashboard/page.tsx
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Product from '@/models/Product';
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import { 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';

export default async function AdminDashboard() {
  await connectDB();
  const user = await getAuthUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch stats
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-4xl font-semibold mt-2">{totalProducts}</p>
            </div>
            <Package className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-4xl font-semibold mt-2">{totalOrders}</p>
            </div>
            <Users className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-4xl font-semibold mt-2 text-orange-600">{pendingOrders}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-4xl font-semibold mt-2">Rs. {revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Orders</h2>
          <a href="/admin/orders" className="text-blue-600 hover:underline text-sm font-medium">
            View All Orders →
          </a>
        </div>
        
        <div className="text-center py-12 text-gray-500">
          Recent orders will appear here
          <br />
          <span className="text-sm">(Orders page coming soon)</span>
        </div>
      </div>
    </div>
  );
}