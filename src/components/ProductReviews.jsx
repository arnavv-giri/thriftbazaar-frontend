import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProductReviews, submitReview, canReviewProduct } from "../api/reviewApi";
import { isLoggedIn, getUserEmail } from "../utils/auth";
import "./ProductReviews.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

const REVIEWS_PAGE_SIZE = 10;

/** Render n filled stars, (5-n) empty stars. */
function StarDisplay({ rating, size = "md" }) {
  return (
    <span className={`star-display star-${size}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "star filled" : "star empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Interactive star picker used in the review form. */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <span className="star-picker" role="radiogroup" aria-label="Select star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= (hover || value) ? "active" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

/** Format ISO timestamp to a readable date string. */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Displays reviews for a product with pagination and, when eligible,
 * shows a submission form.
 *
 * Pagination strategy
 * ───────────────────
 * We request the first page (10 reviews) on mount.  Each "Load more" click
 * fetches the next page and appends those reviews to the existing list —
 * this is an append pattern rather than a page-flip so users don't lose
 * their scroll position.
 *
 * The aggregate stats (averageRating, reviewCount) are returned by every
 * page response and refer to ALL reviews, not just the current page,
 * so the summary header stays accurate throughout.
 *
 * Props
 * ─────
 * productId  {number}  — the product whose reviews to show
 */
function ProductReviews({ productId }) {
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────
  // reviews is the accumulated list across all loaded pages.
  const [reviews,       setReviews]       = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount,   setReviewCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState("");

  // ── Pagination state ────────────────────────────────────────────────────
  const [currentPage,   setCurrentPage]   = useState(0);
  const [hasMore,       setHasMore]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);

  // ── Eligibility ─────────────────────────────────────────────────────────
  const [canReview,     setCanReview]     = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────
  const [rating,        setRating]        = useState(0);
  const [comment,       setComment]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentUserEmail = getUserEmail();

  // ── Load first page of reviews + eligibility ────────────────────────────
  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    setCurrentPage(0);

    try {
      const data = await getProductReviews(productId, 0, REVIEWS_PAGE_SIZE);
      setReviews(data.reviews       ?? []);
      setAverageRating(data.averageRating ?? null);
      setReviewCount(data.reviewCount     ?? 0);
      setHasMore(data.hasMore             ?? false);
    } catch {
      setFetchError("Could not load reviews.");
    } finally {
      setLoading(false);
    }

    // Check eligibility only when logged in
    if (isLoggedIn()) {
      try {
        const { canReview: eligible } = await canReviewProduct(productId);
        setCanReview(eligible);
      } catch {
        setCanReview(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // ── Load next page and append ────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const data = await getProductReviews(productId, nextPage, REVIEWS_PAGE_SIZE);
      // Append new reviews to the existing list
      setReviews(prev => [...prev, ...(data.reviews ?? [])]);
      setAverageRating(data.averageRating ?? null);
      setReviewCount(data.reviewCount     ?? 0);
      setHasMore(data.hasMore             ?? false);
      setCurrentPage(nextPage);
    } catch {
      // Non-fatal — user can try again
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Submit handler ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitReview(productId, { rating, comment: comment.trim() || undefined });
      setSubmitSuccess(true);
      setCanReview(false);
      setRating(0);
      setComment("");
      // Reload from page 0 so the newly submitted review appears at the top
      const data = await getProductReviews(productId, 0, REVIEWS_PAGE_SIZE);
      setReviews(data.reviews       ?? []);
      setAverageRating(data.averageRating ?? null);
      setReviewCount(data.reviewCount     ?? 0);
      setHasMore(data.hasMore             ?? false);
      setCurrentPage(0);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setSubmitError(msg ?? "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="reviews-section">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="reviews-header">
        <h2 className="reviews-title">REVIEWS</h2>

        {reviewCount > 0 && (
          <div className="reviews-summary">
            <StarDisplay rating={Math.round(averageRating)} size="lg" />
            <span className="avg-number">
              {averageRating?.toFixed(1)}
            </span>
            <span className="review-count">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* ── Review form ─────────────────────────────────────────────────── */}
      {canReview && !submitSuccess && (
        <div className="review-form">
          <h3 className="form-title">Write a Review</h3>

          <div className="form-field">
            <label className="form-label">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="form-field">
            <label className="form-label">
              Comment <span className="optional">(optional)</span>
            </label>
            <textarea
              className="review-textarea"
              rows={4}
              maxLength={2000}
              placeholder="Share your experience with this product…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <span className="char-count">{comment.length} / 2000</span>
          </div>

          {submitError && (
            <p className="review-error">{submitError}</p>
          )}

          <button
            className="review-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "SUBMIT REVIEW"}
          </button>
        </div>
      )}

      {/* Success banner — shown after submitting */}
      {submitSuccess && (
        <div className="review-success">
          ✓ Your review has been submitted. Thank you!
        </div>
      )}

      {/* Prompt to log in if not authenticated */}
      {!isLoggedIn() && (
        <p className="review-login-prompt">
          <button
            className="review-login-link"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>{" "}
          to leave a review after purchasing this product.
        </p>
      )}

      {/* ── Review list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="reviews-loading">
          <div className="reviews-spinner" />
          <p>Loading reviews…</p>
        </div>
      ) : fetchError ? (
        <p className="review-error">{fetchError}</p>
      ) : reviews.length === 0 ? (
        <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
      ) : (
        <>
          <ul className="review-list">
            {reviews.map((r) => (
              <li
                key={r.id}
                className={`review-item${r.reviewerEmail === currentUserEmail ? " own-review" : ""}`}
              >
                <div className="review-top">
                  <div className="reviewer-info">
                    <span className="reviewer-avatar">
                      {r.reviewerEmail?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="reviewer-email">
                      {r.reviewerEmail === currentUserEmail
                        ? "You"
                        : r.reviewerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
                    </span>
                    {r.reviewerEmail === currentUserEmail && (
                      <span className="own-badge">Your review</span>
                    )}
                  </div>
                  <div className="review-meta">
                    <StarDisplay rating={r.rating} size="sm" />
                    <span className="review-date">{formatDate(r.createdAt)}</span>
                  </div>
                </div>

                {r.comment && (
                  <p className="review-comment">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>

          {/* ── Load more button ─────────────────────────────────────── */}
          {hasMore && (
            <div className="reviews-load-more">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <span className="reviews-spinner-inline" />
                ) : (
                  `Load more reviews (${reviewCount - reviews.length} remaining)`
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductReviews;
