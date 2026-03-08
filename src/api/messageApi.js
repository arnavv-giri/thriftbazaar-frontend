import api from "../utils/axios";

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING API
// All calls use the JWT interceptor configured in utils/axios.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message to a user about a product.
 *
 * @param {number} productId   - product the message is about
 * @param {number} receiverId  - user ID of the recipient
 * @param {string} content     - message text (max 2000 chars)
 * @returns {Promise<MessageResponseDto>}
 */
export async function sendMessage(productId, receiverId, content) {
  const res = await api.post("/messages", { productId, receiverId, content });
  return res.data;
}

/**
 * Fetch the full conversation thread between the current user
 * and another user about a specific product.
 *
 * Also marks incoming messages as read server-side.
 *
 * @param {number} productId  - the product being discussed
 * @param {number} otherUserId - the other participant's user ID
 * @returns {Promise<MessageResponseDto[]>} messages oldest→newest
 */
export async function getConversation(productId, otherUserId) {
  const res = await api.get(`/messages/conversation/${productId}/${otherUserId}`);
  return res.data;
}

/**
 * Fetch the inbox — one entry per unique (product, otherUser) thread,
 * showing the latest message and unread count.
 *
 * @returns {Promise<InboxItemDto[]>} sorted by most recent activity
 */
export async function getInbox() {
  const res = await api.get("/messages/inbox");
  return res.data;
}

/**
 * Mark a single message as read.
 *
 * @param {number} messageId - message to mark
 */
export async function markMessageRead(messageId) {
  await api.patch(`/messages/${messageId}/read`);
}
