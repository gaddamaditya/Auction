import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";

const FIELDS = [
  { key: "title", label: "Listing Title", type: "text", required: true, placeholder: "e.g. Vintage Rolex Submariner 1966", full: true },
  { key: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe the item — condition, provenance, notable features…", full: true },
  { key: "startingPrice", label: "Starting Price (₹)", type: "number", required: true, min: 0, step: 1, placeholder: "10000" },
  { key: "bidIncrement", label: "Bid Increment (₹)", type: "number", required: false, min: 1, step: 1, placeholder: "500" },
  { key: "endTime", label: "Auction End Time", type: "datetime-local", required: true, full: true },
  { key: "image", label: "Image URL (optional)", type: "url", required: false, placeholder: "https://images.unsplash.com/…", full: true },
];

export default function CreateAuction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", startingPrice: "", bidIncrement: "1", endTime: "", image: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        basePrice: Number(form.startingPrice),
        startTime: new Date().toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        image: form.image,
      };
      const { data } = await api.post("/api/auctions", payload);
      const newId = data?.auction?.id || data?.id || data?._id;
      navigate(newId ? `/auctions/${newId}` : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create auction");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.4rem", fontWeight: 500 }}>
          Seller Portal
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 700, color: "var(--cream)", margin: 0 }}>
          Create a Listing
        </h1>
        <p style={{ color: "var(--cream-dim)", opacity: 0.6, marginTop: "0.4rem", fontSize: "0.9rem" }}>
          List your item for live competitive bidding.
        </p>
      </div>

      <div className="gold-divider" style={{ marginBottom: "2.5rem" }} />

      {/* Preview strip */}
      {form.image && (
        <div className="animate-fade-in glass-card" style={{ borderRadius: 12, overflow: "hidden", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1.25rem", padding: "1rem" }}>
          <img src={form.image} alt="preview" onError={(e) => e.target.style.display = "none"}
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(201,168,76,0.2)", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-dim)", margin: 0, fontWeight: 500 }}>Preview</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--cream)", margin: "0.2rem 0 0" }}>
              {form.title || "Your listing title"}
            </p>
            {form.startingPrice && (
              <p style={{ fontSize: "0.8rem", color: "var(--gold)", margin: "0.1rem 0 0" }}>
                Starting at ₹{Number(form.startingPrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="animate-fade-up delay-100">
        <div className="glass-card" style={{ borderRadius: 16, padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {FIELDS.map((f) => (
            <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
              <label style={{
                display: "block",
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--gold-dim)",
                marginBottom: "0.45rem",
                fontWeight: 500,
              }}>{f.label}</label>

              {f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  rows={4}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="input-luxury"
                  style={{ width: "100%", padding: "0.75rem 1rem", boxSizing: "border-box", fontSize: "0.9rem", resize: "vertical", fontFamily: "var(--font-body)" }}
                />
              ) : (
                <input
                  type={f.type}
                  required={f.required}
                  min={f.min}
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="input-luxury"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    boxSizing: "border-box",
                    fontSize: "0.9rem",
                    colorScheme: "dark",
                  }}
                />
              )}
            </div>
          ))}

          {error && (
            <div style={{
              gridColumn: "1 / -1",
              padding: "0.75rem 1rem",
              borderRadius: 6,
              background: "rgba(192,57,43,0.1)",
              border: "1px solid rgba(192,57,43,0.3)",
              color: "#e57373",
              fontSize: "0.82rem",
            }}>⚠ {error}</div>
          )}

          {/* Summary box */}
          {(form.title || form.startingPrice) && (
            <div style={{
              gridColumn: "1 / -1",
              padding: "1rem",
              borderRadius: 8,
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.12)",
            }}>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold-dim)", margin: "0 0 0.5rem", fontWeight: 500 }}>
                Listing Summary
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                {form.title && <span style={{ fontSize: "0.85rem", color: "var(--cream)" }}>{form.title}</span>}
                {form.startingPrice && (
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--gold)" }}>
                    ₹{Number(form.startingPrice).toLocaleString()} starting
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: "100%", padding: "1rem", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTop: "2px solid rgba(0,0,0,0.8)", animation: "rotateSlow 0.8s linear infinite", display: "inline-block" }} />
                  Creating Listing…
                </span>
              ) : "Launch Auction →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}