"use client";

let locked = false;

export function startInterviewLock() {
  if (locked) return;
  locked = true;

  // ✅ ENTER FULLSCREEN
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen().catch(() => {});
  }

  // ✅ BLOCK BACK BUTTON
  history.pushState(null, "", location.href);

  const onPopState = () => {
    window.location.href = "/dashboard";
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      window.location.href = "/dashboard";
    }
  };

  const onFullscreenChange = () => {
    if (!document.fullscreenElement) {
      window.location.href = "/dashboard";
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const blockedKeys = [
      "Escape",
      "F11",
      "Alt",
      "Tab",
      "Meta",
      "Control",
      "Shift",
    ];

    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      window.location.href = "/dashboard";
    }
  };

  window.addEventListener("popstate", onPopState);
  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  window.addEventListener("keydown", onKeyDown, true);

  (window as any).__INTERVIEW_CLEANUP__ = () => {
    window.removeEventListener("popstate", onPopState);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    document.removeEventListener("fullscreenchange", onFullscreenChange);
    window.removeEventListener("keydown", onKeyDown, true);
    locked = false;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };
}

export function stopInterviewLock() {
  (window as any).__INTERVIEW_CLEANUP__?.();
}
