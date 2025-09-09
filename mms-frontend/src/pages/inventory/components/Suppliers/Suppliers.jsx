import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../../../api/inventory";
import SuppliersForm from "./SuppliersForm";
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
  { id: "name", label: "Name", minWidth: 150 },
  { id: "contact", label: "Contact", minWidth: 150 },
  { id: "address", label: "Address", minWidth: 200 },
  { id: "active", label: "Active", minWidth: 100 },
  { id: "actions", label: "Actions", minWidth: 150 },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const location = useLocation();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (error) {
      toast.error("Failed to fetch suppliers. Please log in.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on navigation
  useEffect(() => {
    fetchSuppliers();
  }, [location]);

  const handleAddOrUpdate = async (data) => {
    try {
      if (editData) {
        await updateSupplier(editData.id, data);
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(data);
        toast.success("Supplier added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      fetchSuppliers();
    } catch (error) {
      toast.error("Error saving supplier!");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteSupplier(id);
        toast.success("Supplier deleted successfully!");
        fetchSuppliers();
      } catch (error) {
        toast.error("Error deleting supplier!");
        console.error(error);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Suppliers</h2>
        <button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Supplier
        </button>
      </div>

      {/* Form Popup */}
      <SuppliersForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSubmit={handleAddOrUpdate}
        initialData={editData}
      />

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : suppliers.length === 0 ? (
        <p>No suppliers found.</p>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="suppliers table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((s) => (
                    <TableRow hover tabIndex={-1} key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.contact}</TableCell>
                      <TableCell>{s.address}</TableCell>
                      <TableCell>{s.active ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            setEditData(s);
                            setShowForm(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={suppliers.length}
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

export default Suppliers;
