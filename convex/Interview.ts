import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --------------------------------------------------
// Save Interview Questions
// --------------------------------------------------
export const SaveInterviewQuestion = mutation({
  args: {
    question: v.any(),
    uid: v.id("UserTable"),
    resumeUrl: v.union(v.string(), v.null()),
    jobTitle: v.union(v.string(), v.null()),
    jobDescription: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.question ?? [],
      resumeUrl: args.resumeUrl ?? null,
      userId: args.uid,
      status: "draft",
      jobTitle: args.jobTitle ?? null,
      jobDescription: args.jobDescription ?? null,
      feedback: null,
      userAnswers: [],
    });

    return result;
  },
});

// --------------------------------------------------
// Get Interview Questions
// --------------------------------------------------
export const GetInterviewQuestions = query({
  args: {
    interviewRecordsId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.interviewRecordsId);
  },
});

// --------------------------------------------------
// Get All Interviews for a User
// --------------------------------------------------
export const GetUserInterviews = query({
  args: {
    uid: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("userId"), args.uid))
      .order("desc")
      .collect();
  },
});

// --------------------------------------------------
// Save User Answer
// --------------------------------------------------
export const SaveUserAnswer = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    questionNumber: v.number(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return null;

    const updatedAnswers = interview.userAnswers ?? [];

    updatedAnswers.push({
      questionNumber: args.questionNumber,
      answer: args.answer,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.interviewId, {
      userAnswers: updatedAnswers,
    });

    return true;
  },
});

// --------------------------------------------------
// Save AI Feedback (From n8n webhook)
// --------------------------------------------------
export const SaveFeedback = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    feedback: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      feedback: args.feedback,
      status: "completed",
    });

    return { success: true };
  },
});

// --------------------------------------------------
// Get AI Feedback (Used in FeedbackDialog)
// --------------------------------------------------
export const GetFeedback = query({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    return interview?.feedback ?? null;
  },
});
