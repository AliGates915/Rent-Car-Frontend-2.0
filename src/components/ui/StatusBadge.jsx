import { classNames, titleCase } from '../../utils/helpers';

const colorMap = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  overdue: 'bg-rose-50 text-rose-700 ring-rose-200',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  on_rent: 'bg-sky-50 text-sky-700 ring-sky-200',
  ongoing: 'bg-sky-50 text-sky-700 ring-sky-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  inactive: 'bg-slate-100 text-slate-700 ring-slate-200',
  draft: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function StatusBadge({ value }) {
  const key = String(value || 'inactive').toLowerCase();

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        colorMap[key] || 'bg-slate-100 text-slate-700 ring-slate-200'
      )}
    >
      {titleCase(key)}
    </span>
  );
}
