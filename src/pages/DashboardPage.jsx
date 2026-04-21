import { CarFront, ClipboardList, CreditCard, Users } from 'lucide-react';
import { dashboardSummaryCards } from '../data/moduleConfigs';
import ReportSection from '../pages/ReportsPage';
import TimelineSection from '../components/TimelineSection';

const quickStats = [
  { label: 'Customers', value: '540', icon: Users },
  { label: 'Vehicles', value: '126', icon: CarFront },
  { label: 'Bookings', value: '78', icon: ClipboardList },
  { label: 'Payments', value: '312', icon: CreditCard },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {dashboardSummaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-900">{item.value}</h4>
                </div>
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ReportSection title="Revenue Overview" />
      <TimelineSection title="Recent Operations Timeline" />
    </div>
  );
}
