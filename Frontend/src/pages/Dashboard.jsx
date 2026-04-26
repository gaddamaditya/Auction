import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Countdown from "../components/Countdown.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get("/api/auctions/mine").catch(() => ({ data: [] })),
      api.get("/api/bids/mine").catch(() => ({ data: [] })),
    ])
      .then(([a, b]) => {
        if (cancelled) return;
        setMyAuctions(Array.isArray(a.data) ? a.data : []);
        setMyBids(Array.isArray(b.data) ? b.data : []);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    { label: "My Auctions", value: myAuctions.length, icon: "◈" },
    { label: "Active Bids", value: myBids.length, icon: "◆" },
    { label: "Account Type", value: (user?.role || "buyer").toUpperCase(), icon: "◉" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.4rem", fontWeight: 500 }}>
            Welcome back
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 700, color: "var(--cream)", margin: 0, letterSpacing: "0.01em" }}>
            {user?.name || user?.email}
          </h1>
        </div>
        {(user?.role === "seller" || user?.role === "admin") && (
          <Link to="/create" className="btn-gold" style={{ padding: "0.7rem 1.5rem", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
            + New Auction
          </Link>
        )}
      </div>

      <div className="gold-divider" style={{ marginBottom: "2.5rem" }} />

      {/* Stat Cards */}
      <div className="animate-fade-up delay-100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        {statCards.map((s, i) => (
          <div key={s.label} className="glass-card" style={{ padding: "1.5rem", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--gold-dim)" }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, background: "linear-gradient(135deg, var(--gold), var(--gold-light))", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cream-dim)", opacity: 0.6, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "0.75rem 1rem", color: "#e57373", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* My Auctions */}
      <section className="animate-fade-up delay-200" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--cream)", margin: "0 0 1.25rem", fontWeight: 600 }}>
          Your Auctions
        </h2>
        {loading ? (
          <p style={{ color: "var(--cream-dim)", opacity: 0.5 }}>Loading…</p>
        ) : myAuctions.length === 0 ? (
          <div className="glass-card" style={{ padding: "2rem", borderRadius: 12, textAlign: "center" }}>
            <p style={{ color: "var(--cream-dim)", opacity: 0.5, margin: 0 }}>No auctions created yet.</p>
            {(user?.role === "seller" || user?.role === "admin") && (
              <Link to="/create" style={{ display: "inline-block", marginTop: "1rem", color: "var(--gold)", textDecoration: "none", fontSize: "0.85rem" }}>
                Create your first auction →
              </Link>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  {["Title", "Highest Bid", "Ends In", ""].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "0.9rem 1.25rem",
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--gold-dim)",
                      fontWeight: 500,
                      background: "rgba(201,168,76,0.03)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myAuctions.map((a, i) => (
                  <tr key={a.id || a._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--cream)", fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, background: "linear-gradient(135deg, var(--gold), var(--gold-light))", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        ₹{Number(a.currentBid ?? a.highestBid ?? a.startingPrice ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <Countdown endTime={a.endTime} compact />
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <Link to={`/auctions/${a._id || a.id}`} style={{
                        fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--gold)", textDecoration: "none",
                        border: "1px solid rgba(201,168,76,0.2)", padding: "0.3rem 0.75rem", borderRadius: 4,
                        transition: "all 0.2s ease",
                      }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Bids */}
      <section className="animate-fade-up delay-300">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--cream)", margin: "0 0 1.25rem", fontWeight: 600 }}>
          Your Bids
        </h2>
        {loading ? (
          <p style={{ color: "var(--cream-dim)", opacity: 0.5 }}>Loading…</p>
        ) : myBids.length === 0 ? (
          <div className="glass-card" style={{ padding: "2rem", borderRadius: 12, textAlign: "center" }}>
            <p style={{ color: "var(--cream-dim)", opacity: 0.5, margin: 0 }}>No bids placed yet.</p>
            <Link to="/" style={{ display: "inline-block", marginTop: "1rem", color: "var(--gold)", textDecoration: "none", fontSize: "0.85rem" }}>
              Browse auctions →
            </Link>
          </div>
        ) : (
          <div className="glass-card" style={{ borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  {["Auction", "Your Bid", "Time", ""].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0.9rem 1.25rem",
                      fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "var(--gold-dim)", fontWeight: 500, background: "rgba(201,168,76,0.03)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myBids.map((b, i) => (
                  <tr key={b._id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--cream)", fontWeight: 500 }}>
                      {b.auction?.title || b.auctionId || "—"}
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, background: "linear-gradient(135deg, var(--gold), var(--gold-light))", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        ₹{Number(b.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--cream-dim)", opacity: 0.6, fontSize: "0.8rem" }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      {(b.auction?._id || b.auctionId) && (
                        <Link to={`/auctions/${b.auction?._id || b.auctionId}`} style={{
                          fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "var(--gold)", textDecoration: "none",
                          border: "1px solid rgba(201,168,76,0.2)", padding: "0.3rem 0.75rem", borderRadius: 4,
                        }}>View →</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}