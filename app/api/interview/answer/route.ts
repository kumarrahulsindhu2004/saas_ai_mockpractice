import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});


export async function POST(req: NextRequest) {
  const { questions, answer, questionIndex } = await req.json();

  const nextIndex = questionIndex + 1;

  if (nextIndex >= questions.length) {
    return NextResponse.json({ done: true });
  }

  const nextQuestion = questions[nextIndex].question;

  const speech = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: nextQuestion,
  });

  return NextResponse.json({
    question: nextQuestion,
    questionIndex: nextIndex,
    audio: `data:audio/mp3;base64,${Buffer.from(await speech.arrayBuffer()).toString("base64")}`
  });
}
