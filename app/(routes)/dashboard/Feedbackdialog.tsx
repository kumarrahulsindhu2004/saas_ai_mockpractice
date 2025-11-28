"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FeedbackDialogProps {
  interviewId: Id<"InterviewSessionTable">;
}

function Feedbackdialog({ interviewId }: FeedbackDialogProps) {
  const convex = useConvex();
  const [feedback, setFeedback] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFeedback = async () => {
    setLoading(true);
    const data = await convex.query(api.Interview.GetFeedback, { interviewId });
    setFeedback(data ?? null);
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(open) => open && loadFeedback()}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          View Feedback
        </button>
      </DialogTrigger>

     <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-xl"
>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            AI Interview Feedback Report
          </DialogTitle>
          <DialogDescription>
            Here is your automatically generated interview evaluation.
          </DialogDescription>
        </DialogHeader>

        {loading && <p>Loading feedback…</p>}

        {!loading && !feedback && (
          <p className="text-gray-500">Feedback has not been generated yet.</p>
        )}

        {!loading && feedback && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xl font-semibold text-blue-700">
                Overall Score: <span className="font-bold">{feedback.overallScore}/10</span>
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h3 className="text-lg font-semibold mb-1">Summary</h3>
              <p className="text-gray-700">{feedback.summary}</p>
            </div>

            {/* Strengths */}
            {feedback.strengths?.length > 0 && (
              <div className="p-4 bg-green-50 border rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-1">Strengths</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {feedback.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {feedback.weaknesses?.length > 0 && (
              <div className="p-4 bg-red-50 border rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 mb-1">Weaknesses</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {feedback.weaknesses.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {feedback.recommendations?.length > 0 && (
              <div className="p-4 bg-yellow-50 border rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-700 mb-1">Recommendations</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {feedback.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per Question Feedback */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Per-Question Feedback</h3>
              {feedback.perQuestionFeedback?.map((q: any, i: number) => (
                <div key={i} className="border p-4 rounded-lg bg-white shadow-sm">
                  <p className="font-semibold text-gray-900">
                    Q{q.questionNumber}. {q.question}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Your Answer:</span> {q.userAnswer}
                  </p>

                  <p className="mt-2 text-sm text-green-700">
                    <span className="font-medium">Correct Explanation:</span> {q.modelAnswer}
                  </p>

                  <p className="mt-2 text-sm text-blue-700">
                    <span className="font-medium">Feedback:</span> {q.feedback}
                  </p>

                  <p className="mt-3 text-right font-semibold text-purple-700">
                    Score: {q.score}/10
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Feedbackdialog;
