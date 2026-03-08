import api from "../utils/axios";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticates a user and returns { token, role, email }.
 */
export async function loginUser(email, password) {
  const res = await api.post("/users/login", { email, password });
  return res.data;
}

/**
 * Registers a new CUSTOMER account.
 * The backend forces role = CUSTOMER regardless of what is sent.
 *
 * @returns UserResponseDto { id, email, role }
 */
export async function registerCustomer(email, password) {
  const res = await api.post("/users", { email, password });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits a vendor request for the currently authenticated user.
 * Requires a valid JWT (any role).
 * The account stays as CUSTOMER until an admin approves it.
 *
 * @param {string} storeName - desired store name
 * @returns VendorResponseDto { id, storeName, approved, user }
 */
export async function requestVendorStatus(storeName) {
  const res = await api.post("/vendors", { storeName });
  return res.data;
}

/**
 * Returns the vendor profile of the currently authenticated user.
 * Works for both pending and approved vendors.
 *
 * @returns VendorResponseDto | null (404 means no profile exists yet)
 */
export async function getMyVendorProfile() {
  const res = await api.get("/vendors/me");
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all vendor profiles still awaiting approval. */
export async function getPendingVendors() {
  const res = await api.get("/vendors/pending");
  return res.data;
}

/** Returns all vendor profiles (approved and pending). */
export async function getAllVendors() {
  const res = await api.get("/vendors/all");
  return res.data;
}

/** Admin: approve a vendor by ID. Returns the updated VendorResponseDto. */
export async function approveVendor(vendorId) {
  const res = await api.put(`/vendors/${vendorId}/approve`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the authenticated user's own profile. */
export async function getMyProfile() {
  const res = await api.get("/users/me");
  return res.data;
}

/** Updates the authenticated user's own profile. */
export async function updateMyProfile(data) {
  const res = await api.put("/users/me", data);
  return res.data;
}
