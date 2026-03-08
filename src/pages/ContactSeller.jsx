import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { sendMessage, getConversation } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import { useMessageStream } from "../hooks/useMessageStream";
import "./ContactSeller.css";

/**
 * Real-time conversation page between a buyer and a seller about a product.
 *
 * URL:   /contact-seller/:otherUserId
 * State: { productId, sellerEmail, product }
 *
 * Real-time strategy
 * ──────────────────
 * Primary:  Server-Sent Events via useMessageStream. The server pushes a
 *           MessageResponseDto the instant a message is saved. The handler
 *           below appends it to the message list only when it belongs to
 *           this conversation (matching productId + both participants).
 *
 * Fallback: A 30-second polling interval continues to run so that
 *           messages are never permanently lost if the SSE connection
 *           drops and the browser has not yet reconnected.
 *
 * Optimistic UI: sent messages appear immediately in the bubble list
 *           and are replaced with the authoritative server copy on response.
 */
function ContactSeller() {
  const { sellerId: otherUserIdParam } = useParams();
  const otherUserId  = Number(otherUserIdParam);
  const navigate     = useNavigate();
  const loc          = useLocation();
  const { isLoggedIn, email: myEmail } = useAuth();

  const productId   = loc.state?.productId  ?? null;
  const sellerEmail = loc.state?.sellerEmail ?? loc.state?.seller ?? "Seller";
  const product     = loc.state?.product     ?? null;

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Auth gate ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  // ── Initial load + fallback polling ───────────────────────────────────
  const loadConversation = useCallback(async (silent = false) => {
    if (!productId || !otherUserId) {
      setError("Missing product or user information.");
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      const data = await getConversation(productId, otherUserId);
      // Replace the entire list — deduplication is handled by the server
      // which returns the canonical ordered set every time.
      setMessages(data);
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.message || "Failed to load conversation.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [productId, otherUserId]);

  useEffect(() => {
    loadConversation();
    // Fallback poll every 30 s (SSE handles the real-time case)
    const interval = setInterval(() => loadConversation(true), 30_000);
    return () => clearInterval(interval);
  }, [loadConversation]);

  // ── SSE: real-time incoming messages ──────────────────────────────────
  const handleIncomingMessage = useCallback((dto) => {
    // Only handle messages that belong to this conversation:
    //   same product, and the two participants are myEmail and the other user.
    if (dto.productId !== productId) return;

    const participants = new Set([dto.senderEmail, dto.receiverEmail]);
    if (!participants.has(myEmail)) return;

    // Check the other participant matches
    const otherEmail = [...participants].find(e => e !== myEmail);
    // We know the other user's email from sellerEmail (which is their email)
    if (otherEmail !== sellerEmail) return;

    setMessages(prev => {
      // Replace any optimistic placeholder with the same content, or append
      const optimisticIdx = prev.findIndex(
        m => m._optimistic && m.content === dto.content && m.senderEmail === dto.senderEmail
      );
      if (optimisticIdx !== -1) {
        // Swap optimistic → confirmed
        const next = [...prev];
        next[optimisticIdx] = dto;
        return next;
      }
      // New message from the other person — append if not already present
      if (prev.some(m => m.id === dto.id)) return prev;
      return [...prev, dto];
    });
  }, [productId, myEmail, sellerEmail]);

  useMessageStream(handleIncomingMessage, !!isLoggedIn);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ───────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const optimistic = {
      id:          `opt-${Date.now()}`,
      senderEmail: myEmail,
      content:     input.trim(),
      timestamp:   new Date().toISOString(),
      read:        false,
      _optimistic: true,
    };

    // Append optimistic bubble immediately
    setMessages(prev => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const saved = await sendMessage(productId, otherUserId, optimistic.content);
      // The SSE push-back to the sender will trigger handleIncomingMessage
      // which swaps the optimistic entry for the real one. If SSE is not
      // connected we do it here manually as a safety net.
      setMessages(prev => {
        if (prev.some(m => m.id === saved.id)) {
          // SSE already replaced the optimistic entry — just ensure it's removed
          return prev.filter(m => m.id !== optimistic.id);
        }
        return prev.map(m => (m.id === optimistic.id ? saved : m));
      });
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(optimistic.content);
      setError(err.response?.data?.message || "Failed to send message. Try again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const isMe = (msg) => msg.senderEmail === myEmail;

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d         = new Date(ts);
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString())     return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const label = formatDate(msg.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="cs-page">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="cs-topbar">
        <button className="cs-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="cs-topbar-info">
          <span className="cs-avatar">👤</span>
          <div>
            <div className="cs-topbar-name">{sellerEmail}</div>
            <div className="cs-topbar-sub">
              {product ? product.name : "Conversation"}
            </div>
          </div>
        </div>
        {/* Live indicator dot */}
        <div className="cs-live-indicator" title="Live — messages update in real time">
          <span className="cs-live-dot" />
          <span className="cs-live-label">Live</span>
        </div>
      </div>

      <div className="cs-layout">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="cs-sidebar">
          {product && (
            <div className="cs-product-card">
              {Array.isArray(product.images) && product.images.length > 0 && (
                <img src={product.images[0]} alt={product.name} className="cs-product-img" />
              )}
              <div className="cs-product-info">
                <p className="cs-product-name">{product.name}</p>
                <p className="cs-product-price">
                  ₹{product.price?.toLocaleString("en-IN")}
                </p>
                <span className="cs-product-badge">{product.category}</span>
              </div>
            </div>
          )}
          <div className="cs-trust-list">
            <div className="cs-trust-item"><span>✅</span> Verified Seller</div>
            <div className="cs-trust-item"><span>🚚</span> Fast Shipping</div>
            <div className="cs-trust-item"><span>🔄</span> Easy Returns</div>
          </div>
        </aside>

        {/* ── Chat panel ───────────────────────────────────────────── */}
        <section className="cs-chat">

          <div className="cs-messages">
            {loading ? (
              <div className="cs-state-center">
                <div className="cs-spinner" />
                <p>Loading conversation…</p>
              </div>
            ) : Object.keys(groupedMessages).length === 0 ? (
              <div className="cs-state-center cs-empty">
                <span className="cs-empty-icon">💬</span>
                <p>No messages yet.</p>
                <p className="cs-empty-sub">Say hello to start the conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                <div key={dateLabel}>
                  <div className="cs-date-divider"><span>{dateLabel}</span></div>
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`cs-bubble-row ${isMe(msg) ? "cs-me" : "cs-them"} ${msg._optimistic ? "cs-optimistic" : ""}`}
                    >
                      {!isMe(msg) && <div className="cs-bubble-avatar">👤</div>}
                      <div className="cs-bubble-wrap">
                        <div className="cs-bubble">{msg.content}</div>
                        <div className="cs-bubble-meta">
                          {formatTime(msg.timestamp)}
                          {isMe(msg) && (
                            <span className="cs-read-tick">
                              {msg._optimistic ? " ●" : msg.read ? " ✓✓" : " ✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="cs-error-strip">
              {error}
              <button onClick={() => setError("")}>✕</button>
            </div>
          )}

          <form className="cs-input-bar" onSubmit={handleSend}>
            <textarea
              ref={inputRef}
              className="cs-textarea"
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              maxLength={2000}
            />
            <button
              type="submit"
              className="cs-send-btn"
              disabled={!input.trim() || sending}
            >
              {sending ? <span className="cs-send-spinner" /> : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ContactSeller;
