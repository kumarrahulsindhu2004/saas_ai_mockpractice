import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const start = performance.now();

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text" }, { status: 400 });
    }

    const dgStart = performance.now();

    const dgRes = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    const dgEnd = performance.now();

    if (!dgRes.ok) {
      throw new Error(await dgRes.text());
    }

    const audioBuffer = Buffer.from(await dgRes.arrayBuffer());
    const end = performance.now();

    // ✅ TERMINAL LATENCY LOG
    console.log(
      `[TTS] Deepgram API: ${(dgEnd - dgStart).toFixed(0)} ms | Total: ${(end - start).toFixed(0)} ms`
    );

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (err) {
    console.error("Deepgram TTS error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}




// import { NextRequest, NextResponse } from "next/server";

// export const runtime = "nodejs";

// function fetchWithTimeout(url: string, options: any, timeout = 15000) {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(() => reject(new Error("TTS request timeout")), timeout);

//     fetch(url, options)
//       .then((res) => {
//         clearTimeout(timer);
//         resolve(res);
//       })
//       .catch((err) => {
//         clearTimeout(timer);
//         reject(err);
//       });
//   });
// }

// export async function POST(req: NextRequest) {
//   const start = performance.now();

//   try {
//     const { text } = await req.json();
//     if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

//     const dgStart = performance.now();

//     const dgRes: any = await fetchWithTimeout(
//       "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ text }),
//       },
//       15000 // 15 second timeout
//     );

//     const dgEnd = performance.now();

//     if (!dgRes.ok) {
//       throw new Error(await dgRes.text());
//     }

//     const audioBuffer = Buffer.from(await dgRes.arrayBuffer());
//     const end = performance.now();

//     console.log(
//       `[TTS] Deepgram API: ${(dgEnd - dgStart).toFixed(0)} ms | Total: ${(end - start).toFixed(0)} ms`
//     );

//     return new NextResponse(audioBuffer, {
//       headers: { "Content-Type": "audio/mpeg" },
//     });

//   } catch (err) {
//     console.error("Deepgram TTS error:", err);
//     return NextResponse.json({ error: "TTS failed", details: String(err) }, { status: 500 });
//   }
// }

