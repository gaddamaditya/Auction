import { useEffect, useRef, useState, useCallback } from "react";

function diffParts(targetMs) {
  const now = Date.now();
  let delta = Math.max(0, targetMs - now);
  const days = Math.floor(delta / 86_400_000); delta -= days * 86_400_000;
  const hours = Math.floor(delta / 3_600_000); delta -= hours * 3_600_000;
  const minutes = Math.floor(delta / 60_000); delta -= minutes * 60_000;
  const seconds = Math.floor(delta / 1_000);
  const totalSeconds = Math.floor(Math.max(0, targetMs - now) / 1_000);
  return { days, hours, minutes, seconds, totalSeconds, finished: targetMs <= Date.now() };
}

function Digit({ value, label, urgent }) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true);
      const t = setTimeout(() => { setPrev(value); setFlipping(false); }, 280);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        background: urgent ? "rgba(192,57,43,0.15)" : "rgba(201,168,76,0.08)",
        border: `1px solid ${urgent ? "rgba(192,57,43,0.3)" : "rgba(201,168,76,0.2)"}`,
        borderRadius: 6,
        minWidth: "2.2rem",
        padding: "0.2rem 0.3rem",
        textAlign: "center",
        transition: "transform 0.22s ease, opacity 0.22s ease",
        transform: flipping ? "translateY(-5px) scale(0.88)" : "translateY(0) scale(1)",
        opacity: flipping ? 0.3 : 1,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "var(--font-display)",
        fontSize: "inherit",
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: urgent ? "#e57373" : "var(--gold-light)",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      {label && (
        <span style={{
          fontSize: "0.55rem",
          opacity: 0.55,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: "0.2rem",
          color: urgent ? "#e57373" : "var(--gold-dim)",
        }}>{label}</span>
      )}
    </div>
  );
}

function Colon({ blink, urgent }) {
  return (
    <span style={{
      transition: "opacity 0.2s",
      opacity: blink ? 0.2 : 0.7,
      paddingBottom: "0.8rem",
      fontWeight: 700,
      fontSize: "inherit",
      color: urgent ? "#e57373" : "var(--gold-dim)",
    }}>:</span>
  );
}

export default function Countdown({ endTime, onExpire, className = "", compact = false, showLabels = true }) {
  const target = endTime ? new Date(endTime).getTime() : 0;
  const [parts, setParts] = useState(() => diffParts(target));
  const [blink, setBlink] = useState(false);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!target) return;
    expiredRef.current = false;
    const tick = () => {
      const p = diffParts(target);
      setParts(p);
      setBlink((b) => !b);
      if (p.finished && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    let intervalId;
    const alignId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, msUntilNextSecond);
    return () => { clearTimeout(alignId); clearInterval(intervalId); };
  }, [target]);

  if (!endTime) return <span className={className}>—</span>;

  const urgent = parts.totalSeconds <= 300 && !parts.finished;
  const veryUrgent = parts.totalSeconds <= 60 && !parts.finished;

  if (compact) {
    if (parts.finished) return (
      <span style={{ fontWeight: 600, color: "#e57373", fontSize: "inherit" }}>Ended</span>
    );
    const pad = (n) => String(n).padStart(2, "0");
    return (
      <span style={{
        fontVariantNumeric: "tabular-nums",
        fontWeight: 700,
        color: veryUrgent ? "#e57373" : urgent ? "#f59e0b" : "var(--gold)",
        animation: veryUrgent ? "countdownUrgent 1s infinite" : "none",
      }}>
        {parts.days > 0 && `${parts.days}d `}
        {pad(parts.hours)}:{pad(parts.minutes)}:{pad(parts.seconds)}
      </span>
    );
  }

  if (parts.finished) return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e57373", display: "inline-block", animation: "liveDot 1.4s infinite" }} />
      <span style={{ fontWeight: 600, color: "#e57373", fontSize: "0.9rem" }}>Auction ended</span>
    </div>
  );

  const showDays = parts.days > 0;
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: "0.3rem",
        fontSize: "1.3rem",
      }}
      role="timer"
    >
      {showDays && (
        <>
          <Digit value={parts.days} label={showLabels ? "day" : undefined} urgent={urgent} />
          <Colon blink={blink} urgent={urgent} />
        </>
      )}
      <Digit value={parts.hours} label={showLabels ? "hr" : undefined} urgent={urgent} />
      <Colon blink={blink} urgent={urgent} />
      <Digit value={parts.minutes} label={showLabels ? "min" : undefined} urgent={urgent} />
      <Colon blink={blink} urgent={urgent} />
      <Digit value={parts.seconds} label={showLabels ? "sec" : undefined} urgent={urgent} />
    </div>
  );
}