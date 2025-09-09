import { useState, useEffect } from "react";
import "../../Form.scss";

const ExpensesForm = ({ onSubmit, initialData }) => {
  const [name, setName] = useState("Default Expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount);
      setDate(initialData.date);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date) return;
    onSubmit({ name, amount: parseFloat(amount), date });
    if (!initialData) setName("Default Expense"); setAmount(""); setDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

      <label>Amount</label>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required />

      <label>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

      <button type="submit">{initialData ? "Update Expense" : "Add Expense"}</button>
    </form>
  );
};

export default ExpensesForm;
