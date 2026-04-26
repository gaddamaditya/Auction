import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  { value: "buyer", label: "Buyer", desc: "Browse & bid on listings", icon: "◆" },
  { value: "seller", label: "Seller", desc: "List & manage auctions", icon: "◈" },
  { value: "admin", label: "Admin", desc: "Manage the platform", icon: "◉" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Registration failed");
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
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-scale-in glass-card" style={{
        width: "100%",
        maxWidth: 460,
        padding: "3rem 2.5rem",
        borderRadius: 16,
        position: "relative",
        zIndex: 1,
      }}>
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
          }}>✦</div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--cream)",
            margin: 0,
          }}>Create Account</h1>
          <p style={{ color: "var(--cream-dim)", fontSize: "0.85rem", margin: "0.4rem 0 0", opacity: 0.65 }}>
            Join the premier auction platform
          </p>
        </div>

        <div className="gold-divider" style={{ marginBottom: "2rem" }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {[
            { key: "name", label: "Full Name", type: "text", required: true },
            { key: "email", label: "Email Address", type: "email", required: true },
            { key: "password", label: "Password", type: "password", required: true, minLength: 6 },
          ].map((field) => (
            <div key={field.key}>
              <label style={{
                display: "block",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--gold-dim)",
                marginBottom: "0.4rem",
                fontWeight: 500,
              }}>{field.label}</label>
              <input
                type={field.type}
                required={field.required}
                minLength={field.minLength}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="input-luxury"
                style={{ width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box", fontSize: "0.9rem" }}
              />
            </div>
          ))}

          {/* Role selector */}
          <div>
            <label style={{
              display: "block",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: "0.6rem",
              fontWeight: 500,
            }}>Account Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: 8,
                    border: form.role === r.value
                      ? "1px solid var(--gold)"
                      : "1px solid rgba(201,168,76,0.15)",
                    background: form.role === r.value
                      ? "rgba(201,168,76,0.12)"
                      : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    color: form.role === r.value ? "var(--gold-light)" : "var(--cream-dim)",
                  }}
                >
                  <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{r.icon}</div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em" }}>{r.label}</div>
                  <div style={{ fontSize: "0.62rem", opacity: 0.6, marginTop: 2 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: 6,
              background: "rgba(192,57,43,0.1)",
              border: "1px solid rgba(192,57,43,0.3)",
              color: "#e57373",
              fontSize: "0.82rem",
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{ padding: "0.85rem", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "0.8rem", marginTop: "0.25rem" }}
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <div className="gold-divider" style={{ margin: "2rem 0 1.25rem" }} />

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--cream-dim)", opacity: 0.6, margin: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}