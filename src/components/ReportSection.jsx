import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { defaultReportData, pieReportData } from '../data/moduleConfigs';
import { formatCurrency } from '../utils/helpers';

export default function ReportSection({ title = 'Operational Report' }) {
  const totals = defaultReportData.reduce(
    (acc, item) => {
      acc.income += item.income;
      acc.expense += item.expense;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Income', value: formatCurrency(totals.income) },
          { label: 'Total Expense', value: formatCurrency(totals.expense) },
          { label: 'Net Result', value: formatCurrency(net) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">{title} - Bar View</h3>
          <p className="mt-1 text-sm text-slate-500">Weekly comparison of income and expenses.</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultReportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="income" radius={[8, 8, 0, 0]} fill="#4f46e5" />
                <Bar dataKey="expense" radius={[8, 8, 0, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Payment Mix</h3>
          <p className="mt-1 text-sm text-slate-500">Distribution snapshot by payment channel.</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieReportData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {pieReportData.map((entry, index) => (
                    <Cell key={entry.name} fill={['#4f46e5', '#0ea5e9', '#f97316', '#10b981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {pieReportData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span>{item.name}</span>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
