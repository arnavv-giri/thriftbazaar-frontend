import api from "../utils/axios";

export async function getProducts() {
  try {
    const res = await api.get("/products");
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createProduct(productData) {
  try {
    const res = await api.post("/products", productData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(id, productData) {
  try {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getVendorProducts(vendorId) {
  try {
    const res = await api.get(`/vendors/${vendorId}/products`);
    return res.data;
  } catch (error) {
    throw error;
  }
}