import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';

function ModuleRoute({ moduleKey }) {
  return <ModulePage moduleKey={moduleKey} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<ModuleRoute moduleKey="customers" />} />
        <Route path="vehicles" element={<ModuleRoute moduleKey="vehicles" />} />
        <Route path="setup" element={<ModuleRoute moduleKey="setup" />} />
        <Route path="bookings" element={<ModuleRoute moduleKey="bookings" />} />
        <Route path="handover" element={<ModuleRoute moduleKey="handover" />} />
        <Route path="return" element={<ModuleRoute moduleKey="return" />} />
        <Route path="payments" element={<ModuleRoute moduleKey="payments" />} />
        <Route path="cash-receipts" element={<ModuleRoute moduleKey="cash-receipts" />} />
        <Route path="expenses" element={<ModuleRoute moduleKey="expenses" />} />
        <Route path="maintenance" element={<ModuleRoute moduleKey="maintenance" />} />
        <Route path="owners" element={<ModuleRoute moduleKey="owners" />} />
        <Route path="owner-earnings" element={<ModuleRoute moduleKey="owner-earnings" />} />
        <Route path="reports" element={<ModuleRoute moduleKey="reports" />} />
        <Route path="daybook" element={<ModuleRoute moduleKey="daybook" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
