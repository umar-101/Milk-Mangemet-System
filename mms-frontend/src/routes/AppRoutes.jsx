import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../store/authContext";

// Vendor pages
import VendorLogin from "../pages/vendor/VendorLogin";
import VendorSignup from "../pages/vendor/VendorSignup";
import VendorDashboard from "../pages/Dashboard/Dashboard";
import VendorProfile from "../pages/vendor/VendorProfile";
import VendorSettings from "../pages/vendor/VendorSettings";

// Inventory subpages
import InventoryPage from "../pages/inventory/InventoryPage";
import Suppliers from "../pages/inventory/components/Suppliers/Suppliers";
import Products from "../pages/inventory/components/Products/Products";
import Stocks from "../pages/inventory/components/Stocks/Stocks";
import Purchases from "../pages/inventory/components/Purchases/Purchases";
import StockMovements from "../pages/inventory/components/StockMovements/StockMovements";
import Wastages from "../pages/inventory/components/Wastages/Wastages";
import Expenses from "../pages/inventory/components/Expenses/Expenses";

// Other pages
import SalesPage from "../pages/sales/SalesPage";
import ReportsPage from "../pages/report/ReportsPage";

const AppRoutes = () => {
  const { user } = useAuth();

  const PrivateRoute = ({ children }) => (user ? children : <Navigate to="/login" replace />);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/signup" element={<VendorSignup />} />

      {/* Protected Vendor Routes */}
      <Route
        path="/vendor/*"
        element={
          <PrivateRoute>
            <VendorDashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<div>Welcome to the Vendor Dashboard!</div>} />

        {/* Inventory nested routes */}
        <Route path="inventory" element={<InventoryPage />}>
          <Route index element={<div>Select an inventory section</div>} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="products" element={<Products />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="stock-movements" element={<StockMovements />} />
          <Route path="wastages" element={<Wastages />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>

        {/* Other vendor pages */}
        <Route path="sales" element={<SalesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
