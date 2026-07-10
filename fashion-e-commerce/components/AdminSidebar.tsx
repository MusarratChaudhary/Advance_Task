// components/AdminSidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <div>
            <div className="font-bold text-2xl tracking-tight">Threadly</div>
            <div className="text-xs text-gray-500 -mt-1">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t">
        <div className="bg-gray-50 rounded-2xl p-5 text-sm">
          <div className="font-medium mb-1">Need Help?</div>
          <p className="text-gray-600 text-xs">Contact support for any issues</p>
          <button className="mt-4 text-xs bg-white px-4 py-2 rounded-xl border">
            Contact Support
          </button>
        </div>

        <button 
          onClick={() => {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/';
          }}
          className="w-full mt-6 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-3 rounded-2xl transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}