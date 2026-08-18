import React, { useState } from "react";
import { X, MonitorSmartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Auto-prompting PWA install banner for iOS Safari only.
 *
 * On Android/Chrome, the browser fires `beforeinstallprompt` and the hook
 * auto-triggers the native install dialog — no UI needed here.
 *
 * On iOS Safari there's no install event, so we show a brief, dismissable
 * banner with instructions. Once dismissed, it stays hidden for the session.
 */
export const InstallAppBanner: React.FC = () => {
  const { isIos, installed } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("leap:ios-pwa-dismissed") === "1"
  );

  // Only show on iOS, not installed, not dismissed
  if (!isIos || installed || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("leap:ios-pwa-dismissed", "1");
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm sm:left-auto sm:right-4">
      <div className="rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <MonitorSmartphone className="mt-0.5 h-5 w-5 shrink-0 text-leap-purple" />
          <div className="flex-1">
            <p className="text-sm font-medium">Add Leap.ai to your Home Screen</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to use Leap.ai like a native app.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/** Backward-compatible alias — the old name is still referenced in some places. */
export const InstallAppButton = InstallAppBanner;
