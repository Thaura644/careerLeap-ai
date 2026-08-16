
import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  // Where to go after login: the protected route the visitor was turned away
  // from (?next=... from ProtectedRoute, or ?next=/upgrade from the upgrade
  // CTA), falling back to the dashboard. Only internal paths are honored.
  const redirectAfterLogin = (): string => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    const from = (location.state as { from?: string } | null)?.from;
    if (from && from.startsWith("/") && !from.startsWith("//")) return from;
    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ token: string; user: { fullName: string; email: string } }>(
        "/auth/login",
        { email, password }
      );
      saveAuthSession(response.token, response.user, remember);
      window.dispatchEvent(new Event("leap:auth-change"));
      toast({
        title: "Login successful",
        description: "Redirecting...",
      });
      navigate(redirectAfterLogin(), { replace: true });
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        toast({
          title: "Still waking up...",
          description:
            "The free server is starting up — this can take up to a minute. Just click Log in again in a few seconds.",
          variant: "destructive",
        });
      } else if (error instanceof ApiError) {
        // The server's own words — "Invalid email or password" only when the
        // credentials were actually rejected, not for every failure.
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
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
      title="Log in to your account"
      description="Welcome back! Enter your credentials to access your account."
      linkText="Don't have an account? Sign up"
      linkHref="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-muted-foreground"
            >
              Remember me for 30 days
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-none bg-stone-900 text-sm hover:bg-stone-700"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Logging in..." : "Log in"}
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

export default Login;
