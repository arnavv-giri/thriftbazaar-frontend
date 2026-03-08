import api from "../utils/axios";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full-featured product search used by the Shop page.
 *
 * All parameters are optional — omitting them returns all public products.
 *
 * @param {object} params
 * @param {string}  params.keyword   – case-insensitive substring match on name
 * @param {string}  params.category  – exact category, e.g. "TSHIRTS"; omit for all
 * @param {number}  params.minPrice  – lower price bound (inclusive)
 * @param {number}  params.maxPrice  – upper price bound (inclusive)
 * @param {string}  params.sortBy    – "price" | "name" | "id"  (default: "id")
 * @param {string}  params.sortDir   – "asc" | "desc"           (default: "desc")
 * @param {number}  params.page      – zero-based page index     (default: 0)
 * @param {number}  params.size      – items per page            (default: 12)
 *
 * @returns {ProductPageResponseDto}
 *   { content: Product[], page, size, totalItems, totalPages }
 */
export async function searchProducts(params = {}) {
  // Strip undefined/null/empty-string values so they don't appear in the URL
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  const res = await api.get("/products/search", { params: clean });
  return res.data; // ProductPageResponseDto
}

/**
 * Legacy: get all products with optional category + price filters.
 * Returns a plain array (no pagination metadata).
 * Kept so other parts of the app that call getProducts() continue working.
 */
export async function getProducts(params = {}) {
  const res = await api.get("/products", { params });
  return res.data;
}

// Public: get single product by id
export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR
// ─────────────────────────────────────────────────────────────────────────────

// Vendor: create product
export async function createProduct(productData) {
  const res = await api.post("/products", productData);
  return res.data;
}

// Vendor: update own product
export async function updateProduct(id, productData) {
  const res = await api.put(`/products/${id}`, productData);
  return res.data;
}

// Vendor: delete own product
export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

// Vendor: get own products
export async function getMyProducts() {
  const res = await api.get("/products/my");
  return res.data;
}
