export async function checkMicrophone(): Promise<boolean> {
  // Browser capability check
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support microphone access.");
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // ✅ Immediately stop tracks — we only needed permission
    stream.getTracks().forEach((t) => t.stop());

    return true;
  } catch (err: any) {
    console.error("[MIC] permission error", err);

    if (err.name === "NotAllowedError") {
      // user denied OR blocked
      return false;
    }

    if (err.name === "NotFoundError") {
      alert("No microphone detected on this device.");
      return false;
    }

    return false;
  }
}
