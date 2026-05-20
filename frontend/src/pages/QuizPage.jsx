import { useState } from "react";

const QUESTIONS = [
  {
    q: "It's 1am. You open TikTok. What are you actually looking for?",
    options: [
      "Something that makes me feel something I can't name",
      "Proof that someone else thinks the way I do",
      "Content I'll send to exactly one person",
      "I'm not looking for anything. I'm avoiding something",
    ],
  },
  {
    q: "Someone's repost history is 80% dark humor and 20% niche cooking. Your read?",
    options: [
      "Funnier and more interesting than they let on",
      "Lonely but they've made peace with it",
      "Searching for something to care about",
      "That's a very specific niche and I respect it",
    ],
  },
  {
    q: "Which kind of video do you repost most — honestly?",
    options: [
      "Things that confirm what I've been thinking but couldn't say",
      "Stuff that exists in a category I haven't seen named",
      "Genuinely funny — but only a specific kind of funny",
      "Aesthetically weird things most people scroll past",
    ],
  },
  {
    q: "If your TikTok reposts were published as a book, what's the genre?",
    options: [
      "Essays about things nobody asked anyone to write about",
      "A mood board that tells a story you'd never say out loud",
      "Comedy with an uncomfortable amount of truth in it",
      "Field notes from a subculture you're not sure you belong to",
    ],
  },
  {
    q: "What would surprise you most about your own repost history?",
    options: [
      "How much of it is about one topic I'd never admit",
      "How consistent it is — I'm more predictable than I think",
      "How much it's changed this year",
      "That there's a pattern at all. I thought I was random",
    ],
  },
];

const ARCHETYPES = [
  {
    name: "The Quiet Contrarian",
    tagline: "Finds the thing before it has a name, then pretends they didn't.",
    clusters: [
      {
        emoji: "🌀",
        label: "Pattern recognition",
        insight: "Reposts signal things before they can be articulated.",
      },
      {
        emoji: "🌙",
        label: "Late-night mode",
        insight: "Taste shifts dramatically after midnight.",
      },
      {
        emoji: "🎭",
        label: "Selective audience",
        insight: "Most reposts are aimed at exactly one person.",
      },
    ],
    hidden:
      "There's a specific niche you return to obsessively. It tells a different story than the rest.",
  },
  {
    name: "The Accidental Philosopher",
    tagline: "Came for the funny videos. Left with questions about existence.",
    clusters: [
      {
        emoji: "💭",
        label: "Meaning-seeking",
        insight: "Reposts content that reframes everyday things.",
      },
      {
        emoji: "😬",
        label: "Uncomfortable honesty",
        insight: "Drawn to things that say what nobody says.",
      },
      {
        emoji: "🔁",
        label: "Return viewer",
        insight: "Some reposts get revisited weeks later.",
      },
    ],
    hidden:
      "Your repost timing shows you do most of your deep-diving on weekday evenings. That's when you're most yourself.",
  },
  {
    name: "The Niche Oracle",
    tagline: "Deep in three subcultures that haven't intersected yet. They will.",
    clusters: [
      {
        emoji: "🕳️",
        label: "Rabbit hole specialist",
        insight: "Reposts from corners of TikTok most people never find.",
      },
      {
        emoji: "🔮",
        label: "Trend prediction",
        insight: "The algorithm is 3 weeks behind you.",
      },
      {
        emoji: "🤝",
        label: "Community signal",
        insight: "Reposts serve as quiet tribe identification.",
      },
    ],
    hidden:
      "Two of your interest clusters are about to collide. The overlap between them is your real niche.",
  },
  {
    name: "The Midnight Curator",
    tagline: "Builds an imaginary world one repost at a time. Nobody else has the map.",
    clusters: [
      {
        emoji: "🌙",
        label: "Night mode",
        insight: "Repost frequency shifts dramatically after midnight.",
      },
      {
        emoji: "🎨",
        label: "Aesthetic coherence",
        insight: "Everything adds up to something you can't quite name.",
      },
      {
        emoji: "💌",
        label: "Signal sending",
        insight: "Reposts contain messages you won't say directly.",
      },
    ],
    hidden:
      "Your late-night reposts are the most honest version of you on the internet.",
  },
];

function computeArchetype(answers) {
  // Sum indices of answers at positions 0, 2, 4; use modulo 4
  const sum = (answers[0] ?? 0) + (answers[2] ?? 0) + (answers[4] ?? 0);
  return ARCHETYPES[sum % 4];
}

export default function QuizPage({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const handleSelect = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);

    const newAnswers = [...answers, optionIndex];

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
      } else {
        const archetype = computeArchetype(newAnswers);
        onComplete(newAnswers, archetype);
      }
    }, 300);
  };

  const q = QUESTIONS[currentQ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "80px 24px 60px",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.05), transparent)",
      }} />

      <div style={{ width: "100%", maxWidth: 540, position: "relative", zIndex: 1 }}>
        {/* Header label */}
        <p style={{
          fontSize: 13, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          marginBottom: 28, textAlign: "center",
        }}>
          While we wait for your data — a quick read
        </p>

        {/* Progress pips */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "center", marginBottom: 52,
        }}>
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 6,
                width: i < currentQ ? 22 : 6,
                borderRadius: 4,
                background:
                  i < currentQ
                    ? "#a78bfa"
                    : i === currentQ
                    ? "rgba(167,139,250,0.55)"
                    : "rgba(255,255,255,0.1)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ))}
        </div>

        {/* Question + options — keyed by currentQ to trigger re-animation */}
        <div
          key={currentQ}
          style={{ animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.35rem, 3.5vw, 1.85rem)",
            fontWeight: 700, lineHeight: 1.25,
            color: "rgba(255,255,255,0.92)",
            marginBottom: 32, textAlign: "center",
          }}>
            {q.q}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    padding: "18px 22px",
                    background: isSelected
                      ? "rgba(167,139,250,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      isSelected
                        ? "rgba(167,139,250,0.5)"
                        : "rgba(255,255,255,0.08)"
                    }`,
                    borderRadius: 14,
                    color: isSelected
                      ? "#a78bfa"
                      : "rgba(255,255,255,0.65)",
                    fontSize: 15,
                    fontWeight: isSelected ? 600 : 400,
                    textAlign: "left",
                    cursor: selected !== null ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.45,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    animation: `fadeUp 0.45s ${i * 0.065}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  }}
                  onMouseEnter={(e) => {
                    if (selected === null) {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected === null) {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter */}
        <p style={{
          textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)",
          marginTop: 36, letterSpacing: "0.04em",
        }}>
          {currentQ + 1} / {QUESTIONS.length}
        </p>
      </div>
    </div>
  );
}
