export const startSpeechToText = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";
    let lastFinalIndex = -1; // ⭐ Track last added final result

    recognition.onresult = (event: any) => {
      for (let i = lastFinalIndex + 1; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          finalTranscript += transcript + " ";
          lastFinalIndex = i; // ⭐ Mark this as processed
        }
      }
    };

    recognition.onerror = (event: any) => {
      reject(event.error);
    };

    recognition.onend = () => {
      resolve(finalTranscript.trim());
    };

    recognition.start();

    // Auto stop in 1 min
    // setTimeout(() => {
    //   try {
    //     recognition.stop();
    //   } catch {}
    // }, 1 * 60 * 1000);

    setTimeout(() => {
  try {
    recognition.stop();
  } catch {}
}, 10 * 1000); // 10 seconds


  });
};
