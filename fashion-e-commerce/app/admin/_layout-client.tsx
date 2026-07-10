// app/admin/layout.tsx
'use client';
import { useState } from 'react';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, X } from 'lucide-react';

// We need a wrapper since layout is server but we need client state for mobile menu
import { usePathname } from 'next/navigation';

function AdminLayoutClient({ children, userName }: { children: React.ReactNode; userName: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600 hidden xs:block">
              Welcome, <span className="font-medium text-black">{userName}</span>
            </div>
            
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminLayoutClient };
