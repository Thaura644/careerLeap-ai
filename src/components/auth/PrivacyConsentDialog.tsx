import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Rocket, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PrivacyConsentDialogProps {
  open: boolean;
  /** Accept the policy and continue (right button). */
  onAccept: () => void;
  /** Decline: sign out and leave (left button). */
  onDecline: () => void;
}

/**
 * Privacy-policy consent shown once, right after onboarding completes. The
 * dialog cannot be dismissed — the user either accepts ("Do exploits") or
 * signs out and leaves. Buttons are playfully animated on purpose.
 */
export const PrivacyConsentDialog: React.FC<PrivacyConsentDialogProps> = ({
  open,
  onAccept,
  onDecline,
}) => (
  <AlertDialog open={open}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-leap-purple/10 text-leap-purple animated-pop-in">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <AlertDialogTitle className="text-xl">
          One last thing — our Privacy Policy
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm leading-relaxed">
          Your roadmap, skills, and progress are yours. We only use your data to
          build your career plan and improve the product — we never sell it. By
          continuing you agree to our{" "}
          <Link
            to="/privacy"
            className="font-medium text-leap-purple underline underline-offset-2"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            to="/terms"
            className="font-medium text-leap-purple underline underline-offset-2"
          >
            Terms of Service
          </Link>
          .
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="sm:justify-between gap-3">
        {/* Left: decline — sign out and leave */}
        <Button
          type="button"
          variant="outline"
          onClick={onDecline}
          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40 animated-wiggle"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out and leave
        </Button>

        {/* Right: accept — the playful primary action */}
        <Button
          type="button"
          onClick={onAccept}
          className="flex-1 bg-leap-purple text-white hover:bg-leap-purple/90 animated-floaty"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Do exploits
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
