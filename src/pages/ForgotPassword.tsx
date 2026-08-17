import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError, ApiTimeoutError } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      await apiPost<{ ok: boolean; message?: string }>("/auth/forgot-password", { email });
      setStatus("sent");
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
      title="Reset your password"
      description="Enter the email you signed up with and we'll send you a link to set a new password."
      linkText="Remembered it? Log in"
      linkHref="/login"
    >
      {status === "sent" ? (
        <div className="border border-stone-300 bg-white p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">Check your inbox</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
            If <span className="font-medium text-stone-900">{email}</span> has a Leap.ai
            account, a reset link is on its way. It expires in 1 hour. If you don't see it,
            check your spam folder.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block text-[13px] text-[#C2410C] underline hover:text-stone-900"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {status === "sending" ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
