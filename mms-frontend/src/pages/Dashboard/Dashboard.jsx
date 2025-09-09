// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  LogOut,
  FileText,
  Settings,
} from "lucide-react";

import "./Dashboard.scss";

export default function VendorDashboard() {
  const location = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Automatically open inventory submenu if route starts with /vendor/inventory
  useEffect(() => {
    if (location.pathname.startsWith("/vendor/inventory")) {
      setInventoryOpen(true);
    } else {
      setInventoryOpen(false);
    }
  }, [location.pathname]);

  const toggleInventory = () => setInventoryOpen(!inventoryOpen);

  const isDashboard = location.pathname === "/vendor";

  return (
    <div className="vendor-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">Vendor Panel</div>
        <nav className="sidebar-nav">
          <NavLink to="/vendor" className="nav-link">
            <Home size={20} /> Dashboard
          </NavLink>

          {/* Inventory submenu */}
          <div className="nav-link submenu-header" onClick={toggleInventory}>
            <Package size={20} /> Inventory
          </div>
          {inventoryOpen && (
            <div className="submenu">
              <NavLink to="/vendor/inventory/suppliers" className="nav-link">
                Suppliers
              </NavLink>
              <NavLink to="/vendor/inventory/products" className="nav-link">
                Products
              </NavLink>
              <NavLink to="/vendor/inventory/stocks" className="nav-link">
                Stocks
              </NavLink>
              <NavLink to="/vendor/inventory/purchases" className="nav-link">
                Purchases
              </NavLink>
              <NavLink to="/vendor/inventory/stock-movements" className="nav-link">
                Stock Movements
              </NavLink>
              <NavLink to="/vendor/inventory/wastages" className="nav-link">
                Wastages
              </NavLink>
              <NavLink to="/vendor/inventory/expenses" className="nav-link">
                Expenses
              </NavLink>
            </div>
          )}

          <NavLink to="/vendor/sales" className="nav-link">
            <ShoppingCart size={20} /> Sales
          </NavLink>
          <NavLink to="/vendor/reports" className="nav-link">
            <BarChart2 size={20} /> Reports
          </NavLink>
          <NavLink to="/vendor/profile" className="nav-link">
            <Users size={20} /> Profile
          </NavLink>
          <NavLink to="/vendor/settings" className="nav-link">
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="header">
          <h1>Vendor Dashboard</h1>
          <div className="header-actions">
            <button className="icon-button">
              <FileText size={20} />
            </button>
            {/* <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="profile-pic"
            /> */}
          </div>
        </header>

        <main className="content">
          {/* Show cards only on main dashboard */}
          {isDashboard && (
            <div className="cards-grid">
              <NavLink to="/vendor/inventory" className="card">
                <h2>Inventory</h2>
                <p>Manage stock and items.</p>
              </NavLink>
              <NavLink to="/vendor/sales" className="card">
                <h2>Sales</h2>
                <p>Track and manage sales records.</p>
              </NavLink>
              <NavLink to="/vendor/reports" className="card">
                <h2>Reports</h2>
                <p>View sales, stock, and revenue reports.</p>
              </NavLink>
            </div>
          )}

          {/* Nested page content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
