import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import Countdown from "../components/Countdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuctionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [latestBidId, setLatestBidId] = useState(null);
  const [priceKey, setPriceKey] = useState(0);
  const [liveFlash, setLiveFlash] = useState(0);
  const joinedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get(`/api/auctions/${id}`),
      api.get(`/api/bids/${id}`).catch(() => ({ data: [] })),
    ])
      .then(([aRes, bRes]) => {
        if (cancelled) return;
        setAuction(aRes.data);
        setBids(Array.isArray(bRes.data) ? bRes.data : []);
      })
      .catch((err) => !cancelled && setError(err?.response?.data?.message || err.message || "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinAuction", id);
    joinedRef.current = true;

    function onNewBid(payload) {
      if (!payload || String(payload.auctionId) !== String(id)) return;
      if (payload.bid) { setBids((prev) => [payload.bid, ...prev]); setLatestBidId(payload.bid._id); }
      setAuction((prev) => prev ? { ...prev, currentBid: payload.currentBid, highestBidder: payload.highestBidder } : prev);
      setPriceKey((k) => k + 1);
      setLiveFlash((k) => k + 1);
    }

    function onAuctionEnded(payload) {
      if (!payload || String(payload.auctionId) !== String(id)) return;
      setAuction((prev) => prev ? { ...prev, status: "ended", winner: payload.winner } : prev);
    }

    socket.on("newBid", onNewBid);
    socket.on("auctionEnded", onAuctionEnded);
    socket.on("connect", () => socket.emit("joinAuction", id));
    return () => {
      socket.off("newBid", onNewBid);
      socket.off("auctionEnded", onAuctionEnded);
      socket.emit("leaveAuction", id);
      joinedRef.current = false;
    };
  }, [socket, id]);

  const highest = useMemo(() => Number(auction?.currentBid ?? 0), [auction]);
  const minNextBid = highest + 1;
  const handleExpire = useCallback(() => {
    setAuction((prev) => prev && prev.status !== "ended" ? { ...prev, status: "ended" } : prev);
  }, []);

  async function placeBid(e) {
    e.preventDefault();
    setBidError(""); setBidSuccess("");
    if (!user) { setBidError("Please log in to place a bid."); return; }
    const amount = Number(bidAmount);
    if (!amount || amount <= highest) { setBidError(`Bid must be greater than ₹${highest.toLocaleString()}`); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/bids`, { auctionId: id, amount });
      setBidAmount("");
      setBidSuccess("Bid placed! 🎉");
      setTimeout(() => setBidSuccess(""), 3000);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || "Failed to place bid";
      if (status === 409) {
        const newBid = err?.response?.data?.currentBid;
        if (newBid && newBid > highest) {
          setAuction((prev) => prev ? { ...prev, currentBid: newBid } : prev);
          setBidError(`Another bidder was faster! Current: ₹${newBid.toLocaleString()}`);
        } else setBidError(message);
      } else setBidError(message);
    } finally { setSubmitting(false); }
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.15)", borderTop: "2px solid var(--gold)", animation: "rotateSlow 1s linear infinite" }} />
      <p style={{ color: "var(--cream-dim)", opacity: 0.5 }}>Loading auction…</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 500, margin: "3rem auto", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "1rem", color: "#e57373" }}>{error}</div>
  );

  if (!auction) return null;

  const isEnded = auction.status === "ended" || (auction.endTime && new Date(auction.endTime).getTime() <= Date.now());
  const isLive = !isEnded && auction.status !== "scheduled";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}
      className="auction-detail-grid"
    >
      <style>{`
        @media (max-width: 900px) { .auction-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Image */}
        <div className="animate-fade-in" style={{ borderRadius: 14, overflow: "hidden", position: "relative", height: 380 }}>
          {auction.image ? (
            <img src={auction.image} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #0e0c07 0%, #1e1a0a 50%, #0e0c07 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "5rem", fontWeight: 700, color: "var(--gold-dim)" }}>
                {(auction.title || "AU").slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 50%)" }} />

          {/* Floating badges */}
          <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: "0.5rem" }}>
            {isLive && (
              <span key={`live-${liveFlash}`} style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.3rem 0.75rem", borderRadius: 40,
                background: "rgba(192,57,43,0.85)", backdropFilter: "blur(8px)",
                color: "#fff", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                border: "1px solid rgba(255,100,100,0.3)",
              }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
                Live
              </span>
            )}
            {isEnded && (
              <span style={{
                padding: "0.3rem 0.75rem", borderRadius: 40,
                background: "rgba(20,20,20,0.85)", backdropFilter: "blur(8px)",
                color: "var(--cream-dim)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                border: "1px solid rgba(201,168,76,0.15)",
              }}>Ended</span>
            )}
          </div>

          {/* Connection indicator */}
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              padding: "0.25rem 0.6rem", borderRadius: 40,
              background: connected ? "rgba(26,107,74,0.8)" : "rgba(180,120,0,0.8)",
              backdropFilter: "blur(8px)",
              fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: connected ? "#86efac" : "#fde68a",
              border: `1px solid ${connected ? "rgba(134,239,172,0.2)" : "rgba(253,230,138,0.2)"}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: connected ? "#86efac" : "#fde68a", display: "inline-block" }} />
              {connected ? "Connected" : "Reconnecting…"}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="animate-fade-up glass-card" style={{ padding: "1.75rem", borderRadius: 14 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--cream)",
            margin: 0,
            letterSpacing: "0.01em",
            lineHeight: 1.15,
          }}>{auction.title}</h1>
          <p style={{ marginTop: "1rem", color: "var(--cream-dim)", lineHeight: 1.75, opacity: 0.75, fontSize: "0.9rem" }}>
            {auction.description}
          </p>
        </div>

        {/* Winner Banner */}
        {isEnded && auction.winner && (
          <div className="animate-fade-up" style={{
            padding: "1.5rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.05) 100%)",
            border: "1px solid rgba(201,168,76,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
            <div style={{ fontSize: "2.5rem" }}>🏆</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gold-light)", margin: 0 }}>
                Auction Complete
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--cream-dim)", margin: "0.2rem 0 0" }}>
                Won by <strong style={{ color: "var(--cream)" }}>{auction.winner?.name || "—"}</strong> for{" "}
                <strong style={{ color: "var(--gold)" }}>₹{highest.toLocaleString()}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Bid History */}
        <div className="animate-fade-up glass-card" style={{ padding: "1.75rem", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--cream)", margin: 0 }}>
              Bid History
            </h2>
            {bids.length > 0 && (
              <span style={{
                fontSize: "0.7rem", color: "var(--gold-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "rgba(201,168,76,0.08)", padding: "0.25rem 0.6rem", borderRadius: 4,
                border: "1px solid rgba(201,168,76,0.15)",
              }}>
                {bids.length} bid{bids.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="gold-divider" style={{ marginBottom: "1rem" }} />

          {bids.length === 0 ? (
            <p style={{ color: "var(--cream-dim)", opacity: 0.5, fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
              No bids yet. Be the first to bid!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {bids.map((b, i) => {
                const isNewest = b._id && b._id === latestBidId;
                return (
                  <div
                    key={b._id || i}
                    className={isNewest ? "bid-flash slide-in" : ""}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: 8,
                      background: i === 0 ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${i === 0 ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(138,111,46,0.5), rgba(201,168,76,0.3))",
                        border: "1px solid rgba(201,168,76,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700, color: "var(--gold)",
                        textTransform: "uppercase", flexShrink: 0,
                      }}>
                        {(b.bidder?.name || "A")[0]}
                      </div>
                      <div>
                        <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "0.85rem", margin: 0 }}>
                          {b.bidder?.name || "Anonymous"}
                        </p>
                        {b.createdAt && (
                          <p style={{ color: "var(--cream-dim)", fontSize: "0.7rem", margin: "0.1rem 0 0", opacity: 0.5 }}>
                            {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        ₹{Number(b.amount).toLocaleString()}
                      </span>
                      {i === 0 && (
                        <span style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "0.2rem 0.5rem",
                          borderRadius: 3,
                          background: "rgba(201,168,76,0.15)",
                          border: "1px solid rgba(201,168,76,0.3)",
                          color: "var(--gold)",
                        }}>TOP</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside>
        <div className="glass-card animate-fade-up delay-200" style={{
          padding: "2rem",
          borderRadius: 14,
          position: "sticky",
          top: "5rem",
        }}>
          {/* Price */}
          <p style={{
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--gold-dim)",
            margin: 0,
            fontWeight: 500,
          }}>Current Highest Bid</p>

          <div
            key={`price-${priceKey}`}
            className={priceKey > 0 ? "price-pulse" : ""}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.8rem",
              fontWeight: 700,
              marginTop: "0.3rem",
              lineHeight: 1,
              background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ₹{highest.toLocaleString()}
          </div>

          {auction.highestBidder && (
            <p style={{ fontSize: "0.75rem", color: "var(--cream-dim)", margin: "0.35rem 0 0", opacity: 0.65 }}>
              by <span style={{ color: "var(--cream)", fontWeight: 500 }}>{auction.highestBidder?.name}</span>
            </p>
          )}

          <div className="gold-divider" style={{ margin: "1.25rem 0" }} />

          {/* Timer */}
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.6rem", fontWeight: 500 }}>
              {isEnded ? "Status" : "Time Remaining"}
            </p>
            <Countdown endTime={auction.endTime} onExpire={handleExpire} showLabels={true} />
          </div>

          <div style={{
            padding: "0.75rem",
            borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.08)",
            marginBottom: "1.25rem",
          }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.3rem", fontWeight: 500 }}>
              Seller
            </p>
            <p style={{ color: "var(--cream)", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
              {auction.seller?.name || "—"}
            </p>
          </div>

          <div className="gold-divider" style={{ marginBottom: "1.25rem" }} />

          {/* Bid Form */}
          {!isEnded ? (
            <form onSubmit={placeBid} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--gold-dim)",
                fontWeight: 500,
              }}>
                Your Bid{" "}
                <span style={{ color: "rgba(201,168,76,0.4)", fontWeight: 400 }}>
                  (min ₹{minNextBid.toLocaleString()})
                </span>
              </label>
              <input
                id="bid-amount-input"
                type="number"
                min={minNextBid}
                step="1"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`${minNextBid}`}
                className="input-luxury"
                style={{ width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box", fontSize: "1rem" }}
              />
              {bidError && (
                <p style={{
                  fontSize: "0.78rem",
                  color: "#e57373",
                  background: "rgba(192,57,43,0.08)",
                  border: "1px solid rgba(192,57,43,0.2)",
                  borderRadius: 6,
                  padding: "0.5rem 0.75rem",
                  margin: 0,
                }}>⚠ {bidError}</p>
              )}
              {bidSuccess && (
                <p style={{
                  fontSize: "0.78rem",
                  color: "#86efac",
                  background: "rgba(26,107,74,0.1)",
                  border: "1px solid rgba(134,239,172,0.2)",
                  borderRadius: 6,
                  padding: "0.5rem 0.75rem",
                  margin: 0,
                }}>{bidSuccess}</p>
              )}
              <button
                id="place-bid-btn"
                type="submit"
                disabled={submitting || !connected}
                className="btn-gold"
                style={{ padding: "0.9rem", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.85rem" }}
              >
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTop: "2px solid rgba(0,0,0,0.8)", animation: "rotateSlow 0.8s linear infinite", display: "inline-block" }} />
                    Placing Bid…
                  </span>
                ) : "Place Bid"}
              </button>
              {!user && (
                <p style={{ fontSize: "0.72rem", color: "var(--cream-dim)", textAlign: "center", opacity: 0.6 }}>
                  <a href="/login" style={{ color: "var(--gold)" }}>Log in</a> to place a bid
                </p>
              )}
              {!connected && (
                <p style={{ fontSize: "0.72rem", color: "#fde68a", textAlign: "center" }}>Reconnecting…</p>
              )}
            </form>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                color: "var(--cream-dim)",
                margin: 0,
              }}>This auction has ended.</p>
              {auction.winner && (
                <p style={{ fontSize: "0.85rem", color: "var(--cream-dim)", margin: "0.5rem 0 0", opacity: 0.65 }}>
                  Winner: <strong style={{ color: "var(--gold)" }}>{auction.winner?.name}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}