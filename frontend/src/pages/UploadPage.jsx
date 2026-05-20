import { useState, useRef, useEffect } from "react";

function parseRepostText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, hashtagPart] = line.split("|").map((s) => s.trim());
      return {
        title: titlePart,
        hashtags: hashtagPart ? hashtagPart.split(",").map((h) => h.trim()) : [],
      };
    });
}

function ProgressLoader({ progress }) {
  const status = progress?.status;
  const pct = progress?.total > 0 ? Math.round((progress.done / progress.total) * 100) : null;
  const showBar = (status === "fetching" || status === "enriching") && pct !== null;

  const headline =
    status === "analyzing" ? "Analyzing with Claude..." :
    status === "enriching" ? "Enriching video details..." :
    status === "starting"  ? "Parsing your TikTok data..." :
                             "Fetching video details...";

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
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 32, padding: "24px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.05)",
        borderTopColor: "rgba(167,139,250,0.8)",
        animation: "spin 1s linear infinite",
      }} />

      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>
          {headline}
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 0, lineHeight: 1.5 }}>
          {subline}
        </p>
      </div>

      {showBar && (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: status === "enriching"
                ? "linear-gradient(90deg, #fb923c, #f472b6)"
                : "linear-gradient(90deg, #a78bfa, #00d4ff)",
              borderRadius: 2,
              transition: "width 0.4s ease",
            }} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "right", marginTop: 6 }}>
            {pct}%
          </p>
        </div>
      )}
    </div>
  );
}

export default function UploadPage({ onResult, onBack }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Poll progress when a jobId is set
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
        setError(err.message + " Make sure the backend is running on port 3001.");
        setLoading(false);
        setJobId(null);
        setProgress(null);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, onResult]);

  // JSON file path — sends raw file content to backend, gets jobId back
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
      setProgress({ status: "starting", message: "Parsing your TikTok data...", total: 0, done: 0 });
    } catch (err) {
      setError(err.message + " Make sure the backend is running on port 3001.");
      setLoading(false);
    }
  };

  // Manual/text path — sends pre-parsed reposts, gets profile directly
  const analyzeReposts = async (reposts) => {
    if (!reposts.length) {
      setError("No valid reposts found. Use the format: Title | hashtag1, hashtag2");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://repostd-backend-production.up.railway.app/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reposts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      onResult(data.profile);
    } catch (err) {
      setError(err.message + " Make sure the backend is running on port 3001.");
      setLoading(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);

    try {
      const text = await file.text();

      if (file.name.endsWith(".json")) {
        // Validate it's parseable before sending
        try { JSON.parse(text); } catch {
          setError("This doesn't look like a valid JSON file.");
          return;
        }
        await analyzeJsonFile(text);
      } else {
        // Plain text format — parse locally and send reposts directly
        const reposts = parseRepostText(text);
        await analyzeReposts(reposts);
      }
    } catch {
      setError("Couldn't read that file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleManualSubmit = () => {
    analyzeReposts(parseRepostText(manualText));
  };

  if (loading) {
    return <ProgressLoader progress={progress} />;
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.05), transparent)",
      }} />

      <div style={{ width: "100%", maxWidth: 560, padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Back */}
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", color: "rgba(255,255,255,0.35)",
            fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            padding: 0, marginBottom: 52, transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.35)"}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 100, padding: "5px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Step 2 — Upload
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700,
            color: "rgba(255,255,255,0.92)", lineHeight: 1.2, marginBottom: 12,
          }}>
            Upload your TikTok data
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Upload the JSON file from your TikTok data export — usually{" "}
            <code style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 5 }}>
              Activity.json
            </code>
            {" "}or{" "}
            <code style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 5 }}>
              user_data.json
            </code>
            . We'll fetch actual video titles before analyzing.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 20, padding: "56px 32px", textAlign: "center", cursor: "pointer",
            background: dragging ? "rgba(167,139,250,0.04)" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s", marginBottom: 16,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          {fileName ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>{fileName}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Click to choose a different file</p>
            </div>
          ) : (
            <div>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 24,
              }}>
                ↑
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>
                Drop your JSON file here
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>or click to browse</p>
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.12)",
          borderRadius: 12, padding: "14px 16px", marginBottom: 24,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🔒</span>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Video titles are fetched from TikTok's public API. Your file is never stored — analysis happens in memory and is discarded immediately.
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)",
            borderRadius: 12, padding: "14px 18px", marginBottom: 20,
            fontSize: 13, color: "rgba(255,150,150,0.9)", lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Manual entry */}
        <button
          onClick={() => setShowManual(!showManual)}
          style={{
            width: "100%", padding: "14px",
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, color: "rgba(255,255,255,0.3)",
            fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.color = "rgba(255,255,255,0.55)"; }}
          onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "rgba(255,255,255,0.3)"; }}
        >
          {showManual ? "Hide manual entry" : "Or enter reposts manually ↓"}
        </button>

        {showManual && (
          <div style={{ marginTop: 16, animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>
              Format: Title | hashtag1, hashtag2 — one per line
            </p>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={10}
              placeholder={"The real reason you can't do a muscle up | calisthenics, fitness\nMarcus Aurelius on modern anxiety | stoicism, philosophy"}
              style={{
                width: "100%", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "16px 18px",
                color: "rgba(255,255,255,0.75)", fontSize: 13.5, lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none",
                marginBottom: 12, transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualText.trim()}
              style={{
                width: "100%", padding: "16px",
                background: manualText.trim() ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${manualText.trim() ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 12,
                color: manualText.trim() ? "#a78bfa" : "rgba(255,255,255,0.2)",
                fontSize: 15, fontWeight: 600,
                cursor: manualText.trim() ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}
            >
              Analyze reposts →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
