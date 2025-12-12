import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { resumeText, jobTitle, jobDescription } = await req.json();

    const prompt = resumeText
  ? `
You are an interview expert.

Resume content:
${resumeText}

Rules:
- Generate 1 DIFFERENT interview questions each time.
- Focus on projects, skills, and technologies from the resume.
- Avoid generic behavioral questions.
- Do NOT repeat common questions like "Tell me about yourself".
- Questions must be moderately difficult.

Return ONLY valid JSON:
{
  "questions": [
    { "question": "", "answer": "" }
  ]
}
`
  : `
You are an interview expert.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Rules:
- Generate 2 unique interview questions.
- Mix theory + practical questions.
- Avoid generic questions.

Return ONLY valid JSON:
{
  "questions": [
    { "question": "", "answer": "" }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a senior technical or non technical interviewer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    return NextResponse.json(
      JSON.parse(completion.choices[0].message.content!)
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "OpenAI failed" },
      { status: 500 }
    );
  }
}
