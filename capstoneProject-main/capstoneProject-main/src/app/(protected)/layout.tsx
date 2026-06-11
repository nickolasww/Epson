import { Outlet } from 'react-router-dom';
import Guard from '@/app/_components/guard';
import DashboardSidebar from '@/app/_components/layouts/sidebar';

export default function ProtectedLayout() {
  return (
    <Guard requireAuth={true} allowedRoles={['admin', 'super_admin']} redirectTo="/">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <DashboardSidebar />
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen ml-16 lg:ml-64">
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </Guard>
  );
}
