

// export const recordAudio = (
//   maxDuration = 10000,
//   silenceTimeout = 2000
// ): Promise<Blob> => {
//   return new Promise(async (resolve, reject) => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//     const mediaRecorder = new MediaRecorder(stream, {
//       mimeType: "audio/webm",
//     });

//     const chunks: BlobPart[] = [];
//     let silenceTimer: NodeJS.Timeout;

//     const audioContext = new AudioContext();
//     const source = audioContext.createMediaStreamSource(stream);
//     const analyser = audioContext.createAnalyser();
//     source.connect(analyser);

//     const data = new Uint8Array(analyser.fftSize);

//     const detectSilence = () => {
//       analyser.getByteTimeDomainData(data);
//       const volume = data.reduce((a, b) => a + Math.abs(b - 128), 0) / data.length;

//       if (volume < 2) {
//         if (!silenceTimer) {
//           silenceTimer = setTimeout(() => {
//             mediaRecorder.stop();
//           }, silenceTimeout);
//         }
//       } else {
//         clearTimeout(silenceTimer);
//         silenceTimer = undefined as any;
//       }

//       if (mediaRecorder.state === "recording") {
//         requestAnimationFrame(detectSilence);
//       }
//     };

//     mediaRecorder.ondataavailable = (e) => {
//       if (e.data.size > 0) chunks.push(e.data);
//     };

//     mediaRecorder.onstop = () => {
//       stream.getTracks().forEach(t => t.stop());
//       resolve(new Blob(chunks, { type: "audio/webm" }));
//     };

//     mediaRecorder.start();
//     detectSilence();

//     setTimeout(() => {
//       if (mediaRecorder.state === "recording") mediaRecorder.stop();
//     }, maxDuration);
//   });
// };


// able code main 









export const recordAudio = (
  maxDuration = 30000,
  silenceTimeout = 2000,
  onSpeechDetected?: () => void
): Promise<Blob | null> => {
  return new Promise(async (resolve) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    const chunks: BlobPart[] = [];
    let silenceTimer: NodeJS.Timeout;
    let spoke = false;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    const detectSilence = () => {
      analyser.getByteTimeDomainData(data);
      const volume =
        data.reduce((a, b) => a + Math.abs(b - 128), 0) / data.length;

      if (volume > 3) {
        spoke = true;
        onSpeechDetected?.();
        clearTimeout(silenceTimer);
      } else if (spoke) {
        silenceTimer = setTimeout(() => mediaRecorder.stop(), silenceTimeout);
      }

      if (mediaRecorder.state === "recording") {
        requestAnimationFrame(detectSilence);
      }
    };

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(spoke ? new Blob(chunks, { type: "audio/webm" }) : null);
    };

    mediaRecorder.start();
    detectSilence();

    setTimeout(() => {
      if (mediaRecorder.state === "recording") mediaRecorder.stop();
    }, maxDuration);
  });
};
