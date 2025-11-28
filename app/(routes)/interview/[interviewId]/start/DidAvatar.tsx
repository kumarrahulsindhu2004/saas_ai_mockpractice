"use client";
import { useEffect, useState } from "react";

export default function DidAvatar({
  text,
  onDone,       // 🔥 new callback prop
}: {
  text: string;
  onDone: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => setSpeaking(true);

    utter.onend = () => {
      setSpeaking(false);
      onDone();   // 🔥 notify parent that AI finished speaking
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [text]);

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

        .avatar-circle {
          width: 190px;
          height: 190px;
          margin: auto;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 5px solid transparent;
          background: linear-gradient(#000, #000) padding-box,
                      linear-gradient(135deg, #7c3aed, #4f46e5, #06b6d4) border-box;
          box-shadow: 0 0 35px rgba(99,102,241,0.5);
          animation: avatarGlow 5s infinite linear;
        }

        @keyframes avatarGlow {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.25); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mouth {
          position: absolute;
          bottom: 18px;
          width: 40px;
          height: 12px;
          background: #ff4d6d;
          border-radius: 50px;
          opacity: 0;
          transition: 0.2s;
        }

        .speaking .mouth {
          opacity: 1;
          animation: talk 0.18s infinite alternate;
        }

        @keyframes talk {
          from { height: 6px; }
          to   { height: 20px; }
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
          box-shadow: 0 0 10px rgba(33, 33, 33, 0.4);
        }
      `}</style>

      <div className="avatar-wrapper">
        <div className={`avatar-circle ${speaking ? "speaking" : ""}`}>
          <img src="/AI-talking-avatar.gif" alt="AI Avatar" className="avatar-image" />
          <div className="mouth"></div>
        </div>

        <div className="speech-box">{text}</div>
      </div>
    </>
  );
}
