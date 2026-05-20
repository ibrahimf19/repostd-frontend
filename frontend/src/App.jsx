import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import QuizPage from "./pages/QuizPage";
import PredictedPage from "./pages/PredictedPage";
import WaitingPage from "./pages/WaitingPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  const [step, setStep] = useState("landing"); // landing | quiz | predicted | waiting | result
  const [email, setEmail] = useState("");
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [predictedArchetype, setPredictedArchetype] = useState(null);
  const [profile, setProfile] = useState(null);

  // On mount: restore from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("repostd_email") || "";
    const savedPredicted = localStorage.getItem("repostd_predicted");
    const quizDone = localStorage.getItem("repostd_quiz_done");

    if (savedEmail) setEmail(savedEmail);
    if (quizDone === "true" && savedPredicted) {
      try {
        const parsed = JSON.parse(savedPredicted);
        setPredictedArchetype(parsed);
        setStep("waiting");
      } catch {}
    }
  }, []);

  const handleEmailSubmit = (emailVal) => {
    setEmail(emailVal);
    localStorage.setItem("repostd_email", emailVal);
    setStep("quiz");
  };

  const handleQuizComplete = (answers, archetype) => {
    setQuizAnswers(answers);
    setPredictedArchetype(archetype);
    localStorage.setItem("repostd_predicted", JSON.stringify(archetype));
    localStorage.setItem("repostd_quiz_done", "true");
    setStep("predicted");
  };

  const handleResult = (profileData) => {
    setProfile(profileData);
    setStep("result");
  };

  const handleReset = () => {
    setProfile(null);
    setStep("landing");
  };

  const goBack = () => {
    if (step === "quiz") setStep("landing");
    else if (step === "predicted") setStep("quiz");
    else if (step === "waiting") {
      if (window.confirm("Going back won't cancel your upload. Are you sure?")) {
        setStep("predicted");
      }
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.82); }
        }
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 3px; }
      `}</style>

      {/* Fixed back button — shown on quiz, predicted, waiting */}
      {(step === "quiz" || step === "predicted" || step === "waiting") && (
        <button
          onClick={goBack}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 200,
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(8,8,8,0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100, padding: "8px 16px",
            color: "rgba(255,255,255,0.45)", fontSize: 13,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(8,8,8,0.85)";
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
          }}
        >
          ← Back
        </button>
      )}

      {step === "landing" && (
        <LandingPage onSubmitEmail={handleEmailSubmit} />
      )}
      {step === "quiz" && (
        <QuizPage onComplete={handleQuizComplete} />
      )}
      {step === "predicted" && predictedArchetype && (
        <PredictedPage
          archetype={predictedArchetype}
          email={email}
          onUpload={() => setStep("waiting")}
        />
      )}
      {step === "waiting" && (
        <WaitingPage
          predictedArchetype={predictedArchetype}
          email={email}
          onResult={handleResult}
        />
      )}
      {step === "result" && profile && (
        <ResultsPage profile={profile} onReset={handleReset} />
      )}
    </>
  );
}
