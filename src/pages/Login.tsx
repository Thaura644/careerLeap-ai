
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
// Social-login icons; unused while the social buttons are commented out.
// import { Github, Twitter } from "lucide-react";
import { apiPost, ApiTimeoutError } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      localStorage.setItem("leap_token", response.token);
      localStorage.setItem("leap_user", JSON.stringify(response.user));
      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
      });
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        toast({
          title: "Still waking up...",
          description:
            "The free server is starting up — this can take up to a minute. Just click Log in again in a few seconds.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials or the service is unavailable. Please try again.",
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
                className="text-sm text-leap-purple hover:underline"
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
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-gray-500"
            >
              Remember me for 30 days
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-leap-purple hover:bg-opacity-90"
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
