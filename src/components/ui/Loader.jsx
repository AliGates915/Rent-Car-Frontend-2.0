export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8 shadow-soft">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}
