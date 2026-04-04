import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'Try changing filters or add a new record.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-soft">
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <Inbox size={28} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
