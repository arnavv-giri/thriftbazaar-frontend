import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getInbox } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import { useMessageStream } from "../hooks/useMessageStream";
import "./Inbox.css";

/**
 * Inbox page — shows all conversations the current user participates in.
 *
 * Real-time behaviour
 * ───────────────────
 * useMessageStream keeps an SSE connection open. When any new message
 * arrives (sent or received), we silently re-fetch the inbox so that
 * the latest preview text and unread badge update immediately —
 * no manual refresh needed.
 */
function Inbox() {
  const navigate              = useNavigate();
  const { isLoggedIn, email } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // ── Auth gate ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  // ── Load / reload inbox ───────────────────────────────────────────────
  const loadInbox = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getInbox();
      setConversations(data);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || "Failed to load inbox.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  // ── SSE: refresh inbox whenever any new message touches us ───────────
  // We only care that *something* changed — re-fetching the full inbox
  // is cheap and gives us accurate unread counts and latest previews.
  const handleIncomingMessage = useCallback(() => {
    loadInbox(true);
  }, [loadInbox]);

  useMessageStream(handleIncomingMessage, !!isLoggedIn);

  // ── Navigate to conversation ──────────────────────────────────────────
  const openConversation = (conv) => {
    navigate(`/contact-seller/${conv.otherUserId}`, {
      state: {
        productId:   conv.productId,
        sellerEmail: conv.otherUserEmail,
        product: {
          id:     conv.productId,
          name:   conv.productName,
          images: conv.productImageUrl ? [conv.productImageUrl] : [],
        },
      },
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return "";
    const d      = new Date(ts);
    const now    = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1)  return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h ago`;
    return d.toLocaleDateString();
  };

  const truncate = (str, len = 60) =>
    str && str.length > len ? str.slice(0, len) + "…" : str;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1>Inbox</h1>
        <p>Your conversations about products</p>
      </div>

      {error && <div className="inbox-error">{error}</div>}

      {loading ? (
        <div className="inbox-state">
          <div className="inbox-spinner" />
          <p>Loading conversations…</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="inbox-state inbox-empty">
          <span className="inbox-empty-icon">💬</span>
          <p>No conversations yet.</p>
          <p className="inbox-empty-sub">
            Browse products and message a seller to get started.
          </p>
          <button className="inbox-browse-btn" onClick={() => navigate("/shop")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="inbox-list">
          {conversations.map((conv, idx) => (
            <button
              key={`${conv.productId}-${conv.otherUserId}-${idx}`}
              className={`inbox-row ${conv.unreadCount > 0 ? "inbox-row--unread" : ""}`}
              onClick={() => openConversation(conv)}
            >
              {/* Product thumbnail */}
              <div className="inbox-thumb">
                {conv.productImageUrl ? (
                  <img src={conv.productImageUrl} alt={conv.productName} />
                ) : (
                  <div className="inbox-thumb-placeholder">🛍️</div>
                )}
              </div>

              {/* Content */}
              <div className="inbox-content">
                <div className="inbox-row-top">
                  <span className="inbox-other-user">{conv.otherUserEmail}</span>
                  <span className="inbox-time">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div className="inbox-product-name">{conv.productName}</div>
                <div className="inbox-last-msg">{truncate(conv.lastMessage)}</div>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <div className="inbox-badge">{conv.unreadCount}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inbox;
