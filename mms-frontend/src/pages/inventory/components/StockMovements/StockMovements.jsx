import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { getStockMovements, getProducts, createStockMovement } from "../../../../api/inventory";
import StockMovementForm from "./StockMovementsForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Row({ row }) {
  const [open, setOpen] = React.useState(false);
  const [filterMonth, setFilterMonth] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("");

  // Filter + sort history
  const filteredHistory = row.history
    .filter((entry) => {
      const date = new Date(entry.date_time);
      if (filterMonth && date.getMonth() + 1 !== parseInt(filterMonth)) return false;
      if (filterYear && date.getFullYear() !== parseInt(filterYear)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time)); // latest first

  // Running stock balance (just for display)
  const totalStock = row.history.reduce(
    (sum, e) => (e.movement_type === "in" ? sum + parseFloat(e.quantity) : sum - parseFloat(e.quantity)),
    0
  );

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell align="right">{totalStock.toFixed(2)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>
                Stock Movement History
              </Typography>

              {/* Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <TextField
                  select
                  label="Month"
                  size="small"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Year"
                  size="small"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* History Table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date_time).toLocaleString()}</TableCell>
                      <TableCell>{entry.movement_type}</TableCell>
                      <TableCell align="right">{parseFloat(entry.quantity).toFixed(2)}</TableCell>
                      <TableCell>{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    name: PropTypes.string.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        date_time: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        movement_type: PropTypes.string.isRequired,
        notes: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
};


// ... keep your existing imports

export default function StockMovements() {
  const [rows, setRows] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [allMovements, setAllMovements] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);

  const fetchData = async () => {
    try {
      const productsRes = await getProducts();
      const movementsRes = await getStockMovements();
      setProducts(productsRes.data);
      setAllMovements(movementsRes.data); // all movements for ledger

      const grouped = productsRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        history: movementsRes.data.filter((m) => m.product.id === p.id) || [],
      }));

      setRows(grouped);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching stock movements!");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (data) => {
    try {
      await createStockMovement(data);
      toast.success("Stock movement added successfully!");
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error saving stock movement!");
    }
  };

  return (
    <Box className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Stock Movements</Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => setShowForm(true)}
        >
          Add Movement
        </Button>
      </Box>

      <StockMovementForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAdd}
        products={products}
      />

      {/* Per-product view */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Per-Product Stock Movements
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Product</TableCell>
              <TableCell align="right">Total Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ledger view */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Complete Stock Movement Ledger
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allMovements
              .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
              .map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.date_time).toLocaleString()}</TableCell>
                  <TableCell>{m.product.name}</TableCell>
                  <TableCell>{m.movement_type}</TableCell>
                  <TableCell align="right">{parseFloat(m.quantity).toFixed(2)}</TableCell>
                  <TableCell>{m.notes || "-"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
