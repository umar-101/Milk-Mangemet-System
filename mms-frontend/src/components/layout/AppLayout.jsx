// src/components/layout/AppLayout.jsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside style={{ width: 240, padding: 16, borderRight: "1px solid #eee" }}>
        <h3>MilkMS</h3>
        <nav style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/inventory/products">Products</Link>
          <Link to="/inventory/suppliers">Suppliers</Link>
          <Link to="/sales/shops">Shops</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <button style={{ marginTop: 16 }} onClick={logout}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
