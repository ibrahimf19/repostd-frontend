import { useState, useEffect } from "react";

const TEASER_ARCHETYPES = [
  "The Quiet Contrarian",
  "The Midnight Curator",
  "The Niche Oracle",
  "The Accidental Philosopher",
  "The Aesthetic Architect",
  "The Reluctant Romantic",
];

export default function LandingPage({ onSubmitEmail }) {
  const [email, setEmail] = useState("");
  const [counter, setCounter] = useState(12847);
  const [submitting, setSubmitting] = useState(false);

  // Live counter: increment by 1–3 every 3–7 seconds
  useEffect(() => {
    let timeout;
    const schedule = () => {
      timeout = setTimeout(() => {
        setCounter((c) => c + Math.floor(Math.random() * 3) + 1);
        schedule();
      }, 3000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("http://repostd-backend-production.up.railway.app/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), predictedArchetype: null }),
      });
    } catch {}
    onSubmitEmail(email.trim());
  };

  // Build the doubled strip for infinite scroll
  const strip = [...TEASER_ARCHETYPES, ...TEASER_ARCHETYPES];

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", color: "#fff",
      fontFamily: "'DM Sans', sans-serif", overflowX: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 600,
          background: "radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "55%", left: "5%",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "35%", right: "5%",
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(244,114,182,0.04) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Nav */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #a78bfa, #00d4ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 14 }}>◈</span>
            </div>
            <span style={{
              fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.9)",
            }}>
              repostd
            </span>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          padding: "80px 24px 56px",
          textAlign: "center",
          maxWidth: 680,
          margin: "0 auto",
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
            fontWeight: 700, lineHeight: 1.1,
            marginBottom: 20, color: "#fff",
            animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}>
            Your reposts reveal more<br />about you than you think
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7, maxWidth: 460,
            margin: "0 auto 40px",
            animation: "fadeUp 0.6s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}>
            We read the pattern in what you share and tell you who you actually are.
          </p>

          {/* Email form */}
          <div style={{
            animation: "fadeUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex", gap: 0,
                maxWidth: 460, margin: "0 auto 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, overflow: "hidden",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, padding: "16px 20px",
                  background: "transparent", border: "none",
                  color: "#fff", fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "16px 22px",
                  background: "rgba(167,139,250,0.15)",
                  border: "none",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                  color: "#a78bfa", fontSize: 14, fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s",
                  opacity: submitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting)
                    e.currentTarget.style.background = "rgba(167,139,250,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(167,139,250,0.15)";
                }}
              >
                Find my archetype →
              </button>
            </form>
            <p style={{
              fontSize: 12, color: "rgba(255,255,255,0.22)",
              margin: 0,
            }}>
              We'll email you when your TikTok data arrives. No spam, ever.
            </p>
          </div>
        </section>

        {/* Scrolling archetype strip */}
        <div style={{
          padding: "0 0 80px",
          overflow: "hidden",
          position: "relative",
          animation: "fadeIn 0.8s 0.3s both",
        }}>
          <div style={{
            display: "flex",
            gap: 16,
            width: "max-content",
            animation: "scrollLeft 32s linear infinite",
          }}>
            {strip.map((name, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: 192,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "20px 18px",
                }}
              >
                {/* Blurred content lines */}
                <div style={{
                  filter: "blur(7px)",
                  userSelect: "none",
                  pointerEvents: "none",
                  marginBottom: 12,
                }}>
                  <div style={{
                    height: 9, width: "75%",
                    background: "rgba(255,255,255,0.14)",
                    borderRadius: 4, marginBottom: 7,
                  }} />
                  <div style={{
                    height: 7, width: "55%",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                  }} />
                </div>
                {/* Visible name */}
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.3,
                }}>
                  {name}
                </div>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 80,
            background: "linear-gradient(90deg, #080808, transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 80,
            background: "linear-gradient(270deg, #080808, transparent)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Footer */}
        <footer style={{
          padding: "20px 32px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.18)" }}>
            repostd
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.14)" }}>
            Your data never leaves your device.
          </span>
        </footer>
      </div>
    </div>
  );
}
