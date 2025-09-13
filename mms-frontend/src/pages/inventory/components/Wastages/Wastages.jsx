// Wastages.jsx
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
import { getWastages, getProducts, createWastage } from "../../../../api/inventory";
import WastageForm from "../Wastages/WastagesForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ------------------------- Row Component -------------------------
function Row({ row }) {
  const [open, setOpen] = React.useState(false);
  const [filterMonth, setFilterMonth] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("");

  // Filter + sort wastage history
  const filteredHistory = row.history
    .filter((entry) => {
      const date = new Date(entry.date_time);
      if (filterMonth && date.getMonth() + 1 !== parseInt(filterMonth)) return false;
      if (filterYear && date.getFullYear() !== parseInt(filterYear)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time)); // latest first

  // Total wastage sum for this product
  const totalWastage = row.history.reduce(
    (sum, e) => sum + parseFloat(e.quantity),
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
        <TableCell align="right">{totalWastage.toFixed(2)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>
                Wastage History
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

              {/* History table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Created By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date_time).toLocaleString()}</TableCell>
                      <TableCell align="right">{parseFloat(entry.quantity).toFixed(2)}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell>{entry.created_by?.username || "-"}</TableCell>
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
        reason: PropTypes.string.isRequired,
        created_by: PropTypes.object,
      })
    ).isRequired,
  }).isRequired,
};

// ------------------------- Main Component -------------------------
export default function Wastages() {
  const [rows, setRows] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);

  // Fetch products + wastages



  const fetchData = async () => {
  try {
    const productsRes = await getProducts();
    const wastagesRes = await getWastages();

    console.log("Products API response:", productsRes.data);
    console.log("Wastages API response:", wastagesRes.data);

    const grouped = productsRes.data.map((p) => {
      const history = wastagesRes.data.filter(
        (w) => w.product?.id === p.id || w.product === p.id
      );
      console.log(`Product ${p.name} history:`, history);

      const totalWastage = history.reduce(
        (sum, w) => sum + parseFloat(w.quantity),
        0
      );

      return {
        id: p.id,
        name: p.name,
        stock_quantity: p.stock_quantity,
        totalWastage,
        stockLeft: p.stock_quantity - totalWastage,
        history,
      };
    });

    console.log("Grouped rows:", grouped);

    setRows(grouped);
    setProducts(productsRes.data);
  } catch (error) {
    console.error(error);
    toast.error("Error fetching wastages!");
  }
};
  React.useEffect(() => {
    fetchData();
  }, []);

  // Handle adding a new wastage
  const handleAdd = async (data) => {
    try {
      await createWastage(data);
      toast.success("Wastage recorded!");
      setShowForm(false);
      fetchData(); // refresh from backend to stay accurate
    } catch (error) {
      const message =
        error.response?.data?.non_field_errors?.join(" ") ||
        error.response?.data?.quantity?.join(" ") ||
        "Error saving wastage!";
      toast.error(message);
    }
  };

  const handleClose = () => {
    document.activeElement.blur();
    setShowForm(false);
  };

  return (
    <Box className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Wastages</Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowForm(true)}
        >
          Add Wastage
        </Button>
      </Box>

      <WastageForm
        open={showForm}
        onClose={handleClose}
        onSubmit={handleAdd}
        products={products}
      />

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Product</TableCell>
              <TableCell align="right">Total Wastage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
