// src/pages/Dashboard/Dashboard.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Toolbar,
  AppBar,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const drawerWidth = 240;

export default function VendorDashboard() {
  const location = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(
    location.pathname.startsWith("/vendor/inventory")
  );
  const [salesOpen, setSalesOpen] = useState(
    location.pathname.startsWith("/vendor/sales")
  );

  const toggleInventory = () => setInventoryOpen(!inventoryOpen);
  const toggleSales = () => setSalesOpen(!salesOpen);

  const isDashboard = location.pathname === "/vendor";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw", // ✅ fix black bar issue
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6">Vendor Panel</Typography>
        </Toolbar>
        <Divider />
        <List>
          <ListItem button component={NavLink} to="/vendor">
            <ListItemText primary="Dashboard" />
          </ListItem>

          {/* Inventory submenu */}
          <ListItem button onClick={toggleInventory}>
            <ListItemText primary="Inventory" />
            {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/suppliers">
                <ListItemText primary="Suppliers" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/products">
                <ListItemText primary="Products" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/stocks">
                <ListItemText primary="Stocks" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/purchases">
                <ListItemText primary="Purchases" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/stock-movements">
                <ListItemText primary="Stock Movements" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/wastages">
                <ListItemText primary="Wastages" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/inventory/expenses">
                <ListItemText primary="Expenses" />
              </ListItem>
            </List>
          </Collapse>

          {/* Sales submenu */}
          <ListItem button onClick={toggleSales}>
            <ListItemText primary="Sales" />
            {salesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={salesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/sales/wholesale">
                <ListItemText primary="Wholesale Sales" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/sales/retail">
                <ListItemText primary="Retail Sales" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} component={NavLink} to="/vendor/sales/customers">
                <ListItemText primary="Retail Customers" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={NavLink} to="/vendor/reports">
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button component={NavLink} to="/vendor/profile">
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button component={NavLink} to="/vendor/settings">
            <ListItemText primary="Settings" />
          </ListItem>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="contained" color="error">
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <AppBar
          position="static"
          color="primary"
          sx={{ mb: 3, borderRadius: 1, boxShadow: 2 }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Vendor Dashboard</Typography>
            <Button variant="text" color="inherit">
              Docs
            </Button>
          </Toolbar>
        </AppBar>

        {/* Show cards only on main dashboard */}
        {isDashboard && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box
              component={NavLink}
              to="/vendor/inventory"
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 1,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography variant="h6">Inventory</Typography>
              <Typography variant="body2">Manage stock and items.</Typography>
            </Box>
            <Box
              component={NavLink}
              to="/vendor/sales"
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 1,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography variant="h6">Sales</Typography>
              <Typography variant="body2">
                Track wholesale and retail sales.
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/vendor/reports"
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 1,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography variant="h6">Reports</Typography>
              <Typography variant="body2">
                View sales, stock, and revenue reports.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Nested page content */}
        <Outlet />
      </Box>
    </Box>
  );
}
