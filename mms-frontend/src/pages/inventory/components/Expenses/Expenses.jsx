// Expenses.jsx
import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { getExpenses, createExpense } from "../../../../api/inventory";
import ExpensesForm from "../Expenses/ExpensesForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = [
  { value: "", label: "All" },
  { value: "electricity", label: "Electricity" },
  { value: "salary", label: "Salary" },
  { value: "food", label: "Food/Tea" },
  { value: "services", label: "Services" },
  { value: "petrol", label: "Petrol" },
  { value: "other", label: "Other" },
];

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export default function Expenses() {
  const [expenses, setExpenses] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = React.useState("");
  const [filterMonth, setFilterMonth] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("");

  const fetchData = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching expenses!");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (data) => {
    try {
      await createExpense(data);
      toast.success("Expense recorded!");
      setShowForm(false);
      fetchData();
    } catch (error) {
      const message =
        error.response?.data?.non_field_errors?.join(" ") ||
        "Error saving expense!";
      toast.error(message);
    }
  };

  // Compute available years dynamically
  const availableYears = Array.from(
    new Set(expenses.map((e) => new Date(e.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Apply filters
  const filteredExpenses = expenses.filter((exp) => {
    const date = new Date(exp.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (filterCategory && exp.category !== filterCategory) return false;
    if (filterMonth && month !== parseInt(filterMonth)) return false;
    if (filterYear && year !== parseInt(filterYear)) return false;
    return true;
  });

  // Total for filtered data
  const total = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  return (
    <Box className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Expenses</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
        >
          Add Expense
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Category"
          size="small"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Month"
          size="small"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Year"
          size="small"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {availableYears.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Add Expense Form */}
      <ExpensesForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAdd}
      />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.name}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>{exp.description || "-"}</TableCell>
                <TableCell>
                  {new Date(exp.date).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {parseFloat(exp.amount).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right">
                <strong>Total</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{total.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
