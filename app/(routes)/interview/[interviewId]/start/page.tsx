// "use client";

// import { api } from "@/convex/_generated/api";
// import { useConvex } from "convex/react";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Id } from "@/convex/_generated/dataModel";
// import { recordAudio } from "@/lib/recordAudio";
// import DidAvatar from "./DidAvatar";

// /* ================= TYPES ================= */
// interface Q {
//   question: string;
//   questionNumber: number;
// }

// /* ================= COMPONENT ================= */
// export default function StartInterview() {
//   const { interviewId } = useParams();
//   const convex = useConvex();

//   const [questions, setQuestions] = useState<Q[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const [answer, setAnswer] = useState("");
//   const [recording, setRecording] = useState(false);
//   const [answered, setAnswered] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);

//   const isLastQuestion = currentIndex === questions.length - 1;

//   /* ================= LOAD QUESTIONS ================= */
//   useEffect(() => {
//     const load = async () => {
//       const data = await convex.query(
//         api.Interview.GetInterviewQuestions,
//         { interviewRecordsId: interviewId as Id<"InterviewSessionTable"> }
//       );

//       if (!data?.interviewQuestions?.length) return;

//       setQuestions(
//         data.interviewQuestions.map((q: any, i: number) => ({
//           question: q.question,
//           questionNumber: i + 1,
//         }))
//       );
//     };

//     load();
//   }, [interviewId, convex]);

//   /* ================= SPEAK QUESTION (DEEPGRAM TTS) ================= */
//   // useEffect(() => {
//   //   if (!questions.length) return;

//   //   const speak = async () => {
//   //     setAiSpeaking(true);

//   //     const res = await fetch("/api/interview/tts", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({
//   //         text: questions[currentIndex].question,
//   //       }),
//   //     });

//   //     const blob = await res.blob();
//   //     const url = URL.createObjectURL(blob);

//   //     const audio = new Audio(url);
//   //     audio.onended = () => {
//   //       URL.revokeObjectURL(url);
//   //       setAiSpeaking(false);
//   //     };
//   //     audio.play();
//   //   };

//   //   speak();
//   // }, [questions, currentIndex]);


//   useEffect(() => {
//   if (!questions.length) return;

//   const speakAndListen = async () => {
//     setAiSpeaking(true);

//     const res = await fetch("/api/interview/tts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         text: questions[currentIndex].question,
//       }),
//     });

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);

//     const audio = new Audio(url);
//     audio.onended = async () => {
//       URL.revokeObjectURL(url);
//       setAiSpeaking(false);

//       // ✅ Auto start listening
//       await startListening();
//     };

//     await audio.play();
//   };

//   speakAndListen();
// }, [questions, currentIndex]);


//   /* ================= RECORD & TRANSCRIBE (DEEPGRAM STT) ================= */
//   // const startVoiceAnswer = async () => {
//   //   if (answered || aiSpeaking || recording) return;

//   //   try {
//   //     setRecording(true);

//   //     const audioBlob = await recordAudio();
//   //     const formData = new FormData();
//   //     formData.append("audio", audioBlob);

//   //     const res = await fetch("/api/interview/stt", {
//   //       method: "POST",
//   //       body: formData,
//   //     });

//   //     if (!res.ok) throw new Error("STT failed");

//   //     const { text } = await res.json();
//   //     setAnswer(text);
//   //     setAnswered(true);
//   //   } catch (err) {
//   //     console.error("STT error:", err);
//   //     alert("No speech detected. Speak clearly.");
//   //   } finally {
//   //     setRecording(false);
//   //   }
//   // };

  
//   const startListening = async () => {
//   try {
//     setRecording(true);

//     const audioBlob = await recordAudio();

//     const formData = new FormData();
//     formData.append("audio", audioBlob);

//     const res = await fetch("/api/interview/stt", {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) throw new Error("STT failed");

//     const { text } = await res.json();
//     setAnswer(text);

//     // ✅ Save answer
//     await convex.mutation(api.Interview.SaveUserAnswer, {
//       interviewId: interviewId as Id<"InterviewSessionTable">,
//       questionNumber: questions[currentIndex].questionNumber,
//       answer: text,
//     });

//     // ✅ Move to next automatically
//     if (isLastQuestion) {
//       await fetch("/api/interview/feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ interviewId }),
//       });

//       window.location.href = "/dashboard";
//     } else {
//       setCurrentIndex(i => i + 1);
//       setAnswer("");
//     }

//   } catch (err) {
//     console.error("Auto STT error:", err);
//   } finally {
//     setRecording(false);
//   }
// };


//   /* ================= SAVE & NEXT ================= */

//   const nextQuestion = async () => {
//     if (!answered) return;

//     await convex.mutation(api.Interview.SaveUserAnswer, {
//       interviewId: interviewId as Id<"InterviewSessionTable">,
//       questionNumber: questions[currentIndex].questionNumber,
//       answer,
//     });

//    if (isLastQuestion) {
//   // ✅ trigger feedback generation
//   await fetch("/api/interview/feedback", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       interviewId,
//     }),
//   });

//   // ✅ redirect to dashboard
//   window.location.href = "/dashboard";
//   return;
// }


//     setCurrentIndex((i) => i + 1);
//     setAnswer("");
//     setAnswered(false);
//   };

//   if (!questions.length) return <p>Loading interview…</p>;

//   /* ================= UI ================= */
//   return (
// //     <div className="min-h-screen pt-20 pb-10 flex flex-col items-center">
// //       <h1 className="text-xl font-bold mb-6">
// //         Question {currentIndex + 1}
// //       </h1>

// //       <div className="flex gap-10">
// //         <DidAvatar
// //           text={questions[currentIndex].question}
// //           speaking={aiSpeaking}
// //         />

// //         <div className="w-72 h-72 bg-black text-white rounded-xl p-4">
// //           {!answered && !recording && <p>Waiting for answer…</p>}
// //           {recording && <p>🎤 Recording…</p>}
// //           {answered && (
// //             <textarea
// //               value={answer}
// //               readOnly
// //               className="w-full h-full bg-black text-white border p-2"
// //             />
// //           )}
// //         </div>
// //       </div>

// //       <div className="flex gap-5 mt-10">
// //         {/* <button
// //           onClick={startVoiceAnswer}
// //           disabled={aiSpeaking || answered}
// //           className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50"
// //         >
// //           🎤 Speak Answer
// //         </button> */}

// //         <div className="w-72 h-72 bg-black text-white rounded-xl p-4">
// //   {aiSpeaking && <p>🤖 Asking question…</p>}
// //   {recording && <p>🎤 Listening…</p>}
// //   {!recording && !aiSpeaking && <p>Processing…</p>}
// //   {answer && (
// //     <textarea
// //       value={answer}
// //       readOnly
// //       className="w-full h-full bg-black text-white border p-2"
// //     />
// //   )}
// // </div>


// //         {/* <button
// //           onClick={nextQuestion}
// //           disabled={!answered}
// //           className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
// //         >
// //           {isLastQuestion ? "Finish" : "Next →"}
// //         </button> */}
// //       </div>
// //     </div>

// <div className="min-h-screen bg-[#0b0b0e] text-gray-100">
//     <div className="max-w-6xl mx-auto px-6 py-6">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-lg font-semibold">AI Mock Interview</h1>
//         <span className="text-sm text-gray-400">
//           Question {currentIndex + 1} / {questions.length}
//         </span>
//       </div>

//       {/* Main Panel */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//         {/* AI Interviewer */}
//         <div className="bg-[#13131a] border border-[#262626] rounded-2xl p-6">
//           <DidAvatar
//             text={questions[currentIndex].question}
//             speaking={aiSpeaking}
//           />

//           <p className="mt-4 text-sm text-gray-300 leading-relaxed">
//             {questions[currentIndex].question}
//           </p>
//         </div>

//         {/* Candidate Response */}
//         <div className="bg-[#13131a] border border-[#262626] rounded-2xl p-6 flex flex-col justify-center">

//           {aiSpeaking && (
//             <p className="text-indigo-400 text-sm animate-pulse">
//               🤖 Interviewer is speaking…
//             </p>
//           )}

//           {recording && (
//             <p className="text-green-400 text-sm animate-pulse">
//               🎤 Listening… please answer now
//             </p>
//           )}

//           {!aiSpeaking && !recording && (
//             <p className="text-gray-500 text-sm">
//               Processing your response…
//             </p>
//           )}

//           {answer && (
//             <div className="mt-4 bg-black/40 border border-[#262626] rounded-lg p-4 text-sm text-gray-200">
//               {answer}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>

//     {/* Bottom Status Bar */}
//     <div className="fixed bottom-0 left-0 w-full bg-black border-t border-[#262626]">
//       <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-gray-400">
//         {aiSpeaking && "AI is asking a question"}
//         {recording && "Recording your answer… Speak naturally"}
//         {!aiSpeaking && !recording && "Preparing next question"}
//       </div>
//     </div>
//   </div>
//   );
// }

















// "use client";

// import { api } from "@/convex/_generated/api";
// import { useConvex } from "convex/react";
// import { useEffect, useRef, useState } from "react";
// import { useParams } from "next/navigation";
// import { Id } from "@/convex/_generated/dataModel";
// import { recordAudio } from "@/lib/recordAudio";
// import DidAvatar from "./DidAvatar";

// interface Q {
//   question: string;
//   questionNumber: number;
// }

// export default function StartInterview() {
//   const { interviewId } = useParams();
//   const convex = useConvex();

//   const [questions, setQuestions] = useState<Q[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answer, setAnswer] = useState("");
//   const [recording, setRecording] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);

//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const isLastQuestion = currentIndex === questions.length - 1;

//   /* ================= LOAD QUESTIONS ================= */
//   useEffect(() => {
//     const load = async () => {
//       const data = await convex.query(
//         api.Interview.GetInterviewQuestions,
//         { interviewRecordsId: interviewId as Id<"InterviewSessionTable"> }
//       );

//       if (!data?.interviewQuestions?.length) return;

//       setQuestions(
//         data.interviewQuestions.map((q: any, i: number) => ({
//           question: q.question,
//           questionNumber: i + 1,
//         }))
//       );
//     };

//     load();
//   }, [interviewId, convex]);

//   /* ================= AI SPEAK → LISTEN ================= */

// useEffect(() => {
//   if (!questions.length) return;

//   const speakAndListen = async () => {
//     setAiSpeaking(true);

//     const res = await fetch("/api/interview/tts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         text: questions[currentIndex].question,
//       }),
//     });

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);

//     const audio = new Audio(url);
//     audio.onended = async () => {
//       URL.revokeObjectURL(url);
//       setAiSpeaking(false);

//       // ✅ Auto start listening
//       await startListening();
//     };

//     await audio.play();
//   };

//   speakAndListen();
// }, [questions, currentIndex]);

//   /* ================= RECORD + STT ================= */
// const startListening = async () => {
//   try {
//     setRecording(true);

//     const audioBlob = await recordAudio();

//     const formData = new FormData();
//     formData.append("audio", audioBlob);

//     const res = await fetch("/api/interview/stt", {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) throw new Error("STT failed");

//     const { text } = await res.json();
//     setAnswer(text);

//     // ✅ Save answer
//     await convex.mutation(api.Interview.SaveUserAnswer, {
//       interviewId: interviewId as Id<"InterviewSessionTable">,
//       questionNumber: questions[currentIndex].questionNumber,
//       answer: text,
//     });

// if (isLastQuestion) {
//   // ✅ just finish interview, NO feedback generation here
//   window.location.href = "/dashboard";
// } else {
//   setCurrentIndex((i) => i + 1);
//   setAnswer("");
// }


//   } catch (err) {
//     console.error("Auto STT error:", err);
//   } finally {
//     setRecording(false);
//   }
// };


//   if (!questions.length) return <p>Loading interview…</p>;

//   /* ================= UI ================= */
//   return (
//     <div className="min-h-screen bg-[#0b0b0e] text-gray-100">
//     <div className="max-w-6xl mx-auto px-6 py-6">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-lg font-semibold">AI Mock Interview</h1>
//         <span className="text-sm text-gray-400">
//           Question {currentIndex + 1} / {questions.length}
//         </span>
//       </div>

//       {/* Main Panel */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//         {/* AI Interviewer */}
//         <div className="bg-[#13131a] border border-[#262626] rounded-2xl p-6">
//           <DidAvatar
//             text={questions[currentIndex].question}
//             speaking={aiSpeaking}
//           />

//           <p className="mt-4 text-sm text-gray-300 leading-relaxed">
//             {questions[currentIndex].question}
//           </p>
//         </div>

//         {/* Candidate Response */}
//         <div className="bg-[#13131a] border border-[#262626] rounded-2xl p-6 flex flex-col justify-center">

//           {aiSpeaking && (
//             <p className="text-indigo-400 text-sm animate-pulse">
//               🤖 Interviewer is speaking…
//             </p>
//           )}

//           {recording && (
//             <p className="text-green-400 text-sm animate-pulse">
//               🎤 Listening… please answer now
//             </p>
//           )}

//           {!aiSpeaking && !recording && (
//             <p className="text-gray-500 text-sm">
//               Processing your response…
//             </p>
//           )}

//           {answer && (
//             <div className="mt-4 bg-black/40 border border-[#262626] rounded-lg p-4 text-sm text-gray-200">
//               {answer}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>

//     {/* Bottom Status Bar */}
//     <div className="fixed bottom-0 left-0 w-full bg-black border-t border-[#262626]">
//       <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-gray-400">
//         {aiSpeaking && "AI is asking a question"}
//         {recording && "Recording your answer… Speak naturally"}
//         {!aiSpeaking && !recording && "Preparing next question"}
//       </div>
//     </div>
//   </div>
//   );
// }










"use client";

import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { recordAudio } from "@/lib/recordAudio";
import DidAvatar from "./DidAvatar";
// import { startInterviewLock, stopInterviewLock } from "@/lib/interviewLock";
// import { useProctorGuard } from "@/lib/useProctorGuard";


interface Q {
  question: string;
  questionNumber: number;
}

export default function StartInterview() {
  const { interviewId } = useParams();
  const convex = useConvex();

  const [questions, setQuestions] = useState<Q[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);



  //adding wives
  const [waving, setWaving] = useState(false);
const [avatarText, setAvatarText] = useState("");

  const isLastQuestion = currentIndex === questions.length - 1;

  // useProctorGuard(true); // ✅ activate proctoring


  /* ✅ LOCK SCREEN ON ENTER */
  // useEffect(() => {
  //   startInterviewLock();
  //   return () => stopInterviewLock();
  // }, []);
// greeeting add 
  useEffect(() => {
  setWaving(true);
  setAvatarText("Hi! Welcome to your interview 👋");

  setTimeout(() => {
    setWaving(false);
  }, 2500);
}, []);

  /* ✅ LOAD QUESTIONS */
  useEffect(() => {
    const load = async () => {
      const data = await convex.query(
        api.Interview.GetInterviewQuestions,
        { interviewRecordsId: interviewId as Id<"InterviewSessionTable"> }
      );

      if (!data?.interviewQuestions?.length) return;

      setQuestions(
        data.interviewQuestions.map((q: any, i: number) => ({
          question: q.question,
          questionNumber: i + 1,
        }))
      );
    };
    load();
  }, [interviewId, convex]);

  /* ✅ AI SPEAK → LISTEN */
  useEffect(() => {
    if (!questions.length) return;

    const ask = async () => {
      setAiSpeaking(true);

      const res = await fetch("/api/interview/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questions[currentIndex].question }),
      });

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = async () => {
        URL.revokeObjectURL(audioUrl);
        setAiSpeaking(false);
        await startListening();
      };

      await audio.play();
    };

    ask();
  }, [questions, currentIndex]);

  /* ✅ RECORD + STT */
  const startListening = async () => {
    try {
      setRecording(true);

      const audioBlob = await recordAudio();
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const res = await fetch("/api/interview/stt", {
        method: "POST",
        body: formData,
      });

      const { text } = await res.json();
      setAnswer(text);

      // ✅ Save answer
      const safeAnswer = text?.trim() || "No answer detected";

await convex.mutation(api.Interview.SaveUserAnswer, {
  interviewId: interviewId as Id<"InterviewSessionTable">,
  questionNumber: questions[currentIndex].questionNumber,
  answer: safeAnswer,
});

      // await convex.mutation(api.Interview.SaveUserAnswer, {
      //   interviewId: interviewId as Id<"InterviewSessionTable">,
      //   questionNumber: questions[currentIndex].questionNumber,
      //   answer: text,
      // });

      // if (isLastQuestion) {
      //   // stopInterviewLock();
      //   window.location.href = "/dashboard";
      // } else {
      //   setCurrentIndex((i) => i + 1);
      //   setAnswer("");
      // }

     if (isLastQuestion) {
  setWaving(true);
  setAvatarText("Thank you! Your interview is complete 👋");

  setTimeout(() => {
    window.location.href = "/dashboard";
  }, 2500);

} else {
  setAvatarText("");          // remove greeting text
  setWaving(false);           // stop waving
  setCurrentIndex((i) => i + 1);  // ⬅️ MOVE TO NEXT QUESTION
  setAnswer("");  
}

    } catch (err) {
      console.error(err);
    } finally {
      setRecording(false);
    }
  };

  if (!questions.length) return <p>Loading interview…</p>;

  /* ✅ UI */
  return (
    <div className="min-h-screen bg-[#0b0b0e] text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-lg font-semibold">AI Mock Interview</h1>
          <span className="text-sm text-gray-400">
            Question {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#13131a] p-6 rounded-xl">
            <DidAvatar
              text={questions[currentIndex].question}
              speaking={aiSpeaking}
            />

            {/* <DidAvatar
  text={avatarText || questions[currentIndex].question}
  speaking={aiSpeaking}
  waving={waving}
/> */}

            {/* <p className="mt-3 text-gray-300">
              {questions[currentIndex].question}
            </p> */}
          </div>

          <div className="bg-[#13131a] p-6 rounded-xl">
            {aiSpeaking && <p className="text-indigo-400">🤖 AI speaking…</p>}
            {recording && <p className="text-green-400">🎤 Listening…</p>}
            {!recording && !aiSpeaking && (
              <p className="text-gray-500">Processing…</p>
            )}

            {answer && (
              <div className="mt-4 bg-black/50 p-4 rounded-lg">
                {answer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}








// "use client";

// import { api } from "@/convex/_generated/api";
// import { useConvex } from "convex/react";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Id } from "@/convex/_generated/dataModel";
// import DidAvatar from "./DidAvatar";
// import { recordAudio } from "@/lib/recordAudio";

// interface Q {
//   question: string;
//   questionNumber: number;
// }

// export default function StartInterview() {
//   const { interviewId } = useParams();
//   const convex = useConvex();

//   const [userName, setUserName] = useState("");
//   const [questions, setQuestions] = useState<Q[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const [aiSpeaking, setAiSpeaking] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [answer, setAnswer] = useState("");

//   const [stage, setStage] = useState<
//     "greeting" | "userReply" | "startInterview" | "questions"
//   >("greeting");

//   const [avatarText, setAvatarText] = useState("");
//   const [waving, setWaving] = useState(false);

//   const isLastQuestion = currentIndex === questions.length - 1;

//   /* -------------------------------------------------------------
//      1️⃣ FETCH USER NAME FROM DB
//   ------------------------------------------------------------- */
//   useEffect(() => {
//     const loadUser = async () => {
//       const interview = await convex.query(api.Interview.GetInterviewQuestions, {
//         interviewRecordsId: interviewId as Id<"InterviewSessionTable">,
//       });

//       if (interview?.userId) {
//         const user = await convex.query(api.Interview.GetUserById, {
//           uid: interview.userId,
//         });

//         setUserName(user?.name || "there");
//       }
//     };

//     loadUser();
//   }, [interviewId, convex]);

//   /* -------------------------------------------------------------
//      2️⃣ GREETING → “Hi Rahul, how are you?”
//   ------------------------------------------------------------- */
//   useEffect(() => {
//     if (!userName || stage !== "greeting") return;

//     const greet = async () => {
//       const text = `Hi ${userName}, how are you today?`;
//       setAvatarText(text);
//       setWaving(true);
//       setAiSpeaking(true);

//       const res = await fetch("/api/interview/tts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text }),
//       });

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const audio = new Audio(url);

//       audio.onended = () => {
//         setAiSpeaking(false);
//         setWaving(false);
//         setStage("userReply"); // wait for user's response
//         listenToUserGreeting();
//       };

//       audio.play();
//     };

//     greet();
//   }, [userName, stage]);

//   /* -------------------------------------------------------------
//      3️⃣ LISTEN TO USER GREETING RESPONSE
//   ------------------------------------------------------------- */
//   const listenToUserGreeting = async () => {
//     setRecording(true);

//     const audioBlob = await recordAudio();
//     const formData = new FormData();
//     formData.append("audio", audioBlob);

//     const res = await fetch("/api/interview/stt", {
//       method: "POST",
//       body: formData,
//     });

//     const { text } = await res.json();
//     console.log("User greeting:", text);

//     setRecording(false);

//     sayBeginMessage();
//   };

//   /* -------------------------------------------------------------
//      4️⃣ AI SAYS: “Great! Let’s begin.”
//   ------------------------------------------------------------- */
//   const sayBeginMessage = async () => {
//     const msg = "Great! Let's begin your interview.";
//     setAvatarText(msg);
//     setAiSpeaking(true);

//     const res = await fetch("/api/interview/tts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ text: msg }),
//     });

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);
//     const audio = new Audio(url);

//     audio.onended = () => {
//       setAiSpeaking(false);
//       setStage("questions");
//     };

//     audio.play();
//   };

//   /* -------------------------------------------------------------
//      5️⃣ LOAD INTERVIEW QUESTIONS
//   ------------------------------------------------------------- */
//   useEffect(() => {
//     const load = async () => {
//       const data = await convex.query(api.Interview.GetInterviewQuestions, {
//         interviewRecordsId: interviewId as Id<"InterviewSessionTable">,
//       });

//       if (!data?.interviewQuestions?.length) return;

//       setQuestions(
//         data.interviewQuestions.map((q: any, i: number) => ({
//           question: q.question,
//           questionNumber: i + 1,
//         }))
//       );
//     };
//     load();
//   }, [interviewId, convex]);

//   /* -------------------------------------------------------------
//      6️⃣ ASK REAL INTERVIEW QUESTIONS (only after greeting)
//   ------------------------------------------------------------- */
//   useEffect(() => {
//     if (stage !== "questions") return;
//     if (!questions.length) return;

//     const ask = async () => {
//       setAiSpeaking(true);

//       const res = await fetch("/api/interview/tts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: questions[currentIndex].question }),
//       });

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const audio = new Audio(url);

//       audio.onended = () => {
//         setAiSpeaking(false);
//         startListening();
//       };

//       audio.play();
//     };

//     ask();
//   }, [stage, questions, currentIndex]);

//   /* -------------------------------------------------------------
//      7️⃣ LISTEN + SAVE ANSWERS
//   ------------------------------------------------------------- */
//   const startListening = async () => {
//     setRecording(true);

//     const audioBlob = await recordAudio();
//     const formData = new FormData();
//     formData.append("audio", audioBlob);

//     const res = await fetch("/api/interview/stt", {
//       method: "POST",
//       body: formData,
//     });

//     const { text } = await res.json();
//     setAnswer(text);

//     await convex.mutation(api.Interview.SaveUserAnswer, {
//       interviewId: interviewId as Id<"InterviewSessionTable">,
//       questionNumber: questions[currentIndex].questionNumber,
//       answer: text.trim() || "No answer detected",
//     });

//     setRecording(false);

//     if (isLastQuestion) {
//       setWaving(true);
//       setAvatarText("Thank you! Interview completed 👋");

//       setTimeout(() => {
//         window.location.href = "/dashboard";
//       }, 2500);
//     } else {
//       setCurrentIndex((i) => i + 1);
//     }
//   };

//   /* -------------------------------------------------------------
//      UI
//   ------------------------------------------------------------- */
//   return (
//     <div className="min-h-screen bg-[#0b0b0e] text-gray-100">
//       <div className="max-w-6xl mx-auto px-6 py-6">

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="bg-[#13131a] p-6 rounded-xl">
//             <DidAvatar text={avatarText || questions[currentIndex]?.question} speaking={aiSpeaking} waving={waving} />
//           </div>

//           <div className="bg-[#13131a] p-6 rounded-xl">
//             {aiSpeaking && <p>🤖 Speaking…</p>}
//             {recording && <p>🎤 Listening…</p>}

//             {answer && <p className="mt-4">{answer}</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
