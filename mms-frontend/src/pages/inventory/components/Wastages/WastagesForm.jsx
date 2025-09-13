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
  Typography,
} from "@mui/material";

export default function WastageForm({ open, onClose, onSubmit, products }) {
  const [product, setProduct] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setProduct("");
      setQuantity("");
      setReason("");
      setErrors({});
    }
  }, [open]);

  const selectedProduct = products.find((p) => p.id === product);
  const maxQuantity = selectedProduct?.stock_quantity || 0;


  const validate = () => {
    const newErrors = {};
    if (!product) newErrors.product = "Product is required";
    if (!quantity || parseFloat(quantity) <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    else if (parseFloat(quantity) > maxQuantity)
      newErrors.quantity = `Cannot exceed available stock (${maxQuantity})`;
    if (!reason.trim()) newErrors.reason = "Reason is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      product,
      quantity: parseFloat(quantity),
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Wastage</DialogTitle>
      <DialogContent dividers>
        {/* Product Dropdown */}
        <TextField
          select
          label="Product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.product}
          helperText={errors.product}
        >
          {products && products.length > 0 ? (
            products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No products available</MenuItem>
          )}
        </TextField>

        {/* Quantity Input */}
        <TextField
          type="number"
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.quantity}
        />
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Available stock: {maxQuantity}
        </Typography>

        {/* Reason Input */}
        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          rows={3}
          error={!!errors.reason}
          helperText={errors.reason}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!product || !quantity || !reason.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

WastageForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
};
