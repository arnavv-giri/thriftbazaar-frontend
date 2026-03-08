import api from "../utils/axios";

/**
 * orderApi.js
 *
 * All order-related API calls.  Every function uses the shared axios
 * instance from utils/axios.js which automatically attaches the JWT
 * Authorization header from localStorage.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the customer's cart to the backend and creates a real order.
 *
 * @param {Array}  cartItems       – items from localStorage cart
 * @param {string} deliveryAddress – full address string from the checkout form
 * @returns {OrderResponseDto}     – the newly created order
 */
export async function placeOrder(cartItems, deliveryAddress) {
  const payload = {
    deliveryAddress,
    items: cartItems.map((item) => ({
      productId: item.id,
      quantity:  item.quantity,
    })),
  };
  const res = await api.post("/orders/checkout", payload);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// MY ORDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all orders for the authenticated customer (newest first).
 *
 * @returns {OrderResponseDto[]}
 */
export async function getMyOrders() {
  const res = await api.get("/orders");
  return res.data;
}

/**
 * Returns a single order by ID.
 * Throws 403 if the caller does not own the order.
 *
 * @param {number} orderId
 * @returns {OrderResponseDto}
 */
export async function getOrderById(orderId) {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS UPDATE (ADMIN / VENDOR)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates the status of an order.
 * Only ADMIN and VENDOR roles can call this endpoint.
 *
 * @param {number} orderId
 * @param {string} status  – e.g. "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
 * @returns {OrderResponseDto}
 */
export async function updateOrderStatus(orderId, status) {
  const res = await api.put(`/orders/${orderId}/status`, { status });
  return res.data;
}

/**
 * Allows the authenticated CUSTOMER to cancel their own order.
 * Only works when the order is PENDING or PROCESSING.
 *
 * @param {number} orderId
 * @returns {OrderResponseDto}
 */
export async function cancelMyOrder(orderId) {
  const res = await api.post(`/orders/${orderId}/cancel`);
  return res.data;
}

/**
 * Returns orders received for the authenticated vendor's products.
 * Only VENDOR role can call this.
 *
 * @returns {VendorOrderResponseDto[]}
 */
export async function getVendorOrders() {
  const res = await api.get("/orders/vendor");
  return res.data;
}
