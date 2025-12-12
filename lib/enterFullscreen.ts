export async function enterFullscreen() {
  const el = document.documentElement;

  if (document.fullscreenElement) return;

  try {
    await el.requestFullscreen();
  } catch {
    // fullscreen failed — not fatal
  }
}
