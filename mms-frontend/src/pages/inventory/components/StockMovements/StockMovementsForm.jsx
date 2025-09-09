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

export default function StockMovementForm({
  open,
  onClose,
  onSubmit,
  initialData,
  products, // 👈 products list from parent
}) {
  const [product, setProduct] = React.useState(initialData?.product?.id || "");
  const [quantity, setQuantity] = React.useState(initialData?.quantity || "");
  const [movementType, setMovementType] = React.useState(
    initialData?.movement_type || "in"
  );
  const [notes, setNotes] = React.useState(initialData?.notes || "");

  React.useEffect(() => {
    if (initialData) {
      setProduct(initialData.product?.id || "");
      setQuantity(initialData.quantity || "");
      setMovementType(initialData.movement_type || "in");
      setNotes(initialData.notes || "");
    } else {
      setProduct("");
      setQuantity("");
      setMovementType("in");
      setNotes("");
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!product || !quantity || quantity <= 0) {
      alert("Please fill all required fields and ensure quantity > 0");
      return;
    }
      onSubmit({
        product_id: product,  // 👈 FIXED
        quantity: parseFloat(quantity),
        movement_type: movementType,
        notes,
      });

  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Update Stock Movement" : "Add Stock Movement"}
      </DialogTitle>
      <DialogContent dividers>
        {/* Product Dropdown */}
        <TextField
          select
          label="Product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          fullWidth
          margin="normal"
          required
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
          required
        />

        {/* Movement Type */}
        <TextField
          select
          label="Movement Type"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="in">In</MenuItem>
          <MenuItem value="out">Out</MenuItem>
        </TextField>

        {/* Notes */}
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

StockMovementForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  products: PropTypes.array.isRequired, // 👈 required now
};
