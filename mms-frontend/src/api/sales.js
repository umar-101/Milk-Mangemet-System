import client from "./client";

// ------- SHOPS -------
export const getShops = () => client.get("sales/shops/");
export const getShop = (id) => client.get(`sales/shops/${id}/`);
export const createShop = (data) => client.post("sales/shops/", data);
export const updateShop = (id, data) => client.put(`sales/shops/${id}/`, data);
export const deleteShop = (id) => client.delete(`sales/shops/${id}/`);

// ------- WHOLESALE SALES -------
export const getWholesaleSales = () => client.get("sales/wholesale-sales/");
export const getWholesaleSale = (id) => client.get(`sales/wholesale-sales/${id}/`);
export const createWholesaleSale = (data) => client.post("sales/wholesale-sales/", data);
export const updateWholesaleSale = (id, data) => client.put(`sales/wholesale-sales/${id}/`, data);
export const deleteWholesaleSale = (id) => client.delete(`sales/wholesale-sales/${id}/`);

// ------- RETAIL CUSTOMERS -------
export const getRetailCustomers = () => client.get("sales/retail-customers/");
export const getRetailCustomer = (id) => client.get(`sales/retail-customers/${id}/`);
export const createRetailCustomer = (data) => client.post("sales/retail-customers/", data);
export const updateRetailCustomer = (id, data) => client.put(`sales/retail-customers/${id}/`, data);
export const deleteRetailCustomer = (id) => client.delete(`sales/retail-customers/${id}/`);

// ------- RETAIL SALES -------
export const getRetailSales = () => client.get("sales/retail-sales/");
export const getRetailSale = (id) => client.get(`sales/retail-sales/${id}/`);
export const createRetailSale = (data) => client.post("sales/retail-sales/", data);
export const updateRetailSale = (id, data) => client.put(`sales/retail-sales/${id}/`, data);
export const deleteRetailSale = (id) => client.delete(`sales/retail-sales/${id}/`);

// ------- SUBSCRIPTIONS -------
export const getSubscriptions = () => client.get("sales/subscriptions/");
export const getSubscription = (id) => client.get(`sales/subscriptions/${id}/`);
export const createSubscription = (data) => client.post("sales/subscriptions/", data);
export const updateSubscription = (id, data) => client.put(`sales/subscriptions/${id}/`, data);
export const deleteSubscription = (id) => client.delete(`sales/subscriptions/${id}/`);

// ------- SUBSCRIPTION EXCEPTIONS -------
export const getSubscriptionExceptions = () => client.get("sales/subscription-exceptions/");
export const getSubscriptionException = (id) => client.get(`sales/subscription-exceptions/${id}/`);
export const createSubscriptionException = (data) => client.post("sales/subscription-exceptions/", data);
export const updateSubscriptionException = (id, data) => client.put(`sales/subscription-exceptions/${id}/`, data);
export const deleteSubscriptionException = (id) => client.delete(`sales/subscription-exceptions/${id}/`);
