import { NavLink } from 'react-router-dom';
import { CarFront, ChartColumnBig, ClipboardList, CreditCard, HandCoins, LayoutDashboard, Settings2, ShieldUser, Users, Wrench } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Owners', to: '/owners', icon: ShieldUser },
  { label: 'Owner Earnings', to: '/owner-earnings', icon: HandCoins },
  { label: 'Vehicles', to: '/vehicles', icon: CarFront },
  { label: 'Setup', to: '/setup', icon: Settings2 },
  { label: 'Bookings', to: '/bookings', icon: ClipboardList },
  { label: 'Handover', to: '/handover', icon: HandCoins },
  { label: 'Return', to: '/return', icon: HandCoins },
  // { label: 'Payments', to: '/payments', icon: CreditCard },
  { label: 'Cash Receipts', to: '/cash-receipts', icon: CreditCard },
  { label: 'Expenses', to: '/expenses', icon: CreditCard },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Reports', to: '/reports', icon: ChartColumnBig },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={classNames(
          'fixed inset-0 z-30 bg-slate-900/50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={classNames(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-100">Admin Panel</p>
          <h1 className="mt-2 text-2xl font-bold">Rent a Car</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  )
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
