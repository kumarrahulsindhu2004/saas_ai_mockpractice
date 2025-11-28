import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { interviewId } = await req.json();

    // ⭐ Fetch from Convex directly
    const data = await fetchQuery(api.Interview.GetInterviewQuestions, {
      interviewRecordsId: interviewId,
    });

    if (!data || !data.interviewQuestions?.length) {
      return NextResponse.json(
        { error: "No interview questions found" },
        { status: 404 }
      );
    }

    const firstQuestion = data.interviewQuestions[0];

    // Convert text → audio
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: firstQuestion.question,
    });

    const audioBase64 = Buffer.from(
      await speech.arrayBuffer()
    ).toString("base64");

    return NextResponse.json({
      question: firstQuestion.question,
      questionIndex: 0,
      audio: `data:audio/mp3;base64,${audioBase64}`,
    });

  } catch (error: any) {
    console.error("Start Interview Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
