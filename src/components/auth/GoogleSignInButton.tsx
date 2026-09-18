import { useEffect, useRef, useState } from "react";
import { apiPost, ApiError, ApiTimeoutError } from "@/lib/api";
import { saveAuthSession } from "@/lib/authSession";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Sign-In"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type GoogleSignInButtonProps = {
  onSuccess: (redirectTo: string) => void;
  /** Where to send the visitor after a successful sign-in. */
  redirectTo?: string;
};

/**
 * Real Google Sign-In — Google's own hosted button (via Identity Services),
 * verified server-side in AuthService.googleLogin. Renders nothing if
 * VITE_GOOGLE_CLIENT_ID isn't set, same "off until armed" pattern as
 * payments: no broken/fake button shown before it's actually configured.
 */
export const GoogleSignInButton = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (resp) => {
            setError("");
            try {
              const result = await apiPost<{ token: string; user: { fullName: string; email: string } }>(
                "/auth/google",
                { credential: resp.credential }
              );
              // Google-authenticated sessions are remembered, same as a fresh
              // signup — there's no password to prompt "remember me" about.
              saveAuthSession(result.token, result.user, true);
              window.dispatchEvent(new Event("leap:auth-change"));
              const params = new URLSearchParams(window.location.search);
              const next = params.get("next");
              window.location.href = next && next.startsWith("/") ? next : "/dashboard";
            } catch (err) {
              if (err instanceof ApiTimeoutError) {
                setError("The server is waking up — try again in a moment.");
              } else if (err instanceof ApiError) {
                setError(err.message);
              } else {
                setError("Could not sign in with Google. Try again.");
              }
            }
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          width: containerRef.current.offsetWidth || 360,
        });
      })
      .catch(() => setError("Could not load Google Sign-In."));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-4">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-edu-ink/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-edu-ink/40">or continue with</span>
        </div>
      </div>
      <div ref={containerRef} className="flex w-full justify-center" />
      {error && (
        <p className="mt-2 text-center text-[13px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
