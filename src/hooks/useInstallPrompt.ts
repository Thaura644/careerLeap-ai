import { useCallback, useEffect, useRef, useState } from "react";

/** The browser's install prompt event (Chrome/Edge/Android). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA install prompt state. Chrome/Android fire `beforeinstallprompt` when the
 * app is installable; iOS Safari never does. This hook auto-triggers the
 * browser's native install dialog — no hardcoded button needed.
 *
 * The prompt fires once per session at most (tracked via sessionStorage) so
 * it doesn't nag the user on every page load. If they dismiss it, it won't
 * fire again until the next session.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const prompted = useRef(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios =
      /iphone|ipad|ipod/i.test(ua) &&
      // iPadOS 13+ reports as macOS — the touch check catches it.
      ((navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints ?? 0) > 1;
    setIsIos(ios);

    // Only prompt once per session
    const alreadyPrompted = sessionStorage.getItem("leap:pwa-prompted");

    const onPrompt = (event: Event) => {
      event.preventDefault();
      const e = event as BeforeInstallPromptEvent;

      if (alreadyPrompted || prompted.current) return;
      prompted.current = true;
      sessionStorage.setItem("leap:pwa-prompted", "1");

      // Auto-trigger the browser's native install dialog
      e.prompt().then(({ userChoice }) => {
        if (userChoice.outcome === "accepted") {
          setInstalled(true);
        }
        setDeferred(null);
      }).catch(() => {
        // Prompt blocked or failed — silently ignore
      });
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }, [deferred]);

  return {
    /** True when the browser would show an install prompt right now. */
    canPrompt: !!deferred,
    /** True on iOS Safari — show the manual Add-to-Home-Screen hint. */
    isIos,
    /** True after the app has been installed this session. */
    installed,
    promptInstall,
  };
}
