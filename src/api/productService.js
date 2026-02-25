import api from "../utils/axios";

// Get all products (for Home page - public endpoint)
export const getAllProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

// Get current vendor's products (for Seller Dashboard - requires auth)
export const getMyProducts = async () => {
  try {
    const response = await api.get("/products/my");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching my products:", error);
    return [];
  }
}

// Create new product (requires auth)
export const createProduct = async (productData) => {
  try {
    const response = await api.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product (requires auth, vendor must own product)
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product (requires auth, vendor must own product)
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Get single product by ID (public endpoint)
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
