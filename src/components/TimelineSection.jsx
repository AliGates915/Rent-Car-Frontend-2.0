import { timelineSeed } from '../data/moduleConfigs';

export default function TimelineSection({ title = 'Activity History' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Inline timeline for operational logs, payments, status updates, and maintenance actions.</p>
      </div>

      <div className="space-y-5">
        {timelineSeed.map((item, index) => (
          <div key={item.title} className="relative flex gap-4 pl-8">
            <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-primary-600" />
            {index !== timelineSeed.length - 1 ? <span className="absolute left-[6px] top-5 h-[calc(100%+8px)] w-0.5 bg-slate-200" /> : null}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.date}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
