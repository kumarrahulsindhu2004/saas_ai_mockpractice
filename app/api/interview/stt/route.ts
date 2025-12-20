// import { NextRequest, NextResponse } from "next/server";

// export const runtime = "nodejs";

// export async function POST(req: NextRequest) {
//   const start = performance.now();

//   try {
//     const formData = await req.formData();
//     const audioFile = formData.get("audio");

//     if (!audioFile || !(audioFile instanceof File)) {
//       return NextResponse.json({ error: "No audio" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await audioFile.arrayBuffer());

//     const dgStart = performance.now();

//     const dgRes = await fetch(
//       "https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
//           "Content-Type": audioFile.type || "audio/webm",
//         },
//         body: buffer,
//       }
//     );

//     const dgEnd = performance.now();

//     if (!dgRes.ok) {
//       throw new Error(await dgRes.text());
//     }

//     const result = await dgRes.json();
//     const text =
//       result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

//     const end = performance.now();

//     // ✅ TERMINAL LATENCY LOG
//     console.log(
//       `[STT] Deepgram API: ${(dgEnd - dgStart).toFixed(0)} ms | Total: ${(end - start).toFixed(0)} ms`
//     );

//     return NextResponse.json({ text });
//   } catch (err) {
//     console.error("Deepgram STT error:", err);
//     return NextResponse.json({ error: "STT failed" }, { status: 500 });
//   }
// }




import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function retryFetch(url: string, options: any, retries = 2) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log("⚠️ STT retrying...");
      return retryFetch(url, options, retries - 1);
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const start = performance.now();

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "No audio" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // 30sec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const dgStart = performance.now();

    const dgRes = await retryFetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": audioFile.type || "audio/webm",
        },
        body: buffer,
        signal: controller.signal,
      }
    );


    clearTimeout(timeoutId);

    const dgEnd = performance.now();

    if (!dgRes.ok) throw new Error(await dgRes.text());

    const result = await dgRes.json();
    const text = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    const end = performance.now();

    console.log(
      `[STT] Speed: ${(dgEnd - dgStart).toFixed(
        0
      )}ms | Total: ${(end - start).toFixed(0)}ms`
    );

    return NextResponse.json({ text });
  } catch (err) {
    console.error("❌ Deepgram STT error:", err);
    return NextResponse.json({ error: "STT failed" }, { status: 500 });
  }
}
