import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";

const SuppliersForm = ({ open, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContact(initialData.contact || "");
      setAddress(initialData.address || "");
      setActive(initialData.active);
    } else {
      setName("");
      setContact("");
      setAddress("");
      setActive(true);
    }
  }, [initialData]);

  // Format Pakistani phone number
  const formatPakistaniPhone = (value) => {
    // Remove non-digit characters
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return `+92${cleaned.slice(1, 12)}`; // limit to +92XXXXXXXXXX
    } else if (cleaned.startsWith("92")) {
      return `+${cleaned.slice(0, 12)}`; 
    } else if (cleaned.startsWith("+92")) {
      return `+${cleaned.slice(1, 13)}`;
    }
    return value;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, contact, address, active });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Update Supplier" : "Add Supplier"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Contact (Pakistani Format)"
              value={contact}
              onChange={(e) => setContact(formatPakistaniPhone(e.target.value))}
              fullWidth
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              }
              label="Active"
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

export default SuppliersForm;
