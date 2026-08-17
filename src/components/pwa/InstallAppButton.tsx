import React, { useState } from "react";
import { Download, Loader2, X, MonitorSmartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";

/**
 * "Install app" control for the PWA. On Android/Chrome it triggers the native
 * install prompt; on iOS Safari (which has no install event) it shows the
 * Share → Add to Home Screen instructions. Hidden entirely once the app is
 * installed or the browser can't install it.
 */
export const InstallAppButton: React.FC<{ variant?: "ghost" | "outline"; className?: string }> = ({
  variant = "ghost",
  className,
}) => {
  const { canPrompt, isIos, installed, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);
  const [prompting, setPrompting] = useState(false);

  if (installed || (!canPrompt && !isIos)) return null;

  const handleClick = async () => {
    if (isIos) {
      setShowIosHint((v) => !v);
      return;
    }
    setPrompting(true);
    try {
      await promptInstall();
    } finally {
      setPrompting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={className}
        onClick={handleClick}
        title={isIos ? "Install this app (Add to Home Screen)" : "Install Leap.ai as an app"}
        aria-label="Install app"
      >
        {prompting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>

      {isIos && showIosHint && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowIosHint(false)} />
          <div className="relative m-4 w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-5 w-5 text-leap-purple" />
                <h3 className="font-semibold">Install Leap.ai</h3>
              </div>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-7 w-7" onClick={() => setShowIosHint(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              iOS doesn't show an install prompt — add the app to your Home Screen manually:
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>Tap the <strong>Share</strong> button in your browser</li>
              <li>Choose <strong>Add to Home Screen</strong></li>
              <li>Tap <strong>Add</strong> — Leap.ai will open like a native app</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
