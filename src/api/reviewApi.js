import api from "../utils/axios";

/**
 * Fetch a page of reviews (+ aggregate stats) for a product.
 * Public — no token required.
 *
 * @param {number}  productId
 * @param {number}  [page=0]   – zero-based page index
 * @param {number}  [size=10]  – reviews per page (backend caps at 50)
 * @returns {ProductReviewsDto}
 *   { reviews, averageRating, reviewCount, page, totalPages, hasMore }
 */
export async function getProductReviews(productId, page = 0, size = 10) {
  const res = await api.get(`/reviews/product/${productId}`, {
    params: { page, size },
  });
  return res.data;
}

/**
 * Submit a review for a product.
 * Requires CUSTOMER JWT.
 *
 * @param {number} productId
 * @param {{ rating: number, comment?: string }} dto
 * @returns {ReviewResponseDto}
 */
export async function submitReview(productId, dto) {
  const res = await api.post(`/reviews/product/${productId}`, dto);
  return res.data;
}

/**
 * Check whether the current user is eligible to review a product.
 * Requires authentication (any role).
 *
 * @param {number} productId
 * @returns {{ canReview: boolean }}
 */
export async function canReviewProduct(productId) {
  const res = await api.get(`/reviews/product/${productId}/can-review`);
  return res.data;
}
