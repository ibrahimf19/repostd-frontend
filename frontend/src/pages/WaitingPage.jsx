import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";

const FAKE_HANDLES = [
  "@mari.exe", "@silent_loud", "@niche.rabbit", "@flor.signal",
  "@m4tt.wav", "@dusk.ctrl", "@void.jpg", "@lukewarm.take",
  "@orbit.mp3", "@grey_signal", "@pattern.girl", "@404.feelings",
  "@maybe.core", "@static.brief", "@moth.theory", "@driftwood.mp4",
];

const FAKE_ARCHETYPES = [
  "The Midnight Curator",
  "The Quiet Contrarian",
  "The Niche Oracle",
  "The Accidental Philosopher",
];

const TIME_POOL = [
  "just now", "1m ago", "2m ago", "3m ago", "4m ago",
  "5m ago", "6m ago", "7m ago", "8m ago", "11m ago",
];

let uidCounter = 100;
function uid() { return ++uidCounter; }

function randomFeedItem() {
  return {
    handle: FAKE_HANDLES[Math.floor(Math.random() * FAKE_HANDLES.length)],
    archetype: FAKE_ARCHETYPES[Math.floor(Math.random() * FAKE_ARCHETYPES.length)],
    time: TIME_POOL[Math.floor(Math.random() * TIME_POOL.length)],
    id: uid(),
    isNew: true,
  };
}

// ─── Progress screen shown while backend processes ───────────────────────────
function ProgressLoader({ progress }) {
  const status = progress?.status;
  const pct =
    progress?.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : null;
  const showBar =
    (status === "fetching" || status === "enriching") && pct !== null;

  const headline =
    status === "analyzing"
      ? "Analyzing with Claude..."
      : status === "enriching"
      ? "Enriching video details..."
      : status === "starting"
      ? "Parsing your TikTok data..."
      : "Fetching video details...";

  const subline =
    status === "analyzing"
      ? "Reading between the lines of your repost history..."
      : status === "enriching" && progress.total > 0
      ? `${progress.done} of ${progress.total} — fetching full page metadata`
      : status === "fetching" && progress?.total > 0
      ? `${progress.done} of ${progress.total} videos`
      : "This takes 10–30 seconds for a full dataset";

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32, padding: "24px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.05)",
        borderTopColor: "rgba(167,139,250,0.8)",
        animation: "spin 1s linear infinite",
      }} />
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <p style={{
          fontSize: 17, fontWeight: 600,
          color: "rgba(255,255,255,0.85)", marginBottom: 8,
        }}>
          {headline}
        </p>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.3)",
          marginBottom: 0, lineHeight: 1.5,
        }}>
          {subline}
        </p>
      </div>
      {showBar && (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{
            height: 3, background: "rgba(255,255,255,0.06)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background:
                status === "enriching"
                  ? "linear-gradient(90deg, #fb923c, #f472b6)"
                  : "linear-gradient(90deg, #a78bfa, #00d4ff)",
              borderRadius: 2,
              transition: "width 0.4s ease",
            }} />
          </div>
          <p style={{
            fontSize: 12, color: "rgba(255,255,255,0.2)",
            textAlign: "right", marginTop: 6,
          }}>
            {pct}%
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main WaitingPage ─────────────────────────────────────────────────────────
export default function WaitingPage({ predictedArchetype, email, onResult }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Initial feed items (hardcoded, staggered animation)
  const [feedItems, setFeedItems] = useState([
    { handle: "@mari.exe",    archetype: "The Midnight Curator",       time: "2m ago",  id: 1, isNew: false },
    { handle: "@silent_loud", archetype: "The Quiet Contrarian",       time: "4m ago",  id: 2, isNew: false },
    { handle: "@niche.rabbit",archetype: "The Niche Oracle",           time: "7m ago",  id: 3, isNew: false },
    { handle: "@flor.signal", archetype: "The Aesthetic Architect",    time: "11m ago", id: 4, isNew: false },
  ]);

  // ── Poll job progress ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://repostd-backend-production.up.railway.app/api/progress/${jobId}`);
        if (!res.ok) throw new Error("Lost connection to backend.");
        const data = await res.json();
        setProgress(data);

        if (data.status === "done") {
          clearInterval(interval);
          onResult(data.profile);
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(data.error || "Analysis failed.");
          setLoading(false);
          setJobId(null);
          setProgress(null);
        }
      } catch (err) {
        clearInterval(interval);
        setError(
          err.message + " Make sure the backend is running on port 3001."
        );
        setLoading(false);
        setJobId(null);
        setProgress(null);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, onResult]);

  // ── Live feed rotation every 15s ──────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const item = randomFeedItem();
      setFeedItems((prev) => [item, ...prev.slice(0, 3)]);
      // Mark it as no-longer-new after animation plays
      setTimeout(() => {
        setFeedItems((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, isNew: false } : f))
        );
      }, 600);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Submit raw JSON to backend ─────────────────────────────────────────────
  const analyzeJsonFile = async (rawJson) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://repostd-backend-production.up.railway.app/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawJson }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start analysis.");
      setJobId(data.jobId);
      setProgress({
        status: "starting",
        message: "Parsing your TikTok data...",
        total: 0,
        done: 0,
      });
    } catch (err) {
      setError(
        err.message + " Make sure the backend is running on port 3001."
      );
      setLoading(false);
    }
  };

  // ── Handle file selection / drop ───────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);

    try {
      if (file.name.endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        const allNames = Object.keys(zip.files);

        // Prefer user_data.json / Activity.json, otherwise take first .json
        const preferred = allNames.find(
          (n) =>
            n.match(/user_data\.json$/i) ||
            n.match(/activity\.json$/i)
        );
        const fallback = allNames.find((n) => n.match(/\.json$/i));
        const target = preferred || fallback;

        if (!target) {
          setError(
            "No JSON file found inside the ZIP. Make sure you're uploading your TikTok data export."
          );
          return;
        }

        const jsonContent = await zip.files[target].async("string");
        try {
          JSON.parse(jsonContent);
        } catch {
          setError("The JSON file inside the ZIP appears to be invalid.");
          return;
        }
        await analyzeJsonFile(jsonContent);
      } else if (file.name.endsWith(".json")) {
        const text = await file.text();
        try {
          JSON.parse(text);
        } catch {
          setError("This doesn't look like a valid JSON file.");
          return;
        }
        await analyzeJsonFile(text);
      } else {
        setError(
          "Please upload a ZIP file (or JSON file) from your TikTok data export."
        );
      }
    } catch (err) {
      setError("Couldn't read that file. " + err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Show progress loader while analyzing ──────────────────────────────────
  if (loading) {
    return <ProgressLoader progress={progress} />;
  }

  // ── Main upload UI ─────────────────────────────────────────────────────────
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
        background:
          "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(167,139,250,0.05), transparent)",
      }} />

      <div style={{
        maxWidth: 540, margin: "0 auto", position: "relative", zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, marginBottom: 14,
          animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.07)",
            borderTopColor: "rgba(167,139,250,0.65)",
            animation: "spin 1.6s linear infinite", flexShrink: 0,
          }} />
          <span style={{
            fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: 500,
          }}>
            Reading your repost history
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
          fontWeight: 700, color: "rgba(255,255,255,0.92)",
          lineHeight: 1.2, marginBottom: 10, textAlign: "center",
          animation: "fadeUp 0.5s 0.06s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          Your real archetype is being assembled
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.38)", textAlign: "center",
          marginBottom: 32, lineHeight: 1.6,
          animation: "fadeUp 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          Upload your TikTok data file below. JSON format only.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${
              dragging ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.1)"
            }`,
            borderRadius: 20, padding: "48px 32px",
            textAlign: "center", cursor: "pointer",
            background: dragging
              ? "rgba(167,139,250,0.045)"
              : "rgba(255,255,255,0.02)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: 14,
            animation: "fadeUp 0.5s 0.14s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.json"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          {fileName ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <p style={{
                fontSize: 15, fontWeight: 600,
                color: "rgba(255,255,255,0.8)", marginBottom: 6,
              }}>
                {fileName}
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                Click to choose a different file
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 24,
              }}>
                ↑
              </div>
              <p style={{
                fontSize: 16, fontWeight: 600,
                color: "rgba(255,255,255,0.72)", marginBottom: 8,
              }}>
                Drag your ZIP file here or tap to browse
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                .zip or .json from your TikTok data export
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,77,77,0.08)",
            border: "1px solid rgba(255,77,77,0.2)",
            borderRadius: 12, padding: "14px 18px", marginBottom: 18,
            fontSize: 13, color: "rgba(255,150,150,0.9)", lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email teaser card */}
        {predictedArchetype && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "20px 20px",
            marginBottom: 20,
            animation: "fadeUp 0.5s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
              marginBottom: 14,
            }}>
              You'll get an email like this:
            </p>
            {/* Mock email preview */}
            <div style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "16px 16px",
            }}>
              {/* From line */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #a78bfa, #00d4ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13,
                }}>
                  ◈
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: "rgba(255,255,255,0.75)",
                  }}>
                    Repostd
                  </div>
                  <div style={{
                    fontSize: 11, color: "rgba(255,255,255,0.22)",
                  }}>
                    hello@repostd.com
                  </div>
                </div>
              </div>
              {/* Subject */}
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: "rgba(255,255,255,0.65)", marginBottom: 6,
                lineHeight: 1.4,
              }}>
                🔮 We predicted you were a {predictedArchetype.name}. Your data disagrees.
              </div>
              {/* Preview text */}
              <div style={{
                fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.5,
              }}>
                We thought you were a {predictedArchetype.name}. Your actual data tells a different story…
              </div>
            </div>
          </div>
        )}

        {/* Live feed */}
        <div style={{
          animation: "fadeUp 0.5s 0.26s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "#34d399",
              boxShadow: "0 0 8px #34d399",
              animation: "pulse 2s ease-in-out infinite", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
            }}>
              Recently decoded
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {feedItems.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "11px 15px",
                  animation: item.isNew
                    ? "slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                    : `fadeUp 0.4s ${i * 0.07}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", rowGap: 2 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: "rgba(255,255,255,0.68)",
                  }}>
                    {item.handle}
                  </span>
                  <span style={{
                    fontSize: 13, color: "rgba(255,255,255,0.3)",
                    margin: "0 7px",
                  }}>
                    ·
                  </span>
                  <span style={{
                    fontSize: 13, color: "rgba(255,255,255,0.42)",
                    fontStyle: "italic",
                  }}>
                    {item.archetype}
                  </span>
                </div>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.22)",
                  flexShrink: 0, marginLeft: 10,
                }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
