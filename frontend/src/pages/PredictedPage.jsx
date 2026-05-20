import { useState } from "react";

export default function PredictedPage({ archetype, email, onUpload }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `I'm probably a ${archetype.name} according to my TikTok reposts 👀 find yours at repostd.com — waiting to see if my prediction is right`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      padding: "80px 24px 80px",
      overflowX: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(167,139,250,0.06), transparent)",
      }} />

      <div style={{ maxWidth: 540, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          marginBottom: 14, textAlign: "center",
          animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          Based on how you think about content
        </p>

        {/* Predicted badge */}
        <div style={{
          display: "flex", justifyContent: "center", marginBottom: 22,
          animation: "fadeUp 0.5s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.22)",
            borderRadius: 100, padding: "5px 14px",
          }}>
            <span style={{ fontSize: 13 }}>🔮</span>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#fbbf24",
            }}>
              Predicted archetype
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 24, padding: "28px 26px",
          marginBottom: 24,
          boxShadow: "0 0 60px rgba(167,139,250,0.09), 0 0 120px rgba(167,139,250,0.04)",
          animation: "scaleIn 0.6s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.55rem, 4vw, 2.1rem)",
            fontWeight: 700, color: "#fff",
            marginBottom: 10, lineHeight: 1.2,
          }}>
            {archetype.name}
          </h2>
          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.48)",
            fontStyle: "italic", lineHeight: 1.6, marginBottom: 22,
          }}>
            {archetype.tagline}
          </p>

          {/* Clusters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
            {archetype.clusters.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(167,139,250,0.055)",
                  border: "1px solid rgba(167,139,250,0.13)",
                  borderRadius: 12, padding: "13px 15px",
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
                }}>
                  <span style={{ fontSize: 15 }}>{c.emoji}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: "#a78bfa",
                  }}>
                    {c.label}
                  </span>
                </div>
                <p style={{
                  margin: 0, fontSize: 13,
                  color: "rgba(255,255,255,0.48)", lineHeight: 1.5,
                }}>
                  {c.insight}
                </p>
              </div>
            ))}
          </div>

          {/* Locked hidden signal */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "16px 18px",
            display: "flex", alignItems: "flex-start", gap: 13,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, marginTop: 1,
            }}>
              🔒
            </div>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
                marginBottom: 5,
              }}>
                Hidden signal
              </div>
              <p style={{
                margin: 0, fontSize: 13,
                color: "rgba(255,255,255,0.28)", lineHeight: 1.5,
              }}>
                Unlocks when your real TikTok data arrives
              </p>
            </div>
          </div>
        </div>

        {/* Unlock instructions */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "22px 22px",
          marginBottom: 18,
          animation: "fadeUp 0.5s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
            marginBottom: 18,
          }}>
            To unlock your real result
          </p>
          {[
            "Go to TikTok → Settings → Privacy → Download your data",
            "Select JSON format, request the file, wait for TikTok to email you (1–3 days)",
            "Come back here and upload — we'll email you the moment we start processing",
          ].map((stepText, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 13, alignItems: "flex-start",
                marginBottom: i < 2 ? 15 : 0,
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#a78bfa",
              }}>
                {i + 1}
              </div>
              <p style={{
                margin: 0, fontSize: 14,
                color: "rgba(255,255,255,0.48)", lineHeight: 1.55,
              }}>
                {stepText}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          animation: "fadeUp 0.5s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          {/* Primary CTA */}
          <button
            onClick={onUpload}
            style={{
              width: "100%", padding: "17px",
              background: "#fff", color: "#000",
              border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.01em",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 40px rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,255,255,0.13)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.06)";
            }}
          >
            I've already requested my data → Upload it now
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            style={{
              width: "100%", padding: "15px",
              background: copied
                ? "rgba(52,211,153,0.07)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                copied ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.1)"
              }`,
              borderRadius: 14,
              color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }
            }}
          >
            {copied ? "✓ Copied to clipboard!" : "Share my predicted archetype"}
          </button>

          {/* TikTok link */}
          <a
            href="https://www.tiktok.com/setting/download-your-data"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onUpload}
            style={{
              display: "block", textAlign: "center",
              padding: "13px",
              color: "rgba(255,255,255,0.28)", fontSize: 13,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.28)")
            }
          >
            Haven't requested it yet? Do it now →
          </a>
        </div>
      </div>
    </div>
  );
}
