"use client";

let micUnlocked = false;

export async function unlockMicrophone() {
  if (micUnlocked) return;

  await navigator.mediaDevices.getUserMedia({ audio: true });
  micUnlocked = true;

  console.log("[MIC] Permission granted");
}
