import { useEffect, useState, useRef } from "react";
import api from "../lib/api.js";
import AuctionCard from "../components/AuctionCard.jsx";
import { useSocket } from "../context/SocketContext.jsx";

// Floating particles background
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const { socket } = useSocket();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get("/api/auctions")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.auctions || [];
        setAuctions(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || "Failed to load auctions");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!socket) return;
    function onAuctionUpdated(payload) {
      if (!payload?.auctionId) return;
      setAuctions((prev) =>
        prev.map((a) =>
          String(a._id) === String(payload.auctionId)
            ? { ...a, currentBid: payload.currentBid ?? a.currentBid, status: payload.status ?? a.status }
            : a
        )
      );
    }
    socket.on("auctionUpdated", onAuctionUpdated);
    return () => socket.off("auctionUpdated", onAuctionUpdated);
  }, [socket]);

  const filtered = auctions.filter((a) =>
    !query ? true :
      (a.title || "").toLowerCase().includes(query.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(query.toLowerCase())
  );

  const liveCount = auctions.filter(a => a.status === "active").length;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Particles />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Hero Section */}
        <section style={{
          textAlign: "center",
          padding: "6rem 1.5rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background radial glow */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 400,
            background: "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="animate-fade-up" style={{ position: "relative" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1rem",
              borderRadius: 40,
              border: "1px solid rgba(201,168,76,0.25)",
              background: "rgba(201,168,76,0.06)",
              marginBottom: "1.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 500,
            }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              {liveCount > 0 ? `${liveCount} Live Auction${liveCount !== 1 ? "s" : ""}` : "Live Bidding Platform"}
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              margin: "0 0 1rem",
              color: "var(--cream)",
            }}>
              Where Rare Things<br />
              <span className="text-gold-shimmer">Find Their Worth</span>
            </h1>

            <p className="animate-fade-up delay-200" style={{
              fontSize: "1.05rem",
              color: "var(--cream-dim)",
              maxWidth: 520,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
              opacity: 0.75,
            }}>
             Exclusivity Has an Address. Where Auctions Define Wort
            </p>

            {/* Search */}
            <div className="animate-fade-up delay-300" style={{
              maxWidth: 500,
              margin: "0 auto",
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gold-dim)",
                fontSize: "1rem",
                pointerEvents: "none",
              }}>⌕</div>
              <input
                id="auction-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search auctions..."
                className="input-luxury"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem 0.9rem 2.8rem",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="animate-fade-up delay-400" style={{
          maxWidth: 1200,
          margin: "0 auto 3rem",
          padding: "0 1.5rem",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(201,168,76,0.1)",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(201,168,76,0.1)",
          }}>
            {[
              { label: "Live Auctions", value: liveCount || "—" },
              { label: "Total Listings", value: auctions.length },
              { label: "Platform Status", value: "Online" },
            ].map((stat) => (
              <div key={stat.label} style={{
                padding: "1.2rem",
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{stat.value}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--cream-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auction Grid */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div className="gold-divider" style={{ flex: 1 }} />
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--gold-dim)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              {query ? `Results for "${query}"` : "Current Listings"}
            </span>
            <div className="gold-divider" style={{ flex: 1 }} />
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid rgba(201,168,76,0.15)",
                borderTop: "2px solid var(--gold)",
                animation: "rotateSlow 1s linear infinite",
                margin: "0 auto 1rem",
              }} />
              <p style={{ color: "var(--cream-dim)", opacity: 0.5, fontSize: "0.85rem" }}>Loading auctions…</p>
            </div>
          )}

          {error && (
            <div style={{
              maxWidth: 500,
              margin: "0 auto",
              background: "rgba(192,57,43,0.1)",
              border: "1px solid rgba(192,57,43,0.3)",
              borderRadius: 8,
              padding: "1rem",
              color: "#e57373",
              fontSize: "0.85rem",
            }}>{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", color: "var(--gold-dim)", marginBottom: "0.5rem" }}>∅</div>
              <p style={{ color: "var(--cream-dim)", opacity: 0.5 }}>No auctions found.</p>
            </div>
          )}

          <div style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}>
            {filtered.map((a, i) => (
              <AuctionCard key={a.id || a._id} auction={a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}