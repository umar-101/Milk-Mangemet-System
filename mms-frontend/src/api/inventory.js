// api/inventory.js
import client from "./client";

// ------- SUPPLIERS -------
export const getSuppliers = () => client.get("inventory/suppliers/");
export const getSupplier = (id) => client.get(`inventory/suppliers/${id}/`);
export const createSupplier = (data) => client.post("inventory/suppliers/", data);
export const updateSupplier = (id, data) => client.put(`inventory/suppliers/${id}/`, data);
export const deleteSupplier = (id) => client.delete(`inventory/suppliers/${id}/`);

// ------- PRODUCTS -------
export const getProducts = () => client.get("inventory/products/");
export const createProduct = (data) => client.post("inventory/products/", data);
export const getProduct = (id) => client.get(`inventory/products/${id}/`);
export const updateProduct = (id, data) => client.put(`inventory/products/${id}/`, data);
export const deleteProduct = (id) => client.delete(`inventory/products/${id}/`);


// ------- STOCKS -------
export const getStocks = () => client.get("inventory/stocks/");
export const createStock = (data) => client.post("inventory/stocks/", data);
export const updateStock = (id, data) => client.put(`inventory/stocks/${id}/`, data);
export const deleteStock = (id) => client.delete(`inventory/stocks/${id}/`);


// ------- PURCHASES -------
export const getPurchases = () => client.get("inventory/purchases/");
export const getPurchase = (id) => client.get(`inventory/purchases/${id}/`);
export const createPurchase = (data) => client.post("inventory/purchases/", data);
export const updatePurchase = (id, data) => client.put(`inventory/purchases/${id}/`, data);
export const deletePurchase = (id) => client.delete(`inventory/purchases/${id}/`);

// ------- STOCK MOVEMENTS -------
export const getStockMovements = () => client.get("inventory/stock-movements/");
export const createStockMovement = (data) => client.post("inventory/stock-movements/", data);

// ------- WASTAGES -------
export const getWastages = () => client.get("inventory/wastages/");
export const createWastage = (data) => client.post("inventory/wastages/", data);

// ------- EXPENSES -------
export const getExpenses = () => client.get("inventory/expenses/");
export const createExpense = (data) => client.post("inventory/expenses/", data);
