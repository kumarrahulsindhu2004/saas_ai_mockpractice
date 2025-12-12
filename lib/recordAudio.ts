// // lib/recordAudio.ts
// export const recordAudio = (duration = 5000): Promise<Blob> => {
//   return new Promise(async (resolve, reject) => {
//     let stream: MediaStream;

//     try {
//       stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     } catch {
//       reject("MIC_PERMISSION_DENIED");
//       return;
//     }

//     const recorder = new MediaRecorder(stream, {
//       mimeType: "audio/webm",
//     });

//     const chunks: BlobPart[] = [];

//     recorder.ondataavailable = (e) => {
//       if (e.data.size) chunks.push(e.data);
//     };

//     recorder.onstop = () => {
//       stream.getTracks().forEach((t) => t.stop());
//       resolve(new Blob(chunks, { type: "audio/webm" }));
//     };

//     recorder.start();

//     setTimeout(() => {
//       if (recorder.state !== "inactive") recorder.stop();
//     }, duration);
//   });
// };



export const recordAudio = (
  maxDuration = 10000,
  silenceTimeout = 2000
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    const chunks: BlobPart[] = [];
    let silenceTimer: NodeJS.Timeout;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    const detectSilence = () => {
      analyser.getByteTimeDomainData(data);
      const volume = data.reduce((a, b) => a + Math.abs(b - 128), 0) / data.length;

      if (volume < 2) {
        if (!silenceTimer) {
          silenceTimer = setTimeout(() => {
            mediaRecorder.stop();
          }, silenceTimeout);
        }
      } else {
        clearTimeout(silenceTimer);
        silenceTimer = undefined as any;
      }

      if (mediaRecorder.state === "recording") {
        requestAnimationFrame(detectSilence);
      }
    };

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      resolve(new Blob(chunks, { type: "audio/webm" }));
    };

    mediaRecorder.start();
    detectSilence();

    setTimeout(() => {
      if (mediaRecorder.state === "recording") mediaRecorder.stop();
    }, maxDuration);
  });
};
