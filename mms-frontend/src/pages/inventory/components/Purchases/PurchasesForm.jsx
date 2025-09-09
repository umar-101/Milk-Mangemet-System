import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

const PurchaseForm = ({ open, onClose, onSubmit, initialData, suppliers, products }) => {
  const [supplier, setSupplier] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [extraIce, setExtraIce] = useState(0);
  const [rate, setRate] = useState("");
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setSupplier(initialData.supplier);
      setProduct(initialData.product);
      setQuantity(initialData.quantity);
      setExtraIce(initialData.extra_ice);
      setRate(initialData.rate);
      setNotes(initialData.notes || "");
    } else {
      setSupplier("");
      setProduct("");
      setQuantity("");
      setExtraIce(0);
      setRate("");
      setNotes("");
    }
  }, [initialData]);

  // Calculate live total (milk only)
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    setTotalAmount(qty * rt); // number
  }, [quantity, rate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier || !product || !quantity || !rate) return;

    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;

    onSubmit({
      supplier,
      product,
      quantity: qty,
      extra_ice: parseFloat(extraIce) || 0,
      rate: rt,
      total_amount: qty * rt, // only milk cost
      notes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Update Purchase" : "Add Purchase"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              fullWidth
            >
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              fullWidth
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity (Milk)"
              type="number"
              inputProps={{ step: "0.01" }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Extra Ice"
              type="number"
              inputProps={{ step: "0.01" }}
              value={extraIce}
              onChange={(e) => setExtraIce(e.target.value)}
              fullWidth
            />

            <TextField
              label="Rate"
              type="number"
              inputProps={{ step: "0.01" }}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
              fullWidth
            />

            <Typography variant="subtitle1">
              Total Amount (Milk only): <strong>{totalAmount.toFixed(2)}</strong>
            </Typography>

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseForm;
