import client from "./client";

// Login
export const login = async (username, password) => {
  try {
    const response = await client.post("accounts/token/", { username, password });
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Create Vendor
export const createVendor = async (vendorData) => {
  try {
    const response = await client.post("accounts/users/", vendorData);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// List Users
export const listUsers = async () => {
  try {
    const response = await client.get("accounts/users/");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Retrieve Vendor by ID
export const getVendor = async (id) => {
  try {
    const response = await client.get(`accounts/users/${id}/`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Update Vendor
export const updateVendor = async (id, updatedData) => {
  try {
    const response = await client.put(`accounts/users/${id}/`, updatedData);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete Vendor
export const deleteVendor = async (id) => {
  try {
    await client.delete(`accounts/users/${id}/`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
