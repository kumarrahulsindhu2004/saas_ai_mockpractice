// import { NextRequest, NextResponse } from "next/server";

// export const runtime = "nodejs";

// export async function POST(req: NextRequest) {
//   const start = performance.now();

//   try {
//     const { text } = await req.json();

//     if (!text) {
//       return NextResponse.json({ error: "No text" }, { status: 400 });
//     }

//     const dgStart = performance.now();

//     const dgRes = await fetch(
//       "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ text }),
//       }
//     );

//     const dgEnd = performance.now();

//     if (!dgRes.ok) {
//       throw new Error(await dgRes.text());
//     }

//     const audioBuffer = Buffer.from(await dgRes.arrayBuffer());
//     const end = performance.now();

//     // ✅ TERMINAL LATENCY LOG
//     console.log(
//       `[TTS] Deepgram API: ${(dgEnd - dgStart).toFixed(0)} ms | Total: ${(end - start).toFixed(0)} ms`
//     );

//     return new NextResponse(audioBuffer, {
//       headers: { "Content-Type": "audio/mpeg" },
//     });

//   } catch (err) {
//     console.error("Deepgram TTS error:", err);
//     return NextResponse.json({ error: "TTS failed" }, { status: 500 });
//   }
// }











import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// export const runtime = "edge";


// Retry wrapper
async function retryFetch(url: string, options: any, retries = 2) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log("⚠️ TTS retrying...");
      return retryFetch(url, options, retries - 1);
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const start = performance.now();

  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

    // Timeout controller (30s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const dgStart = performance.now();

    // ✅ Use FREE, FAST model
    const dgRes = await retryFetch(
      // "https://api.deepgram.com/v1/speak?model=aura-luna-en",
      "https://api.deepgram.com/v1/speak?model=aura-luna-en&encoding=mp3",


      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const dgEnd = performance.now();

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      console.error("❌ Deepgram error:", errText);
      throw new Error(errText);
    }

    // const audioBuffer = Buffer.from(await dgRes.arrayBuffer());
      const audioArrayBuffer = await dgRes.arrayBuffer();
    
    const end = performance.now();

    console.log(
      `[TTS] Model: luna | API: ${(dgEnd - dgStart).toFixed(
        0
      )}ms | Total: ${(end - start).toFixed(0)}ms`
    );

    return new NextResponse(audioArrayBuffer, {
      headers: { "Content-Type": "audio/mpeg","Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("❌ Deepgram TTS failed:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
