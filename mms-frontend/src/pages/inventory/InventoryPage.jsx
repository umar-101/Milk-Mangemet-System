import React from "react";
import { Outlet } from "react-router-dom";

const InventoryPage = () => {
  return (
    <div>
      <h1>Inventory Management</h1>
      <Outlet /> {/* Nested inventory page renders here */}
    </div>
  );
};

export default InventoryPage;
