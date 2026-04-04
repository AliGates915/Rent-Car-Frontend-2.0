import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CarFront, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login(form);
      const token = response?.data?.token || 'demo-admin-token';
      const user = response?.data?.user || { name: 'Admin User', role: 'admin', email: form.email };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login successful');
      navigate('/');
    } catch {
      if (form.email && form.password) {
        localStorage.setItem('token', 'demo-admin-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Demo Admin', role: 'admin', email: form.email }));
        toast.success('Demo login activated');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-slate-950 p-12 text-white lg:flex">
        <div>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <CarFront />
            <span className="text-lg font-semibold">Rent Car ERP Admin</span>
          </div>
          <h1 className="mt-10 max-w-lg text-5xl font-bold leading-tight">Full featured admin dashboard with inline workflows and tab based operations.</h1>
          <p className="mt-5 max-w-xl text-base text-primary-100">Customers, vehicles, bookings, handover, return, payments, reports, owner earnings, maintenance, and more — all inside one consistent UI system.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {['Inline forms only', 'Search + filters + pagination', 'Charts + reports', 'Reusable modular architecture'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mb-3" />
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Welcome Back</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Admin Login</h2>
          <p className="mt-2 text-sm text-slate-500">Use your API credentials. For UI testing, any email and password will open demo mode.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
