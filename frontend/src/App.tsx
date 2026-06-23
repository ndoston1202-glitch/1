import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MenuPage from './pages/menu/MenuPage'
import TablesPage from './pages/tables/TablesPage'
import OrdersPage from './pages/orders/OrdersPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import CashierPage from './pages/cashier/CashierPage'
import StaffPage from './pages/staff/StaffPage'
import ReportsPage from './pages/reports/ReportsPage'
import DeliveryPage from './pages/delivery/DeliveryPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kitchen" element={<KitchenPage />} />
          <Route path="cashier" element={<CashierPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
