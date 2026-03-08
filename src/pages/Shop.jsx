import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "ALL",
  "TSHIRTS",
  "SHIRTS",
  "JEANS",
  "JACKETS",
  "DRESSES",
  "ACCESSORIES",
  "SHOES",
  "HOODIES",
  "SWEATERS",
];

const SORT_OPTIONS = [
  { label: "Newest First",      sortBy: "id",    sortDir: "desc" },
  { label: "Oldest First",      sortBy: "id",    sortDir: "asc"  },
  { label: "Price: Low → High", sortBy: "price", sortDir: "asc"  },
  { label: "Price: High → Low", sortBy: "price", sortDir: "desc" },
  { label: "Name: A → Z",      sortBy: "name",  sortDir: "asc"  },
  { label: "Name: Z → A",      sortBy: "name",  sortDir: "desc" },
];

const PAGE_SIZE = 12;

// Inputs that benefit from debouncing (user types character-by-character).
// Category, sort, and page changes are instant — no debounce needed.
const DEBOUNCE_MS = 400;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function Shop() {
  const navigate = useNavigate();

  // ── Filter / search state ──────────────────────────────────────────────
  const [keyword,          setKeyword]          = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [minPrice,         setMinPrice]         = useState("");
  const [maxPrice,         setMaxPrice]         = useState("");
  const [sortIndex,        setSortIndex]        = useState(0);
  const [currentPage,      setCurrentPage]      = useState(0);

  // ── Result state ───────────────────────────────────────────────────────
  const [products,   setProducts]   = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  // ── Refs ───────────────────────────────────────────────────────────────
  // Used to cancel in-flight fetches when a newer one is issued.
  const abortRef    = useRef(null);
  // Used to debounce keyword / price inputs only.
  const debounceRef = useRef(null);
  // Tracks whether keyword/price changed (needs debounce) vs. other params (instant).
  const isDebounced = useRef(false);

  // ─────────────────────────────────────────────────────────────────────
  // Single unified effect — fires whenever ANY filter state changes.
  //
  // Design rationale
  // ────────────────
  // The previous implementation had TWO separate effects:
  //   • Effect A  (deps: category, sort, page)  → fired immediately
  //   • Effect B  (deps: keyword, minPrice, maxPrice) → debounced 450 ms
  //
  // Both effects also fired on the very first render, launching two
  // concurrent fetches.  Effect A's result was stamped with requestId=1;
  // Effect B's debounce fired 450 ms later, incremented the requestId to 2,
  // and the guard check  `if (id !== requestIdRef.current) return`  caused
  // Effect A's resolved response to be silently discarded — leaving the
  // shop blank until Effect B's own fetch completed.
  //
  // Fix: a SINGLE effect that owns ALL filter state.  Debouncing is applied
  // selectively only when keyword/price inputs are the trigger (isDebounced).
  // All other changes (category, sort, page) fire instantly.  An AbortController
  // replaces the integer-stamp guard — the previous fetch is cancelled before
  // the next one starts, which is both correct and avoids the discard bug.
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear any pending debounce timer from a previous render
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const doFetch = () => {
      // Cancel the previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      // Build query parameters from current state
      const { sortBy, sortDir } = SORT_OPTIONS[sortIndex] ?? SORT_OPTIONS[0];
      const params = { sortBy, sortDir, page: currentPage, size: PAGE_SIZE };

      const kw = keyword.trim();
      if (kw)                              params.keyword  = kw;
      if (selectedCategory !== "ALL")      params.category = selectedCategory;
      if (minPrice && Number(minPrice) > 0) params.minPrice = Number(minPrice);
      if (maxPrice && Number(maxPrice) > 0) params.maxPrice = Number(maxPrice);

      setLoading(true);
      setError("");

      searchProducts(params)
        .then((data) => {
          if (controller.signal.aborted) return; // superseded — ignore
          setProducts(data.content    ?? []);
          setTotalItems(data.totalItems ?? 0);
          setTotalPages(data.totalPages ?? 0);
          setLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return; // superseded — ignore
          console.error("Failed to load products:", err);
          setError("Failed to load products. Please try again.");
          setProducts([]);
          setTotalItems(0);
          setTotalPages(0);
          setLoading(false);
        });
    };

    if (isDebounced.current) {
      // Keyword / price changed → wait before firing
      debounceRef.current = setTimeout(doFetch, DEBOUNCE_MS);
    } else {
      // Category / sort / page changed → fire immediately
      doFetch();
    }

    // Reset the flag after scheduling so the NEXT render starts fresh
    isDebounced.current = false;

    return () => {
      // Cleanup: cancel debounce timer and abort any in-flight request
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current)    abortRef.current.abort();
    };
    // All filter state is listed — this single effect handles every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selectedCategory, minPrice, maxPrice, sortIndex, currentPage]);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  // Keyword input — mark as debounced and reset page
  const handleKeywordChange = (e) => {
    isDebounced.current = true;
    setKeyword(e.target.value);
    setCurrentPage(0);
  };

  // Price inputs — mark as debounced and reset page
  const handleMinPriceChange = (e) => {
    isDebounced.current = true;
    setMinPrice(e.target.value);
    setCurrentPage(0);
  };

  const handleMaxPriceChange = (e) => {
    isDebounced.current = true;
    setMaxPrice(e.target.value);
    setCurrentPage(0);
  };

  // Category click — instant, reset page
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(0);
  };

  // Sort dropdown — instant, reset page
  const handleSortChange = (e) => {
    setSortIndex(Number(e.target.value));
    setCurrentPage(0);
  };

  // Clear all — instant (no debounce needed)
  const handleClearFilters = () => {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("ALL");
    setSortIndex(0);
    setCurrentPage(0);
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─────────────────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────────────────

  const hasActiveFilters =
    keyword.trim() ||
    minPrice ||
    maxPrice ||
    selectedCategory !== "ALL" ||
    sortIndex !== 0;

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="shop">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="shop-sidebar">

        <h3 className="filter-title">CATEGORY</h3>
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className={selectedCategory === cat ? "filter active" : "filter"}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </div>
        ))}

        <h3 className="filter-title">PRICE</h3>
        <input
          className="price-input"
          placeholder="Min ₹"
          type="number"
          value={minPrice}
          min="0"
          onChange={handleMinPriceChange}
        />
        <input
          className="price-input"
          placeholder="Max ₹"
          type="number"
          value={maxPrice}
          min="0"
          onChange={handleMaxPriceChange}
        />

        {hasActiveFilters && (
          <button className="clear-btn" onClick={handleClearFilters}>
            CLEAR FILTERS
          </button>
        )}

      </aside>

      {/* ── PRODUCTS AREA ───────────────────────────────────────────────── */}
      <main className="shop-products">

        {/* ── Top bar: title + search + sort + count ─── */}
        <div className="shop-header">
          <h1 className="shop-title">SHOP</h1>

          {/* Search bar */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search products…"
              value={keyword}
              onChange={handleKeywordChange}
              aria-label="Search products"
            />
            {keyword && (
              <button
                className="search-clear"
                onClick={() => { setKeyword(""); setCurrentPage(0); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            className="sort-select"
            value={sortIndex}
            onChange={handleSortChange}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Result count */}
          <div className="product-count">
            {loading ? "…" : `${totalItems} PRODUCTS`}
          </div>
        </div>

        {/* ── Active filter chips ────────────────────── */}
        {hasActiveFilters && !loading && (
          <div className="active-filters">
            {keyword.trim() && (
              <span className="filter-chip">
                "{keyword.trim()}"
                <button onClick={() => { setKeyword(""); setCurrentPage(0); }}>✕</button>
              </span>
            )}
            {selectedCategory !== "ALL" && (
              <span className="filter-chip">
                {selectedCategory}
                <button onClick={() => handleCategoryChange("ALL")}>✕</button>
              </span>
            )}
            {minPrice && (
              <span className="filter-chip">
                Min ₹{minPrice}
                <button onClick={() => { setMinPrice(""); setCurrentPage(0); }}>✕</button>
              </span>
            )}
            {maxPrice && (
              <span className="filter-chip">
                Max ₹{maxPrice}
                <button onClick={() => { setMaxPrice(""); setCurrentPage(0); }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* ── Product grid / states ──────────────────── */}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <p>Loading products…</p>
          </div>
        ) : error ? (
          <div className="empty">
            <p>{error}</p>
            <button className="clear-btn" onClick={handleClearFilters}>
              Reset
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            <p className="empty-icon">🔍</p>
            <p>No products found matching your search.</p>
            <button className="clear-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => navigate(`/product/${p.id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="pagination">

            <button
              className="page-btn"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              aria-label="First page"
            >
              «
            </button>

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => Math.abs(i - currentPage) <= 2)
              .map((i) => (
                <button
                  key={i}
                  className={`page-btn${i === currentPage ? " active" : ""}`}
                  onClick={() => handlePageChange(i)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === currentPage ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              aria-label="Next page"
            >
              ›
            </button>

            <button
              className="page-btn"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              aria-label="Last page"
            >
              »
            </button>

            <span className="page-info">
              Page {currentPage + 1} of {totalPages}
            </span>

          </div>
        )}

      </main>
    </div>
  );
}

export default Shop;
