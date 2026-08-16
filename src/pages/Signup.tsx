
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
// Social-login icons; unused while the social buttons are commented out.
// import { Github, Twitter } from "lucide-react";
import { apiPost, ApiError, ApiTimeoutError } from "@/lib/api";
import { saveAuthSession } from "@/lib/authSession";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // "Skip for now" on onboarding sends the user here to create an account
  // first; after signing up they should go straight to the dashboard instead
  // of being bounced back into onboarding.
  const skippedOnboarding = Boolean((location.state as { skipOnboarding?: boolean } | null)?.skipOnboarding);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") || "");
    const lastName = String(formData.get("lastName") || "");
    const fullName = `${firstName} ${lastName}`.trim();
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ token: string; user: { fullName: string; email: string } }>(
        "/auth/signup",
        { fullName, email, password }
      );
      // New accounts are remembered for 30 days by default — the "remember me"
      // choice is offered at login, and fresh signups shouldn't log you out
      // when the browser closes.
      saveAuthSession(response.token, response.user, true);
      window.dispatchEvent(new Event("leap:auth-change"));
      if (skippedOnboarding) {
        // Entering the app directly is itself consent for the privacy gate —
        // record it so the dialog never blocks a later visit.
        localStorage.setItem("leap_privacy_consent", new Date().toISOString());
        toast({
          title: "Account created successfully",
          description: "Welcome to Leap.ai! Redirecting to your dashboard...",
        });
        navigate("/dashboard");
        return;
      }
      toast({
        title: "Account created successfully",
        description: "Welcome to Leap.ai! Redirecting to onboarding...",
      });
      navigate("/onboarding");
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        toast({
          title: "Still waking up...",
          description:
            "The free server is starting up — this can take up to a minute. Just click Create account again in a few seconds.",
          variant: "destructive",
        });
      } else if (error instanceof ApiError) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup failed",
          description: "Could not reach the server. Check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Start your career acceleration journey with Leap.ai"
      linkText="Already have an account? Log in"
      linkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters and include a number and a symbol
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" className="mt-1" />
            <Label
              htmlFor="terms"
              className="text-sm font-normal text-muted-foreground"
            >
              By creating an account, you agree to our{" "}
              <a href="/terms" className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600">
                Privacy Policy
              </a>
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-none bg-stone-900 text-sm hover:bg-stone-700"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating your account..." : "Create account"}
        </Button>

        {/* Social login is commented out until real OAuth exists (no backend
            endpoints or handlers — the buttons did nothing). Re-enable when
            GitHub/Twitter OAuth is wired end-to-end. */}
        {/* <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" type="button" className="w-full">
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>
        </div> */}
      </form>
    </AuthLayout>
  );
};

export default Signup;
