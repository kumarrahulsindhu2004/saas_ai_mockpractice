import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.DID_API_KEY!;
    const avatarImage = process.env.AVATAR_IMAGE_URL!;

    const auth = Buffer.from(apiKey).toString("base64");

    const response = await fetch("https://api.d-id.com/v1/talks", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_url: avatarImage,
        script: {
          type: "text",
          input: text,
        },
      }),
    });

    const data = await response.json();
    console.log("DID RAW RESPONSE:", data);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
