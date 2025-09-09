// src/features/inventory/Products.jsx
import { useEffect, useState } from "react";
import { createProduct, fetchProducts } from "../../api/inventory";

const UNITS = ["liter", "kg"];

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", unit: "liter" });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchProducts();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createProduct(form);
      setForm({ name: "", description: "", unit: "liter" });
      await load();
    } catch (err) {
      setError(err.response?.data?.unit?.[0] || "Failed to create product");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Products</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <button type="submit">Add Product</button>
        {error && <div style={{ color: "tomato" }}>{error}</div>}
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", maxWidth: 800 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.unit}</td>
                <td>{p.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
