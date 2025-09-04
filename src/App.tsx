import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import LoginPage from "@/components/pages/login/page"

// Dashboard pages
import DashboardHome from "@/components/pages/dashboard/page"
import AnalyticsPage from "@/components/pages/dashboard/analytics/page"
import AdsPage from "@/components/pages/dashboard/ads/page"
import CertificatesPage from "@/components/pages/dashboard/certificates/page"
import CRMListPage from "@/components/pages/dashboard/crm/page"
import CRMDetailPage from "@/components/pages/dashboard/crm/[id]/page"
import InboxPage from "@/components/pages/dashboard/inbox/page"
import MembershipPage from "@/components/pages/dashboard/membership/page"
import OrdersListPage from "@/components/pages/dashboard/orders/page"
import OrderDetailPage from "@/components/pages/dashboard/orders/[id]/page"
import ProductsListPage from "@/components/pages/dashboard/products/page"
import ProductNewPage from "@/components/pages/dashboard/products/new/page"
import ProductDetailPage from "@/components/pages/dashboard/products/[id]/page"
import ProductEditPage from "@/components/pages/dashboard/products/[id]/edit/page"
import RFQListPage from "@/components/pages/dashboard/rfq/page"
import RFQDetailPage from "@/components/pages/dashboard/rfq/[id]/page"
import ToolsPage from "@/components/pages/dashboard/tools/page"

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
        <Route index element={<DashboardHome />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="crm" element={<CRMListPage />} />
        <Route path="crm/:id" element={<CRMDetailPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="membership" element={<MembershipPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductNewPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        <Route path="rfq" element={<RFQListPage />} />
        <Route path="rfq/:id" element={<RFQDetailPage />} />
        <Route path="tools" element={<ToolsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App


