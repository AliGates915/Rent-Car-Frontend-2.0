import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';
import SkeletonBlock from './SkeletonBlock';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, titleCase } from '../../utils/helpers';

function renderCell(column, row) {
  const value = row[column.key];
  if (column.render) return column.render(row);
  if (column.type === 'status') return <StatusBadge value={value} />;
  if (column.type === 'currency') return formatCurrency(value);
  if (column.type === 'date') return formatDate(value);
  if (column.type === 'boolean') return value ? 'Yes' : 'No';
  return value ?? '—';
}

export default function DataTable({
  title,
  description,
  columns = [],
  data = [],
  loading,
  search,
  onSearch,
  filters,
  onFilterChange,
  actions = true,
  onEdit,
  onDelete,
  page = 1,
  total = 0,
  limit = 10,
  onPageChange,
  extraActions,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {extraActions ? <div>{extraActions}</div> : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search records..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-primary-500 focus:bg-white"
          />
        </div>

        {filters && filters.length > 0 && (
          <div className="flex gap-2">
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {filter.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {titleCase(column.label || column.key)}
                  </th>
                ))}
                {actions ? <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4">
                        <SkeletonBlock className="h-5 w-full" />
                      </td>
                    ))}
                    {actions ? (
                      <td className="px-4 py-4">
                        <div className="ml-auto flex max-w-[100px] gap-2">
                          <SkeletonBlock className="h-9 w-9" />
                          <SkeletonBlock className="h-9 w-9" />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
                : data.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-slate-50/70">
                    {columns.map((column) => (
                      <td key={column.key} className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {renderCell(column, row)}
                      </td>
                    ))}
                    {actions ? (
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit?.(row)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete?.(row)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && !data.length ? (
          <div className="p-4">
            <EmptyState />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{data.length}</span> of <span className="font-semibold text-slate-700">{total}</span> records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="px-2 text-sm font-medium text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
