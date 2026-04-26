import { useEffect, useState } from "react";
import api from "../lib/api.js";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card animate-fade-up" style={{ padding: "1.75rem", borderRadius: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "1.5rem", opacity: 0.3 }}>{icon}</div>
      <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-dim)", margin: 0, fontWeight: 500 }}>{label}</p>
      <p style={{
        fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 700, margin: "0.3rem 0 0",
        background: color || "linear-gradient(135deg, var(--gold), var(--gold-light))",
        backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}>{value ?? "—"}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin:  { bg: "rgba(192,57,43,0.15)",  border: "rgba(192,57,43,0.35)",  color: "#e57373" },
    seller: { bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.3)",  color: "var(--gold)" },
    buyer:  { bg: "rgba(26,107,74,0.12)",  border: "rgba(134,239,172,0.2)", color: "#86efac" },
  };
  const s = styles[role] || styles.buyer;
  return (
    <span style={{
      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "0.2rem 0.55rem", borderRadius: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{role}</span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active:  { bg: "rgba(26,107,74,0.12)",  border: "rgba(134,239,172,0.2)", color: "#86efac" },
    live:    { bg: "rgba(26,107,74,0.12)",  border: "rgba(134,239,172,0.2)", color: "#86efac" },
    ended:   { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", color: "var(--cream-dim)" },
    scheduled:{ bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.25)", color: "var(--gold)" },
  };
  const s = styles[status] || styles.ended;
  return (
    <span style={{
      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "0.2rem 0.55rem", borderRadius: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{status}</span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [sR, uR, aR] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/users"),
          api.get("/api/admin/auctions"),
        ]);
        setStats(sR.data); setUsers(uR.data); setAuctions(aR.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load admin data");
      } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  async function handleStopAuction(id) {
    if (!window.confirm("Stop this auction early?")) return;
    try {
      await api.post(`/api/admin/auctions/${id}/stop`);
      setAuctions(auctions.map(a => a._id === id ? { ...a, status: "ended" } : a));
      api.get("/api/admin/stats").then(res => setStats(res.data)).catch(() => {});
    } catch (err) { alert("Failed: " + (err?.response?.data?.message || err.message)); }
  }

  async function handleDeleteAuction(id) {
    if (!window.confirm("Permanently delete this auction and all its bids?")) return;
    try {
      await api.delete(`/api/admin/auctions/${id}`);
      setAuctions(auctions.filter(a => a._id !== id));
      api.get("/api/admin/stats").then(res => setStats(res.data)).catch(() => {});
    } catch (err) { alert("Failed: " + (err?.response?.data?.message || err.message)); }
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.15)", borderTop: "2px solid var(--gold)", animation: "rotateSlow 1s linear infinite" }} />
      <p style={{ color: "var(--cream-dim)", opacity: 0.5 }}>Loading admin data…</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 500, margin: "3rem auto", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "1rem", color: "#e57373" }}>{error}</div>
  );

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.4rem", fontWeight: 500 }}>
          Administrator
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 700, color: "var(--cream)", margin: 0 }}>
          Control Panel
        </h1>
        <p style={{ color: "var(--cream-dim)", opacity: 0.55, marginTop: "0.4rem", fontSize: "0.9rem" }}>
          Full system overview and management controls.
        </p>
      </div>

      <div className="gold-divider" style={{ marginBottom: "2.5rem" }} />

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          <StatCard label="Total Users"       value={stats.totalUsers}        icon="◉" />
          <StatCard label="Total Auctions"    value={stats.totalAuctions}     icon="◈" />
          <StatCard label="Live Auctions"     value={stats.activeAuctions}    icon="◆" color="linear-gradient(135deg, #1a6b4a, #86efac)" />
          <StatCard label="Completed"         value={stats.completedAuctions} icon="✦" color="linear-gradient(135deg, #6b5420, var(--gold))" />
        </div>
      )}

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Users */}
        <div className="glass-card animate-fade-up delay-200" style={{ borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--cream)", margin: 0 }}>Users</h2>
            <span style={{ fontSize: "0.7rem", color: "var(--gold-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {users.length} total
            </span>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {users.map((u, i) => (
              <div key={u._id} style={{
                padding: "0.9rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(138,111,46,0.4), rgba(201,168,76,0.2))",
                    border: "1px solid rgba(201,168,76,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, color: "var(--gold)",
                    textTransform: "uppercase", flexShrink: 0,
                  }}>
                    {(u.name || u.email || "?")[0]}
                  </div>
                  <div>
                    <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "0.85rem", margin: 0 }}>{u.name}</p>
                    <p style={{ color: "var(--cream-dim)", fontSize: "0.72rem", margin: "0.1rem 0 0", opacity: 0.55 }}>{u.email}</p>
                  </div>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Auctions */}
        <div className="glass-card animate-fade-up delay-300" style={{ borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--cream)", margin: 0 }}>Auctions</h2>
            <span style={{ fontSize: "0.7rem", color: "var(--gold-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {auctions.length} total
            </span>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {auctions.map((a) => (
              <div key={a._id} style={{
                padding: "0.9rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "0.85rem", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.title}
                  </p>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--cream-dim)", opacity: 0.6 }}>
                      {a.seller?.name || "Unknown"} · 
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--gold)", marginLeft: "0.25rem" }}>
                      ₹{(a.currentBid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {a.status !== "ended" && (
                      <button
                        onClick={() => handleStopAuction(a._id)}
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: 4,
                          border: "1px solid rgba(201,168,76,0.25)",
                          background: "rgba(201,168,76,0.08)",
                          color: "var(--gold)",
                          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                          cursor: "pointer", transition: "all 0.2s ease",
                        }}
                      >
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAuction(a._id)}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border: "1px solid rgba(192,57,43,0.3)",
                        background: "rgba(192,57,43,0.08)",
                        color: "#e57373",
                        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}