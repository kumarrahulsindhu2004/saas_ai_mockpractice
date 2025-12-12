const speakText = async (text: string) => {
  const res = await fetch("/api/interview/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return new Promise<void>((resolve) => {
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.play();
  });
};
