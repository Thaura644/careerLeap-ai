import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError, ApiTimeoutError } from "@/lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await apiPost<{ ok: boolean; message?: string }>("/auth/reset-password", {
        token,
        password,
      });
      setStatus("done");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setError("The server is waking up — give it a moment and try again.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Check your connection and try again.");
      }
      setStatus("error");
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      description="Set a new password for your Leap.ai account. Use at least 8 characters."
      linkText="Back to login"
      linkHref="/login"
    >
      {!token ? (
        <div className="border border-stone-300 bg-white p-6">
          <p className="text-[14px] leading-relaxed text-stone-600">
            This link is missing its reset token. It may be truncated — open the full link
            from your email, or request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="mt-5 inline-block text-[13px] text-[#C2410C] underline hover:text-stone-900"
          >
            Request a new link
          </Link>
        </div>
      ) : status === "done" ? (
        <div className="border border-stone-300 bg-white p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">Password updated ✓</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
            You can now log in with your new password. Redirecting…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Repeat your new password"
              required
              className="w-full"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {status === "error" && (
            <p className="text-[13px] text-red-700" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={status === "sending"}
            className="h-11 w-full rounded-none bg-stone-900 text-sm hover:bg-stone-700"
          >
            {status === "sending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "sending" ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
