import api from "../utils/axios";

export async function loginUser(email, password) {
  try {
    const res = await api.post("/users/login", { email, password });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function registerVendor(vendorData) {
  try {
    const res = await api.post("/vendors/register", vendorData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentVendor() {
  try {
    const res = await api.get("/vendors/me");
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateVendor(vendorData) {
  try {
    const res = await api.put("/vendors/me", vendorData);
    return res.data;
  } catch (error) {
    throw error;
  }
}