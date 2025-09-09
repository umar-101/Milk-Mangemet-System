import { useState, useEffect } from "react";
import "../Form.scss"; // adjust path according to your folder structure

const WastagesForm = ({ onSubmit, products = [], initialData }) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setProductId(initialData.product);
      setQuantity(initialData.quantity);
      setReason(initialData.reason);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !quantity) return;
    onSubmit({ product: productId, quantity: parseFloat(quantity), reason });
    if (!initialData) {
      setProductId("");
      setQuantity("");
      setReason("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <label htmlFor="product">Product</label>
      <select
        id="product"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        required
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label htmlFor="quantity">Quantity</label>
      <input
        id="quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        min="0.001"
        step="0.001"
        placeholder="Enter quantity"
      />

      <label htmlFor="reason">Reason</label>
      <input
        id="reason"
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason"
      />

      <button type="submit">
        {initialData ? "Update Wastage" : "Record Wastage"}
      </button>
    </form>
  );
};

export default WastagesForm;
