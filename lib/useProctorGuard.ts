"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useProctorGuard(active: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const element = document.documentElement;

    // ✅ Enter fullscreen (must be user initiated earlier)
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await element.requestFullscreen();
        }
      } catch {}
    };

    enterFullscreen();

    // ❌ EXIT RULES
    const terminate = (reason: string) => {
      console.warn("[PROCTOR VIOLATION]", reason);
      alert("Interview ended due to policy violation.");
      router.replace("/dashboard");
    };

    // ✅ Detect ESC / forbidden keys
    const onKeyDown = (e: KeyboardEvent) => {
      const forbidden =
        e.key === "Escape" ||
        e.key === "F11" ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey;

      if (forbidden) {
        e.preventDefault();
        terminate("Forbidden key pressed");
      }
    };

    // ✅ Detect fullscreen exit
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        terminate("Exited fullscreen");
      }
    };

    // ✅ Detect tab switch
    const onVisibilityChange = () => {
      if (document.hidden) {
        terminate("Tab switched");
      }
    };

    // ✅ Detect app blur (Alt+Tab)
    const onBlur = () => {
      terminate("Window lost focus");
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [active, router]);
}
