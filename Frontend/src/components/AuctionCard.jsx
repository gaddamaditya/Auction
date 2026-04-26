import { useState } from "react";
import { Link } from "react-router-dom";
import Countdown from "./Countdown.jsx";

export default function AuctionCard({ auction, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const id = auction._id;
  const highest = auction.currentBid ?? 0;
  const isEnded = auction.status === "ended" || (auction.endTime && new Date(auction.endTime) <= new Date());

  const initials = (auction.title?.slice(0, 2) || "AU").toUpperCase();

  // Stagger animation delay based on index
  const delay = Math.min(index * 80, 500);

  return (
    <Link
      to={`/auctions/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-up"
      style={{
        display: "block",
        textDecoration: "none",
        animationDelay: `${delay}ms`,
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(255,255,255,0.025)",
        border: `1px solid rgba(201,168,76,${hovered ? "0.35" : "0.1"})`,
        boxShadow: hovered
          ? "0 16px 60px rgba(0,0,0,0.6), 0 0 30px rgba(201,168,76,0.07)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Image */}
      <div style={{ width: "100%", height: 200, overflow: "hidden", position: "relative" }}>
        {auction.image ? (
          <img
            src={auction.image}
            alt={auction.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1507 0%, #2d2410 50%, #1a1507 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "3rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold-light))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{initials}</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 60%)",
        }} />

        {/* Status badge */}
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "0.25rem 0.6rem",
          borderRadius: 4,
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
          background: isEnded ? "rgba(30,30,30,0.9)" : "rgba(192,57,43,0.9)",
          color: isEnded ? "var(--cream-dim)" : "#fff",
          border: `1px solid ${isEnded ? "rgba(201,168,76,0.15)" : "rgba(255,100,100,0.3)"}`,
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
        }}>
          {!isEnded && <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b6b", display: "inline-block" }} />}
          {isEnded ? "Ended" : "Live"}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          fontWeight: 600,
          color: "var(--cream)",
          margin: 0,
          lineHeight: 1.3,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          letterSpacing: "0.01em",
        }}>{auction.title}</h3>

        <p style={{
          fontSize: "0.8rem",
          color: "var(--cream-dim)",
          margin: "0.5rem 0 0",
          lineHeight: 1.5,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          minHeight: "2.4rem",
          opacity: 0.7,
        }}>{auction.description}</p>

        {/* Divider */}
        <div className="gold-divider" style={{ margin: "1rem 0" }} />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.65rem", color: "var(--gold-dim)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
              Highest Bid
            </p>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0.1rem 0 0",
              background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>
              ₹{Number(highest).toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.65rem", color: "var(--gold-dim)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
              {isEnded ? "Status" : "Ends In"}
            </p>
            <div style={{ marginTop: "0.1rem" }}>
              <Countdown endTime={auction.endTime} compact className="text-sm" />
            </div>
          </div>
        </div>

        {/* Bid button hint on hover */}
        <div style={{
          marginTop: "1rem",
          padding: "0.55rem",
          borderRadius: 6,
          textAlign: "center",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
          transition: "all 0.3s ease",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
          background: "linear-gradient(135deg, rgba(138,111,46,0.4), rgba(201,168,76,0.2))",
          border: "1px solid rgba(201,168,76,0.3)",
          color: "var(--gold-light)",
        }}>
          {isEnded ? "View Results →" : "Place a Bid →"}
        </div>
      </div>
    </Link>
  );
}