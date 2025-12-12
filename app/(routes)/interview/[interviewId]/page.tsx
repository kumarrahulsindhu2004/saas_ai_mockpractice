"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

import { checkMicrophone } from "@/lib/checkMicrophone";

function Interview() {
  const { interviewId } = useParams();
  const router = useRouter();

  const [checking, setChecking] = useState(false);
  const [micError, setMicError] = useState("");

  const handleStart = async () => {
    setChecking(true);
    setMicError("");

    const ok = await checkMicrophone();

    if (!ok) {
      setMicError("blocked");
      setChecking(false);
      return;
    }

    router.push(`/interview/${interviewId}/start`);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-14">
      <div className="max-w-3xl w-full">
        <Image
          src="/interview.png"
          alt="interview"
          width={400}
          height={100}
          className="w-full h-auto object-cover"
        />

        <div className="p-6 flex flex-col items-center space-y-5">
          <h2 className="font-bold text-3xl text-center">
            Ready to Start Interview
          </h2>

          <p className="text-gray-500 text-center">
            This interview uses your microphone. Please allow access.
          </p>

          <Button
            onClick={handleStart}
            disabled={checking}
            className="flex items-center gap-2"
          >
            {checking ? "Checking microphone…" : "Start Interview"}
            <ArrowRight />
          </Button>

          {micError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">
                Microphone access is blocked
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Click the 🔒 icon in the address bar</li>
                <li>
                  Set <b>Microphone</b> to <b>Allow</b>
                </li>
                <li>Refresh the page</li>
                <li>Click “Start Interview” again</li>
              </ol>
            </div>
          )}

          <hr className="w-full" />

          <div className="p-6 bg-gray-50 rounded-2xl w-full">
            <h2 className="font-semibold text-2xl">
              Want to send interview link?
            </h2>

            <div className="flex gap-5 mt-2">
              <Input placeholder="Enter email address" />
              <Button>
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;
