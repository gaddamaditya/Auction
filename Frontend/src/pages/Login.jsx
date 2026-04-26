import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-scale-in glass-card" style={{
        width: "100%",
        maxWidth: 420,
        padding: "3rem 2.5rem",
        borderRadius: 16,
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header ornament */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-block",
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.3)",
            background: "rgba(201,168,76,0.05)",
            marginBottom: "1.25rem",
            lineHeight: "50px",
            fontSize: "1.3rem",
          }}>⚖</div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--cream)",
            margin: 0,
            letterSpacing: "0.02em",
          }}>Welcome Back</h1>
          <p style={{
            color: "var(--cream-dim)",
            fontSize: "0.85rem",
            margin: "0.4rem 0 0",
            opacity: 0.65,
          }}>Sign in to your auction account</p>
        </div>

        <div className="gold-divider" style={{ marginBottom: "2rem" }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: "0.4rem",
              fontWeight: 500,
            }}>Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              className="input-luxury"
              style={{ width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: "0.4rem",
              fontWeight: 500,
            }}>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              className="input-luxury"
              style={{ width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box", fontSize: "0.9rem" }}
            />
          </div>

          {error && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: 6,
              background: "rgba(192,57,43,0.1)",
              border: "1px solid rgba(192,57,43,0.3)",
              color: "#e57373",
              fontSize: "0.82rem",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{ padding: "0.85rem", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "0.8rem", marginTop: "0.25rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.3)",
                  borderTop: "2px solid rgba(0,0,0,0.8)",
                  animation: "rotateSlow 0.8s linear infinite",
                  display: "inline-block",
                }} />
                Signing in…
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="gold-divider" style={{ margin: "2rem 0 1.25rem" }} />

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--cream-dim)", opacity: 0.6, margin: 0 }}>
          New to BidArena?{" "}
          <Link to="/register" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}