"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import EmptyState from "./EmptyState";
import CreateInterviewDialog from "../_components/CreateInterviewDialog";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

import Feedbackdialog from "./Feedbackdialog";

interface InterviewItem {
  _id: string;
  _creationTime: number;
  interviewQuestions: any[];
  resumeUrl: string | null;
  userId: string;
  status: string;
  jobTitle: string | null;
  jobDescription: string | null;
}

function Dashboard() {
  const { user } = useUser();
  const convex = useConvex();

  const [interviewList, setInterviewList] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.primaryEmailAddress) {
      loadInterviews();
    }
  }, [user]);

  const loadInterviews = async () => {
    setLoading(true);

    const userRecord = await convex.query(api.users.GetUserByEmail, {
      email: user?.primaryEmailAddress?.emailAddress || "",
    });

    if (!userRecord?._id) {
      setLoading(false);
      return;
    }

    const list = await convex.query(api.Interview.GetUserInterviews, {
      uid: userRecord._id,
    });

    setInterviewList(list);
    setLoading(false);
  };

  return (
    <div className="py-20 px-10 md:px-28 lg:px-44 xl:px-56">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg text-gray-500">My Dashboard</h2>
          <h2 className="text-3xl font-bold">Welcome, {user?.fullName}</h2>
        </div>
        <CreateInterviewDialog />
      </div>

      {/* 🔥 SHIMMER LOADING (when fetching data) */}
      {loading && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border rounded-xl bg-gray-100 shadow relative overflow-hidden"
            >
              {/* shimmer animation */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>

              <div className="h-5 w-40 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* If NO interviews */}
      {!loading && interviewList.length === 0 && <EmptyState />}

      {/* SHOW INTERVIEW LIST */}
      {!loading && interviewList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {interviewList.map((item) => (
  <div
    key={item._id}
    className="p-6 border rounded-xl bg-gray-50 shadow hover:shadow-md transition"
  >
    <h3 className="text-xl font-semibold">
      {item.jobTitle || "Untitled Job"}
    </h3>
    <p className="text-gray-500 mt-1 truncate">
      {item.jobDescription || "No description"}
    </p>

    <p className="text-sm text-gray-400 mt-2">
      Questions: {item.interviewQuestions.length}
    </p>

    {/* Buttons Row */}
    <div className="flex justify-between items-center mt-4">

      {/* Left: Feedback Dialog Button */}
     <Feedbackdialog
  interviewId={item._id as Id<"InterviewSessionTable">}
/>



      {/* Right: Continue Interview Link */}
      <Link
        href={`/interview/${item._id}`}
        className="text-blue-600 font-medium underline"
      >
        Continue Interview →
      </Link>
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
}

export default Dashboard;
