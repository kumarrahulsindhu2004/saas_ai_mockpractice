"use client";

import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { startSpeechToText } from "@/lib/speech";
import DidAvatar from "./DidAvatar";

// FIXED INTERFACE
interface Q {
  question: string;
  answer?: string;
  commentary?: string;
  questionNumber: number; // added
}

const speak = (text: string, onEnd: () => void) => {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;
  utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
};

export default function StartInterview() {
  const { interviewId } = useParams();
  const convex = useConvex();

  const [questions, setQuestions] = useState<Q[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastQuestion = currentIndex === questions.length - 1;


  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);

  const [aiSpeaking, setAiSpeaking] = useState(true);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

const loadQuestions = async () => {
  const data = await convex.query(api.Interview.GetInterviewQuestions, {
    interviewRecordsId: interviewId as Id<"InterviewSessionTable">,
  });

  if (!data) {
    console.error("Interview not found!");
    return;
  }

  if (!data.interviewQuestions) {
    console.error("No questions found!");
    return;
  }

  console.log("Loaded questions =", data.interviewQuestions);

  const normalized = data.interviewQuestions.map((q: any, index: number) => ({
    ...q,
    questionNumber: index + 1,
  }));

  setQuestions(normalized);

  speak(normalized[0].question, () => {
    setAiSpeaking(false);
  });
};


  const startVoiceAnswer = async () => {
    if (answered || aiSpeaking) return;

    try {
      setRecording(true);
      const text = await startSpeechToText();
      setRecording(false);

      setAnswer(text);
      setAnswered(true);
    } catch (err) {
      console.log("Speech error:", err);
      setRecording(false);
    }
  };

  const nextQuestion = async () => {
    if (!answered) return;

    // SAFE NOW: questionNumber ALWAYS EXISTS
    console.log("Saving answer →", {
      questionNumber: questions[currentIndex].questionNumber,
      answer,
    });

    await convex.mutation(api.Interview.SaveUserAnswer, {
      interviewId: interviewId as Id<"InterviewSessionTable">,
      questionNumber: questions[currentIndex].questionNumber,
      answer: answer,
    });

    const next = currentIndex + 1;

    if (next >= questions.length) {
      alert("Interview complete!");
      return;
    }

    setCurrentIndex(next);
    setAnswer("");
    setAnswered(false);
    setAiSpeaking(true);

    speak(questions[next].question, () => {
      setAiSpeaking(false);
    });
  };

  if (!questions.length) return <p>Loading...</p>;

  const submitInterview = async () => {
  try {
    await fetch("/api/workflows/interview-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         interviewId,
      }),
    });

    alert("Interview submitted! AI is generating feedback...");
    window.location.href = "/dashboard";
  } catch (e) {
    console.error(e);
    alert("Error submitting interview.");
  }
};


  return (
    <div className="min-h-screen pt-20 pb-10 bg-white flex flex-col items-center">
      <h1 className="text-xl font-bold mb-6">Interview Start</h1>

      <div className="flex w-full max-w-5xl justify-between items-start">
        <div className="rounded-2xl shadow-lg bg-white border border-gray-200 p-6 w-80">
          <DidAvatar
            text={questions[currentIndex].question}
            onDone={() => setAiSpeaking(false)}
          />
        </div>

        <div className="rounded-2xl shadow-lg bg-white border border-gray-200 p-6 w-80">
          <div className="w-72 h-72 flex flex-col items-center justify-center bg-[#0d0d0d] border border-[#252525] rounded-2xl text-white shadow-lg p-4">

            {!answered && !recording && (
              <p className="text-gray-500">Waiting for your answer...</p>
            )}

            {recording && (
              <div className="flex flex-col items-center">
                <p className="text-gray-300 mb-3">You are speaking...</p>
                <div className="flex gap-1">
                  <div className="w-2 h-5 bg-blue-400 animate-bounce"></div>
                  <div className="w-2 h-8 bg-purple-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-4 bg-cyan-400 animate-bounce delay-200"></div>
                  <div className="w-2 h-7 bg-pink-400 animate-bounce delay-300"></div>
                </div>
              </div>
            )}

            {answered && !recording && (
              <textarea
                value={answer}
                readOnly
                className="
                  w-full 
                  h-full 
                  resize-none 
                  bg-transparent 
                  text-gray-200 
                  border border-[#333] 
                  rounded-lg 
                  p-3 
                  outline-none 
                  overflow-y-auto
                "
              />
            )}
          </div>
        </div>
      </div>

<div className="flex gap-5 mt-10 justify-center">

  {/* 🎤 Speak Answer — ALWAYS SHOW */}
  <button
    onClick={startVoiceAnswer}
    disabled={aiSpeaking || answered}
    className={`px-6 py-3 rounded-xl text-lg font-medium transition
      ${aiSpeaking || answered
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-green-600 text-white shadow-md hover:bg-green-700"
      }`}
  >
    🎤 Speak Answer
  </button>

  {/* ▶ NEXT button — only if NOT last question */}
  {!isLastQuestion && (
    <button
      onClick={nextQuestion}
      disabled={!answered}
      className={`px-6 py-3 rounded-xl text-lg font-medium transition
        ${!answered
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
        }`}
    >
      Next →
    </button>
  )}

  {/* ✅ SUBMIT — only on LAST question */}
  {isLastQuestion && (
    <button
      onClick={submitInterview}
      disabled={!answered}
      className={`px-8 py-3 rounded-xl text-lg font-semibold transition
        ${!answered
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-purple-700 text-white shadow-lg hover:bg-purple-800"
        }`}
    >
      ✅ Submit Interview
    </button>
  )}

  {/* ❌ END CALL — always visible */}
  <button
    onClick={() => window.location.href = "/dashboard"}
    className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2"
  >
    ⛔ End Call
  </button>

</div>


    </div>
  );
}
