import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendor, updateVendor } from "../api/accounts";

export default function EditVendor() {
  const { vendorId } = useParams();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendor = async () => {
      const data = await getVendor(vendorId);
      setUsername(data.username);
    };
    fetchVendor();
  }, [vendorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateVendor(vendorId, { username });
      navigate("/admin/vendors");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Edit Vendor</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Vendor Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
