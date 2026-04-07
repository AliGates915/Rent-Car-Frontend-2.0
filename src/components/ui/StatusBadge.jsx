// frontend/src/components/ui/StatusBadge.jsx
import { classNames, titleCase } from '../../utils/helpers';

const colorMap = {
  // Active/Positive statuses
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  
  // Warning/Pending statuses
  overdue: 'bg-rose-50 text-rose-700 ring-rose-200',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  
  // Info/In-progress statuses
  on_rent: 'bg-sky-50 text-sky-700 ring-sky-200',
  ongoing: 'bg-sky-50 text-sky-700 ring-sky-200',
  rented: 'bg-sky-50 text-sky-700 ring-sky-200',
  
  // Negative/Cancelled statuses
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  
  // Inactive/Default
  inactive: 'bg-slate-100 text-slate-700 ring-slate-200',
  draft: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function StatusBadge({ value }) {
  // Handle null/undefined
  if (!value) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset bg-slate-100 text-slate-700 ring-slate-200">
        -
      </span>
    );
  }
  
  // Convert to lowercase for lookup
  const key = String(value).toLowerCase();
  
  // Get color class or default
  const colorClass = colorMap[key] || 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        colorClass
      )}
    >
      {titleCase(key)}
    </span>
  );
}