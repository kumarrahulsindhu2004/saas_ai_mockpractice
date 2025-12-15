"use client";
import React from "react";

export default function DidAvatar({
  text,
  speaking,
}: {
  text: string;
  speaking: boolean;
}) {
  return (
    <>
      <style>{`
        .avatar-wrapper {
          width: 280px;
          padding: 18px;
          border-radius: 20px;
          background: #0d0d0d;
          border: 1px solid #252525;
          box-shadow: 0 0 25px rgba(93, 95, 239, 0.35);
          text-align: center;
          color: #fff;
          user-select: none;
        }

        /* 🔊 Voice Wave Container */
        .wave-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 120px;
          gap: 6px;
          margin: 20px auto;
        }

        .wave-bar {
          width: 6px;
          height: 30px;
          background: linear-gradient(180deg, #7c3aed, #22d3ee);
          border-radius: 6px;
          opacity: 0.5;
        }

        /* 🎤 Animate only when speaking */
        .speaking .wave-bar {
          animation: wave 1.2s infinite ease-in-out;
          opacity: 1;
        }

        .wave-bar:nth-child(1) { animation-delay: 0s; }
        .wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { animation-delay: 0.4s; }
        .wave-bar:nth-child(6) { animation-delay: 0.3s; }
        .wave-bar:nth-child(7) { animation-delay: 0.2s; }
        .wave-bar:nth-child(8) { animation-delay: 0.1s; }

        @keyframes wave {
          0% { height: 20px; }
          50% { height: 70px; }
          100% { height: 20px; }
        }

        .speech-box {
          margin-top: 15px;
          padding: 14px;
          font-size: 15px;
          background: #161616;
          border-radius: 14px;
          border: 1px solid #2d2d2d;
          color: #e4e4e4;
          line-height: 1.5;
        }
      `}</style>

      <div className="avatar-wrapper">
        {/* 🔊 Voice Wave */}
        <div className={`wave-container ${speaking ? "speaking" : ""}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="wave-bar" />
          ))}
        </div>

        {/* 💬 Text */}
        <div className="speech-box">{text}</div>
      </div>
    </>
  );
}
