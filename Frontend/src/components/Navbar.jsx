import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkStyle = (isActive) => ({
    padding: "0.4rem 0.9rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontFamily: "var(--font-body)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 500,
    transition: "all 0.25s ease",
    color: isActive ? "var(--obsidian)" : "var(--cream-dim)",
    background: isActive ? "var(--gold)" : "transparent",
    border: isActive ? "none" : "1px solid transparent",
    textDecoration: "none",
    display: "inline-block",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(8,8,8,0.95)" : "rgba(8,8,8,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid rgba(201,168,76,${scrolled ? "0.2" : "0.1"})`,
        transition: "all 0.35s ease",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span className="text-gold-shimmer">BidArena</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
          <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
            Auctions
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
                Dashboard
              </NavLink>
              {(user.role === "seller" || user.role === "admin") && (
                <NavLink to="/create" style={({ isActive }) => linkStyle(isActive)}>
                  Sell
                </NavLink>
              )}
              {user.role === "admin" && (
                <NavLink to="/admin" style={({ isActive }) => linkStyle(isActive)}>
                  Admin
                </NavLink>
              )}
            </>
          )}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.75rem" }}>
              <div style={{
                width: 1,
                height: 20,
                background: "rgba(201,168,76,0.25)",
              }} />
              <span style={{
                fontSize: "0.75rem",
                color: "var(--cream-dim)",
                letterSpacing: "0.03em",
              }}>
                {user.name || user.email}
              </span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="btn-ghost"
                style={{ padding: "0.35rem 0.9rem", borderRadius: 4, cursor: "pointer" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.75rem" }}>
              <NavLink to="/login" style={({ isActive }) => linkStyle(isActive)}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="btn-gold"
                style={{ padding: "0.4rem 1rem", borderRadius: 4, textDecoration: "none", display: "inline-block" }}
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}