import { useEffect, useState } from "react";
import { getExpenses } from "../../../../api/inventory";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getExpenses().then((res) => setExpenses(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses recorded.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="p-2 border">{e.name}</td>
                <td className="p-2 border">{e.amount}</td>
                <td className="p-2 border">{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Expenses;
