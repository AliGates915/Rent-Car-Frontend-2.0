import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { titleCase } from '../../utils/helpers';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'admin' };
    } catch {
      return { name: 'Admin', role: 'admin' };
    }
  }, []);

  const pageTitle = useMemo(() => {
    if (location.pathname === '/') return 'Dashboard Overview';
    return titleCase(location.pathname.slice(1));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} user={user} onLogout={handleLogout} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500">Manage operations with tab-based workflows, inline forms, reports, and history sections.</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
