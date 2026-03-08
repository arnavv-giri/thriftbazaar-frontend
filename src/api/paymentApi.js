import api from "../utils/axios";

/**
 * paymentApi.js
 *
 * All Razorpay payment-related API calls.
 */

/**
 * Step 1 — Ask the backend to create a Razorpay order for our DB order.
 *
 * @param {number} orderId  our internal Order.id
 * @returns {PaymentOrderResponseDto}
 *   { razorpayOrderId, amount, currency, keyId, orderId }
 */
export async function createPaymentOrder(orderId) {
  const res = await api.post("/payments/create-order", { orderId });
  return res.data;
}

/**
 * Step 2 — Send the Razorpay callback values to the backend for
 * server-side HMAC-SHA256 signature verification.
 *
 * @param {object} payload
 *   { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {OrderResponseDto}  updated order with paymentStatus = "PAID"
 */
export async function verifyPayment(payload) {
  const res = await api.post("/payments/verify", payload);
  return res.data;
}
