// import { NextResponse } from "next/server";
// import { fetchQuery, fetchMutation } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// export async function POST(req: Request) {
//   const { interviewId } = await req.json();

//   // ✅ 1. Fetch interview session (questions + answers)
//   const interview = await fetchQuery(
//     api.Interview.GetInterviewSession,
//     { interviewId }
//   );

//   if (!interview?.userAnswers?.length) {
//     return NextResponse.json(
//       { error: "No answers found" },
//       { status: 400 }
//     );
//   }

//   // ✅ 2. Build Q/A text
//   const qaText = interview.userAnswers
//     .map((a: any) => {
//       const q =
//         interview.interviewQuestions?.[a.questionNumber - 1]?.question ??
//         "Question not found";

//       return `Q${a.questionNumber}: ${q}\nA: ${a.answer}`;
//     })
//     .join("\n\n");

//   const prompt = `
// You are an AI interview evaluator.
// Return JSON ONLY:

// {
//   "overallScore": number,
//   "summary": string,
//   "strengths": string[],
//   "weaknesses": string[],
//   "recommendations": string[],
//   "perQuestionFeedback": []
// }

// Interview:
// ${qaText}
// `;

//   // ✅ 3. OpenAI call
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.4,
//   });

//   const feedback = JSON.parse(
//     completion.choices[0].message.content!
//   );

//   // ✅ 4. SAVE feedback correctly
//   await fetchMutation(api.Interview.SaveFeedback, {
//     interviewId,
//     feedback,
//   });

//   return NextResponse.json({ success: true });
// }


import { NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Missing interviewId" },
        { status: 400 }
      );
    }

    // ✅ 1. Fetch interview session
    const interview = await fetchQuery(
      api.Interview.GetInterviewQuestions,
      { interviewRecordsId: interviewId }
    );

    if (!interview || !interview.userAnswers?.length) {
      return NextResponse.json(
        { error: "No answers found for this interview" },
        { status: 400 }
      );
    }

    const questions = interview.interviewQuestions ?? [];
    const answers = interview.userAnswers ?? [];

    // ✅ 2. Build clean Q/A text (LATEST answers only)
    const qaText = answers.map((a: any) => {
      const questionText =
        questions[a.questionNumber - 1]?.question ?? "Question not found";

      return `
Question ${a.questionNumber}:
${questionText}

User Answer:
${a.answer}
`;
    }).join("\n\n");

    // ✅ 3. Strong prompt (forces full output)
    const prompt = `
You are an AI interview evaluator.

IMPORTANT RULES:
- ALWAYS use the provided "User Answer"
- NEVER leave "userAnswer" empty
- Give honest, strict scores
- Score range: 1 to 10
- Return VALID JSON ONLY — no markdown, no explanation

JSON FORMAT:
{
  "overallScore": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "perQuestionFeedback": [
    {
      "questionNumber": number,
      "question": string,
      "userAnswer": string,
      "modelAnswer": string,
      "feedback": string,
      "score": number
    }
  ]
}

INTERVIEW DATA:
${qaText}
`;

    // ✅ 4. OpenAI call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const feedback = JSON.parse(content);

    // ✅ 5. Save feedback in Convex
    await fetchMutation(api.Interview.SaveFeedback, {
      interviewId,
      feedback,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[FEEDBACK API ERROR]", err);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
