import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-scale-in glass-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          Set New Password
        </h1>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              color: "#16a34a",
              fontSize: "0.875rem",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "0.5rem",
                background: "rgba(0, 0, 0, 0.2)",
                color: "#fff",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "0.5rem",
                background: "rgba(0, 0, 0, 0.2)",
                color: "#fff",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading
                ? "rgba(201, 168, 76, 0.3)"
                : "linear-gradient(135deg, rgb(201, 168, 76), rgb(235, 195, 64))",
              color: "#000",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem",
              transition: "all 0.3s ease",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.875rem" }}>
          <Link
            to="/login"
            style={{
              color: "rgb(201, 168, 76)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
