import { useCallback, useEffect, useState } from "react";

/** The browser's install prompt event (Chrome/Edge/Android). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA install prompt state. Chrome/Android fire `beforeinstallprompt` when the
 * app is installable; iOS Safari never does, so on iOS we surface a manual
 * "Add to Home Screen" hint instead. Everything here is real browser state —
 * the button only appears when the browser would actually allow an install.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios =
      /iphone|ipad|ipod/i.test(ua) &&
      // iPadOS 13+ reports as macOS — the touch check catches it.
      ((navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints ?? 0) > 1;
    setIsIos(ios);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
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
