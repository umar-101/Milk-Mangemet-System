// ExpensesForm.jsx
import * as React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

const categories = [
  { value: "electricity", label: "Electricity" },
  { value: "salary", label: "Salary" },
  { value: "food", label: "Food/Tea" },
  { value: "services", label: "Services" },
  { value: "petrol", label: "Petrol" },
  { value: "other", label: "Other" },
];

export default function ExpensesForm({ open, onClose, onSubmit }) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setCategory("other");
      setAmount("");
      setDescription("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!amount || parseFloat(amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Always use current date/time
    const finalDate = new Date().toISOString();

    onSubmit({
      name: name.trim(),
      category,
      amount: parseFloat(amount),
      date: finalDate,
      description: description.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          margin="normal"
        >
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number"
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.amount}
          helperText={errors.amount}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!name || !amount}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ExpensesForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
