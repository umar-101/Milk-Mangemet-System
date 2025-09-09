import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/admin/vendors" className="text-blue-600">
          Manage Vendors
        </Link>
      </nav>
    </div>
  );
}
