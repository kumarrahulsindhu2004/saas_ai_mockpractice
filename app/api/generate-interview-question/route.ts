// import { NextRequest, NextResponse } from "next/server";
// import ImageKit from "imagekit";

// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
// });

// export const runtime = "nodejs";

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("file") as File | null;
//     const jobTitle = String(formData.get("jobTitle") || "").trim();
//     const jobDescription = String(formData.get("jobDescription") || "").trim();

//     // ✅ STRICT RULE (your requirement)
//     if (!file && (!jobTitle || !jobDescription)) {
//       return NextResponse.json(
//         {
//           error:
//             "Either upload a resume OR provide both job title and job description",
//         },
//         { status: 400 }
//       );
//     }

//     let resumeText = "";
//     let resumeUrl: string | null = null;

//     // ✅ WAY 1: RESUME UPLOADED
//     if (file) {
//       // upload resume
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `resume-${Date.now()}.pdf`,
//         useUniqueFileName: true,
//       });

//       resumeUrl = upload.url;

//       // extract resume text (PDF.co)
//       const extractRes = await fetch(
//   `${process.env.NEXT_PUBLIC_BASE_URL}/api/resume/extract-text`,
//   {
//     method: "POST",
//     body: (() => {
//       const fd = new FormData();
//       fd.append("file", file);
//       return fd;
//     })(),
//   }
// );


//       if (!extractRes.ok) {
//         throw new Error("Resume extract API failed");
//       }

//       const extractData = await extractRes.json();
//       resumeText = extractData?.data || "";
//     }

//     // ✅ CALL OPENAI WORKFLOW
//     const aiRes = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/workflows/generate-question`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           resumeText,
//           jobTitle,
//           jobDescription,
//         }),
//       }
//     );

//     const aiData = await aiRes.json();

//     return NextResponse.json({
//       questions: aiData.questions || [],
//       resumeUrl,
//       resumeText,
//     });
//   } catch (error) {
//     console.error("❌ Generate interview error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate interview" },
//       { status: 500 }
//     );
//   }
// }









export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { v4 as uuid } from "uuid";
import os from "os";
import fs from "fs/promises";
import axios from "axios";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const PDFCO_KEY = process.env.PDFCO_API_KEY!; // ✅ put in .env

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const jobTitle = String(formData.get("jobTitle") || "").trim();
    const jobDescription = String(formData.get("jobDescription") || "").trim();

    // ✅ STRICT VALIDATION
    if (!file && (!jobTitle || !jobDescription)) {
      return NextResponse.json(
        {
          error:
            "Either upload a resume OR provide job title and job description",
        },
        { status: 400 }
      );
    }

    let resumeText = "";
    let resumeUrl: string | null = null;

    // ------------------------------------------------------------------
    // ✅ WAY 1: USER UPLOADS RESUME
    // ------------------------------------------------------------------
    if (file) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF resumes are allowed" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // ✅ Upload resume to ImageKit (for storage)
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `resume-${Date.now()}.pdf`,
        useUniqueFileName: true,
      });

      resumeUrl = upload.url;

      // ✅ Save temp file
      const tempFile = `${os.tmpdir()}/${uuid()}.pdf`;
      await fs.writeFile(tempFile, buffer);

      // ---------------- PDF.co STEP 1: get presigned URL ----------------
      const presignRes = await fetch(
        `https://api.pdf.co/v1/file/upload/get-presigned-url?contenttype=application/pdf&name=${uuid()}.pdf`,
        {
          headers: { "x-api-key": PDFCO_KEY },
        }
      );

      const presignJson = await presignRes.json();
      if (presignJson.error) throw new Error("PDF.co presign failed");

      // ---------------- PDF.co STEP 2: upload PDF ----------------
      await fetch(presignJson.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: buffer,
      });

      // ---------------- PDF.co STEP 3: convert to JSON ----------------
      const convertRes = await fetch(
        "https://api.pdf.co/v1/pdf/convert/to/json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": PDFCO_KEY,
          },
          body: JSON.stringify({
            url: presignJson.url,
            pages: "",
          }),
        }
      );

      const convertJson = await convertRes.json();
      if (convertJson.error) throw new Error("PDF.co convert failed");

      // ---------------- PDF.co STEP 4: fetch JSON ----------------
      const jsonRes = await fetch(convertJson.url);
      const pdfJson = await jsonRes.json();

      // ✅ Extract readable text from JSON
      const rows = pdfJson?.document?.page?.row ?? [];

      for (const row of rows) {
        for (const col of row.column ?? []) {
          if (typeof col?.text?.["#text"] === "string") {
            resumeText += col.text["#text"] + " ";
          }
        }
      }

      resumeText = resumeText.replace(/\s+/g, " ").trim();
    }

    // ------------------------------------------------------------------
    // ✅ STEP 2: OPENAI GENERATION
    // ------------------------------------------------------------------
    const aiRes = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/workflows/generate-question`,
      {
        resumeText,
        jobTitle,
        jobDescription,
      }
    );

    return NextResponse.json({
      questions: aiRes.data?.questions || [],
      resumeUrl,
      resumeText,
    });
  } catch (error: any) {
    console.error("Generate interview error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate interview" },
      { status: 500 }
    );
  }
}
