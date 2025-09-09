import React, { useEffect, useState } from "react";
import { listVendors, deleteVendor } from "../api/accounts";
import { Link } from "react-router-dom";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await listVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      const success = await deleteVendor(id);
      if (success) fetchVendors();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Vendors</h1>
      <Link
        to="/admin/vendors/add"
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        Add Vendor
      </Link>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="border px-2 py-1">{v.id}</td>
              <td className="border px-2 py-1">{v.username}</td>
              <td className="border px-2 py-1">
                <Link
                  to={`/admin/vendors/edit/${v.id}`}
                  className="text-blue-600 mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
