import { useState, useEffect } from "react";
import { getWastages, createWastage, deleteWastage } from "../../../../api/inventory";
import WastagesForm from "./WastagesForm";

const WastagesPage = () => {
  const [wastages, setWastages] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchWastages = async () => {
    const res = await getWastages();
    setWastages(res.data);
  };

  useEffect(() => { fetchWastages(); }, []);

  const handleAdd = async (data) => {
    await createWastage(data);
    setShowForm(false);
    fetchWastages();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteWastage(id);
      fetchWastages();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Wastages</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {showForm ? "Close Form" : "Add Wastage"}
        </button>
      </div>

      {showForm && <WastagesForm onSubmit={handleAdd} />}

      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Date & Time</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {wastages.map(w => (
            <tr key={w.id}>
              <td className="p-2 border">{w.product_name}</td>
              <td className="p-2 border">{w.quantity}</td>
              <td className="p-2 border">{w.reason}</td>
              <td className="p-2 border">{new Date(w.date_time).toLocaleString()}</td>
              <td className="p-2 border">
                <button onClick={() => handleDelete(w.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WastagesPage;
