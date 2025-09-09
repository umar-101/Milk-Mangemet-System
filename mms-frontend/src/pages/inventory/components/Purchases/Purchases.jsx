import { useState, useEffect } from "react";
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getSuppliers,
  getProducts,
} from "../../../../api/inventory";
import PurchaseForm from "./PurchasesForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";

const columns = [
  { id: "supplier", label: "Supplier", minWidth: 150 },
  { id: "product", label: "Product", minWidth: 150 },
  { id: "quantity", label: "Quantity", minWidth: 100 },
  { id: "extra_ice", label: "Extra Ice", minWidth: 100 },
  { id: "rate", label: "Rate", minWidth: 100 },
  { id: "total_amount", label: "Total Amount", minWidth: 120 },
  { id: "date_time", label: "Date & Time", minWidth: 180 },
  { id: "actions", label: "Actions", minWidth: 150 },
];

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await getPurchases();
      setPurchases(res.data);
    } catch (error) {
      toast.error("Failed to fetch purchases!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersAndProducts = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([getSuppliers(), getProducts()]);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error("Failed to fetch suppliers or products!");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuppliersAndProducts();
    fetchPurchases();
  }, []);

  const handleAddOrUpdate = async (data) => {
    try {
      if (editData) {
        await updatePurchase(editData.id, data);
        toast.success("Purchase updated successfully!");
      } else {
        await createPurchase(data);
        toast.success("Purchase added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      fetchPurchases();
    } catch (error) {
      toast.error("Error saving purchase!");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deletePurchase(id);
        toast.success("Purchase deleted successfully!");
        fetchPurchases();
      } catch (error) {
        toast.error("Error deleting purchase!");
        console.error(error);
      }
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const formatValue = (val) => {
    if (val === null || val === undefined || val === "") return "-";
    return parseFloat(val).toFixed(2);
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    const date = new Date(dt);
    const options = { day: "numeric", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formattedDate} ${hours}:${minutes}`;
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Purchases</h2>
        <button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Purchase
        </button>
      </div>

      {/* Form */}
      <PurchaseForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSubmit={handleAddOrUpdate}
        initialData={editData}
        suppliers={suppliers}
        products={products}
      />

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : purchases.length === 0 ? (
        <p>No purchases found.</p>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader aria-label="purchases table">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.id} style={{ minWidth: col.minWidth }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
             

              <TableBody>
  {purchases
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((p) => {
      const supplierName = suppliers.find((s) => s.id === p.supplier)?.name || "-";
      const productName = products.find((pr) => pr.id === p.product)?.name || "-";
      const quantity = formatValue(p.quantity);
      const extraIce = formatValue(p.extra_ice); // use API field
      const rate = formatValue(p.rate);
      const totalAmount = formatValue(p.total_amount ?? (p.quantity * p.rate)); // use API total if present
      const formattedDate = formatDateTime(p.date_time);

      return (
        <TableRow hover key={p.id}>
          <TableCell>{supplierName}</TableCell>
          <TableCell>{productName}</TableCell>
          <TableCell>{quantity}</TableCell>
          <TableCell>{extraIce}</TableCell>
          <TableCell>{rate}</TableCell>
          <TableCell>{totalAmount}</TableCell>
          <TableCell>{formattedDate}</TableCell>
          <TableCell>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => {
                setEditData(p);
                setShowForm(true);
              }}
            >
              Update
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      );
    })}
</TableBody>

            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={purchases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </div>
  );
};

export default Purchases;
