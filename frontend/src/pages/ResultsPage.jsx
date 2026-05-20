import { useState, useEffect } from "react";

const ARCHETYPE_CONFIG = [
  { key: "optimizer", label: "The Optimizer", color: "#00d4ff", glow: "rgba(0,212,255,0.25)" },
  { key: "philosopher", label: "The Philosopher", color: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
  { key: "creative", label: "The Creative", color: "#f472b6", glow: "rgba(244,114,182,0.25)" },
  { key: "explorer", label: "The Explorer", color: "#fb923c", glow: "rgba(251,146,60,0.25)" },
  { key: "connector", label: "The Connector", color: "#34d399", glow: "rgba(52,211,153,0.25)" },
  { key: "aesthete", label: "The Aesthete", color: "#fbbf24", glow: "rgba(251,191,36,0.25)" },
];

const CARD_THEMES = {
  ember: { accent: "#ff6b2b", accentSoft: "rgba(255,107,43,0.08)", border: "rgba(255,107,43,0.18)" },
  slate: { accent: "#4fc3f7", accentSoft: "rgba(79,195,247,0.08)", border: "rgba(79,195,247,0.18)" },
  moss: { accent: "#6fcf7a", accentSoft: "rgba(111,207,122,0.08)", border: "rgba(111,207,122,0.18)" },
  indigo: { accent: "#a78bfa", accentSoft: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.18)" },
  rose: { accent: "#f472b6", accentSoft: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.18)" },
  gold: { accent: "#f5c842", accentSoft: "rgba(245,200,66,0.08)", border: "rgba(245,200,66,0.18)" },
};

function CircularMeter({ score, color, glow, label, delay = 0 }) {
  const [animated, setAnimated] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = animated ? circ * (1 - score / 100) : circ;

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimated(true);
      const duration = 1400;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * score));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 300 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg
          viewBox="0 0 100 100"
          style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}
        >
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {displayed}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>%</span>
        </div>
      </div>
      <span style={{
        fontSize: 12, color: "rgba(255,255,255,0.5)",
        textAlign: "center", lineHeight: 1.3, maxWidth: 90,
      }}>
        {label}
      </span>
    </div>
  );
}

export default function ResultsPage({ profile, onReset }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = CARD_THEMES[profile.cardColor] || CARD_THEMES.indigo;
  const scores = profile.archetypeScores || {};

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleShare = () => {
    const topArchetype = ARCHETYPE_CONFIG
      .filter((a) => scores[a.key] !== undefined)
      .sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0))[0];

    const text = `My TikTok repost profile: "${profile.archetypeName}" — ${profile.archetypeTagline}${topArchetype ? ` (${topArchetype.label}: ${scores[topArchetype.key]}%)` : ""}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
      overflowX: "hidden",
    }}>
      {/* Ambient glow from card color */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${theme.accentSoft.replace("0.08", "0.06")}, transparent)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* Back button */}
        <button
          onClick={onReset}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", color: "rgba(255,255,255,0.3)",
            fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            padding: 0, marginBottom: 52, transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.65)"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}
        >
          ← Start over
        </button>

        {/* Archetype header */}
        <div style={{
          textAlign: "center", marginBottom: 64,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: theme.accentSoft, border: `1px solid ${theme.border}`,
            borderRadius: 100, padding: "6px 16px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.accent }}>
              Your Repost Profile
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 700,
            color: "#fff", lineHeight: 1.15, marginBottom: 16,
          }}>
            {profile.archetypeName}
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "rgba(255,255,255,0.5)", fontStyle: "italic",
            lineHeight: 1.6, maxWidth: 500, margin: "0 auto",
          }}>
            {profile.archetypeTagline}
          </p>
        </div>

        {/* Archetype score meters */}
        <section style={{
          marginBottom: 64,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24, padding: "40px 32px",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
              textAlign: "center", marginBottom: 36,
            }}>
              Archetype scores
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 16,
            }}>
              {ARCHETYPE_CONFIG.map((a, i) => (
                <CircularMeter
                  key={a.key}
                  score={scores[a.key] ?? 0}
                  color={a.color}
                  glow={a.glow}
                  label={a.label}
                  delay={i * 120}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Interest clusters */}
        <section style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
            marginBottom: 20,
          }}>
            Interest clusters
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {profile.clusters.map((cluster, i) => (
              <div
                key={i}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-16px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.08}s`,
                  background: theme.accentSoft,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16, padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{cluster.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.accent }}>
                    {cluster.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  {cluster.insight}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hidden trait */}
        <section style={{
          marginBottom: 32,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${theme.accentSoft}, rgba(255,255,255,0.02))`,
            border: `1px solid ${theme.accent}44`,
            borderRadius: 20, padding: "24px",
          }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>🔮</span>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: theme.accent, marginBottom: 10,
                }}>
                  What your reposts reveal
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.8)" }}>
                  {profile.hiddenTrait}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compatible archetype + share */}
        <section style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease 0.75s",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "24px 28px",
            marginBottom: 24,
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6,
              }}>
                You'd vibe with
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.accent }}>
                {profile.compatibleArchetype}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontWeight: 600, letterSpacing: "0.06em" }}>
              repost.profile
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onReset}
              style={{
                flex: 1, padding: "16px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, color: "rgba(255,255,255,0.45)",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.22)"; e.target.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.45)"; }}
            >
              ← Try again
            </button>
            <button
              onClick={handleShare}
              style={{
                flex: 2, padding: "16px",
                background: copied ? "rgba(52,211,153,0.12)" : theme.accentSoft,
                border: `1px solid ${copied ? "rgba(52,211,153,0.25)" : theme.border}`,
                borderRadius: 14,
                color: copied ? "#34d399" : theme.accent,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Copied to clipboard" : "Share my profile ↗"}
            </button>
          </div>
        </section>
      </div>

    </div>
  );
}
