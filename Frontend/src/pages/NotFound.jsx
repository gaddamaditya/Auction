import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed; p.x += p.drift;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem",
      position: "relative",
    }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Large 404 */}
        <div className="animate-fade-up" style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(8rem, 20vw, 14rem)",
          fontWeight: 700,
          lineHeight: 1,
          background: "linear-gradient(135deg, rgba(138,111,46,0.4) 0%, rgba(201,168,76,0.8) 50%, rgba(138,111,46,0.4) 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.04em",
          margin: 0,
          userSelect: "none",
        }}>404</div>

        <div className="animate-fade-up delay-200">
          <div className="gold-divider" style={{ margin: "1rem auto", maxWidth: 200 }} />
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "var(--cream)",
            margin: "1.5rem 0 0.75rem",
            letterSpacing: "0.02em",
          }}>This Page Was Not Found</h2>
          <p style={{
            color: "var(--cream-dim)",
            opacity: 0.55,
            fontSize: "0.9rem",
            maxWidth: 340,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}>
            The lot you're looking for may have been removed, ended, or never existed.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/" className="btn-gold" style={{ padding: "0.75rem 2rem", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
              Browse Auctions
            </Link>
            <Link to="/dashboard" className="btn-ghost" style={{ padding: "0.75rem 2rem", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}